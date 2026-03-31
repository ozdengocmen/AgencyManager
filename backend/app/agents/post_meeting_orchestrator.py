"""Post-meeting comparison orchestrator for Phase 3 backend stubs."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from typing import Literal

from openai import OpenAI

from backend.app.agents.post_meeting_fallback import generate_local_post_meeting_analysis
from backend.app.core.config import Settings, get_settings
from backend.app.schemas.agent_api import AgentTraceSummary, PostMeetingReviewRequest
from backend.app.schemas.agent_outputs import PostMeetingAnalysis
from backend.app.services.agent_trace import (
    AgentPolicyError,
    AgentTraceRecorder,
    Timer,
    to_trace_payload,
)
from backend.app.services.structured_outputs import (
    get_responses_api_format,
    validate_contract_output,
)
from backend.app.tools.data_access import get_agency_profile


@dataclass(frozen=True)
class OrchestratorResult:
    analysis: PostMeetingAnalysis
    provider: Literal["openai", "local-fallback"]
    model: str
    tools_used: list[str]
    warnings: list[str]
    run_id: str
    trace_summary: AgentTraceSummary
    evidence_map: dict[str, list[str]]


@dataclass(frozen=True)
class _FunctionCall:
    call_id: str
    name: str
    arguments: dict[str, Any]


class PostMeetingOrchestrator:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def generate(self, request: PostMeetingReviewRequest) -> OrchestratorResult:
        warnings: list[str] = []
        initial_provider = "openai" if self._settings.openai_api_key else "local-fallback"
        initial_model = self._settings.openai_model if self._settings.openai_api_key else "local-fallback-v1"
        trace = AgentTraceRecorder(
            repository=None,
            agent_name="post-meeting-review",
            request_json=request.model_dump(mode="json"),
            provider=initial_provider,
            model=initial_model,
        )

        if self._settings.openai_api_key:
            try:
                analysis, tools_used, response_id = self._generate_with_openai(request, trace)
                self._enforce_tool_policy(tools_used)
                evidence_map = self._build_evidence_map(analysis)
                trace.finalize(status="completed", warnings=warnings, response_id=response_id)
                return OrchestratorResult(
                    analysis=analysis,
                    provider="openai",
                    model=self._settings.openai_model,
                    tools_used=tools_used,
                    warnings=warnings,
                    run_id=trace.run_id,
                    trace_summary=trace.build_summary(tools_used=tools_used, warnings=warnings),
                    evidence_map=evidence_map,
                )
            except AgentPolicyError:
                trace.finalize(status="failed-policy", warnings=warnings, response_id=None)
                raise
            except Exception as exc:  # pragma: no cover - runtime resilience
                trace.mark_fallback(f"openai_error:{exc.__class__.__name__}")
                error_detail = str(exc).strip()
                warnings.append(
                    "OpenAI orchestration failed "
                    f"({exc.__class__.__name__}: {error_detail or 'no error detail'}); "
                    "used local fallback."
                )
        else:
            trace.mark_fallback("missing_openai_api_key")

        trace.set_provider_model(provider="local-fallback", model="local-fallback-v1")
        try:
            analysis, tools_used = generate_local_post_meeting_analysis(request)
            self._enforce_tool_policy(tools_used)
            for step_no, tool_name in enumerate(tools_used, start=1):
                trace.record_tool_call(
                    tool_name=tool_name,
                    arguments_json={"fallback_step": step_no},
                    output_json={"source": "local-fallback"},
                    status="ok",
                    error=None,
                    duration_ms=0,
                )
            evidence_map = self._build_evidence_map(analysis)
        except AgentPolicyError:
            trace.finalize(status="failed-policy", warnings=warnings, response_id=None)
            raise
        except Exception:
            trace.finalize(status="failed", warnings=warnings, response_id=None)
            raise

        trace.finalize(status="completed-fallback", warnings=warnings, response_id=None)
        return OrchestratorResult(
            analysis=analysis,
            provider="local-fallback",
            model="local-fallback-v1",
            tools_used=tools_used,
            warnings=warnings,
            run_id=trace.run_id,
            trace_summary=trace.build_summary(tools_used=tools_used, warnings=warnings),
            evidence_map=evidence_map,
        )

    def _generate_with_openai(
        self,
        request: PostMeetingReviewRequest,
        trace: AgentTraceRecorder,
    ) -> tuple[PostMeetingAnalysis, list[str], str | None]:
        client = OpenAI(
            api_key=self._settings.openai_api_key,
            base_url=self._settings.openai_base_url or None,
        )
        tools_used: list[str] = []
        trace.add_event(
            event_type="model_call_start",
            status="ok",
            message=f"Calling OpenAI Responses API with model={self._settings.openai_model}.",
        )

        response = client.responses.create(
            model=self._settings.openai_model,
            input=[
                {"role": "system", "content": self._system_prompt(request.language)},
                {"role": "user", "content": self._user_prompt(request)},
            ],
            tools=self._tool_specs(),
            text={"format": get_responses_api_format("PostMeetingAnalysis")},
        )

        for _ in range(6):
            calls = self._extract_function_calls(response)
            if not calls:
                break

            call_outputs: list[dict[str, Any]] = []
            for call in calls:
                timer = Timer()
                try:
                    tool_result = self._dispatch_tool_call(call)
                    tools_used.append(call.name)
                    trace.record_tool_call(
                        tool_name=call.name,
                        arguments_json=to_trace_payload(call.arguments),
                        output_json=to_trace_payload(tool_result),
                        status="ok",
                        error=None,
                        duration_ms=timer.elapsed_ms(),
                    )
                    call_outputs.append(
                        {
                            "type": "function_call_output",
                            "call_id": call.call_id,
                            "output": json.dumps(tool_result, ensure_ascii=True),
                        }
                    )
                except Exception as exc:
                    trace.record_tool_call(
                        tool_name=call.name,
                        arguments_json=to_trace_payload(call.arguments),
                        output_json={},
                        status="error",
                        error=str(exc),
                        duration_ms=timer.elapsed_ms(),
                    )
                    raise

            response = client.responses.create(
                model=self._settings.openai_model,
                previous_response_id=self._read(response, "id"),
                input=call_outputs,
                tools=self._tool_specs(),
                text={"format": get_responses_api_format("PostMeetingAnalysis")},
            )

        payload = self._extract_output_json(response)
        try:
            validated = validate_contract_output("PostMeetingAnalysis", payload)
            trace.record_contract_validation(success=True)
        except Exception as exc:
            trace.record_contract_validation(success=False, error=str(exc))
            raise
        analysis = PostMeetingAnalysis.model_validate(validated.model_dump(mode="json"))
        response_id_raw = self._read(response, "id")
        response_id = str(response_id_raw) if response_id_raw else None
        trace.add_event(
            event_type="model_call_end",
            status="ok",
            message=f"Model response completed. response_id={response_id or 'n/a'}.",
        )
        return analysis, sorted(set(tools_used)), response_id

    @staticmethod
    def _tool_specs() -> list[dict[str, Any]]:
        return [
            {
                "type": "function",
                "name": "get_agency_profile",
                "description": "Get agency profile including KPI baseline metrics for one agency_id.",
                "parameters": {
                    "type": "object",
                    "properties": {"agency_id": {"type": "string"}},
                    "required": ["agency_id"],
                    "additionalProperties": False,
                },
            }
        ]

    @staticmethod
    def _dispatch_tool_call(call: _FunctionCall) -> dict[str, Any]:
        if call.name == "get_agency_profile":
            agency_id = str(call.arguments.get("agency_id", "")).strip()
            if not agency_id:
                raise ValueError("get_agency_profile requires agency_id")
            return get_agency_profile(agency_id).model_dump(mode="json")
        raise ValueError(f"Unsupported tool call '{call.name}'")

    @staticmethod
    def _extract_function_calls(response: Any) -> list[_FunctionCall]:
        calls: list[_FunctionCall] = []
        for item in PostMeetingOrchestrator._read(response, "output", []) or []:
            item_type = PostMeetingOrchestrator._read(item, "type")
            if item_type != "function_call":
                continue

            raw_arguments = PostMeetingOrchestrator._read(item, "arguments", "{}")
            if isinstance(raw_arguments, str):
                arguments = json.loads(raw_arguments or "{}")
            else:
                arguments = raw_arguments or {}
            if not isinstance(arguments, dict):
                raise ValueError("Tool call arguments must be an object")

            call_id = str(
                PostMeetingOrchestrator._read(item, "call_id")
                or PostMeetingOrchestrator._read(item, "id")
                or ""
            )
            if not call_id:
                raise ValueError("Tool call missing call_id")

            calls.append(
                _FunctionCall(
                    call_id=call_id,
                    name=str(PostMeetingOrchestrator._read(item, "name")),
                    arguments=arguments,
                )
            )
        return calls

    @staticmethod
    def _extract_output_json(response: Any) -> dict[str, Any]:
        output_parsed = PostMeetingOrchestrator._read(response, "output_parsed")
        if isinstance(output_parsed, dict):
            return output_parsed

        output_text = PostMeetingOrchestrator._read(response, "output_text")
        if isinstance(output_text, str) and output_text.strip():
            return PostMeetingOrchestrator._parse_json_object(output_text)

        for item in PostMeetingOrchestrator._read(response, "output", []) or []:
            if PostMeetingOrchestrator._read(item, "type") != "message":
                continue
            for content in PostMeetingOrchestrator._read(item, "content", []) or []:
                text = (
                    PostMeetingOrchestrator._read(content, "text")
                    or PostMeetingOrchestrator._read(content, "value")
                    or ""
                )
                if text:
                    return PostMeetingOrchestrator._parse_json_object(str(text))
        raise ValueError("Could not extract JSON output from response")

    @staticmethod
    def _parse_json_object(text: str) -> dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
        parsed = json.loads(cleaned)
        if not isinstance(parsed, dict):
            raise ValueError("Expected JSON object output")
        return parsed

    @staticmethod
    def _read(item: Any, key: str, default: Any = None) -> Any:
        if isinstance(item, dict):
            return item.get(key, default)
        return getattr(item, key, default)

    @staticmethod
    def _system_prompt(language: str) -> str:
        output_language = "Turkish" if language == "tr" else "English"
        return (
            "You are an insurance post-meeting QA assistant. "
            "Always call get_agency_profile for KPI baseline facts and do not invent missing numbers. "
            f"Respond in {output_language}. "
            "Return only JSON matching the provided PostMeetingAnalysis schema."
        )

    @staticmethod
    def _user_prompt(request: PostMeetingReviewRequest) -> str:
        meeting_id = request.meeting_id or f"MEET-{request.agency_id}"
        return (
            f"Create post-meeting analysis for agency_id={request.agency_id}, meeting_id={meeting_id}, "
            f"language={request.language}. "
            f"report_summary={request.report_summary or 'n/a'}."
            + (f" Additional context: {request.additional_context}" if request.additional_context else "")
        )

    @staticmethod
    def _enforce_tool_policy(tools_used: list[str]) -> None:
        required = {"get_agency_profile"}
        missing = sorted(required.difference(set(tools_used)))
        if missing:
            raise AgentPolicyError(
                code="AGENT_TOOL_POLICY_POST_MEETING",
                message=(
                    "Post-meeting tool policy violation. "
                    f"Missing required tool calls: {', '.join(missing)}."
                ),
            )

    @staticmethod
    def _build_evidence_map(analysis: PostMeetingAnalysis) -> dict[str, list[str]]:
        metric_sources = {
            "renewal_rate": [
                "tool:get_agency_profile.kpi.renewal_rate",
                "tool:get_agency_profile.benchmarks.avg_renewal_rate",
            ],
            "claims_ratio": [
                "tool:get_agency_profile.kpi.claims_ratio",
                "tool:get_agency_profile.benchmarks.avg_claims_ratio",
            ],
            "yoy_growth_motor": ["tool:get_agency_profile.kpi.yoy_growth_motor"],
            "yoy_growth_home": ["tool:get_agency_profile.kpi.yoy_growth_home"],
            "yoy_growth_health": ["tool:get_agency_profile.kpi.yoy_growth_health"],
            "overall_health_score": ["tool:get_agency_profile.kpi.overall_health_score"],
        }
        evidence: dict[str, list[str]] = {}
        for comparison in analysis.comparisons:
            evidence[f"recommendation:{comparison.recommendation_id}"] = metric_sources.get(
                comparison.expected_kpi,
                ["tool:get_agency_profile"],
            )
        return evidence
