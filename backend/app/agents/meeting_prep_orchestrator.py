"""Single-orchestrator meeting prep flow for Phase 6."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from typing import Literal

from openai import OpenAI

from backend.app.core.config import Settings, get_settings
from backend.app.agents.meeting_prep_fallback import generate_local_meeting_narrative
from backend.app.schemas.agent_api import AgentTraceSummary, MeetingPrepRequest
from backend.app.schemas.agent_outputs import MeetingNarrative
from backend.app.services.agent_trace import (
    AgentPolicyError,
    AgentTraceRecorder,
    Timer,
    to_trace_payload,
)
from backend.app.services.ai_settings import resolve_ai_settings
from backend.app.services.structured_outputs import (
    get_responses_api_format,
    validate_contract_output,
)
from backend.app.tools.data_access import get_agency_profile, get_portfolio_summary


@dataclass(frozen=True)
class OrchestratorResult:
    narrative: MeetingNarrative
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


class MeetingPrepOrchestrator:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def generate(self, request: MeetingPrepRequest) -> OrchestratorResult:
        warnings: list[str] = []
        runtime = resolve_ai_settings(settings=self._settings)
        initial_provider = "openai" if runtime.enabled and runtime.api_key else "local-fallback"
        initial_model = runtime.model if runtime.enabled and runtime.api_key else "local-fallback-v1"
        trace = AgentTraceRecorder(
            repository=None,
            agent_name="meeting-prep",
            request_json=request.model_dump(mode="json"),
            provider=initial_provider,
            model=initial_model,
        )

        if runtime.enabled and runtime.api_key:
            try:
                narrative, tools_used, response_id = self._generate_with_openai(request, trace, runtime)
                self._enforce_tool_policy(tools_used)
                evidence_map = self._build_evidence_map(narrative)
                trace.finalize(status="completed", warnings=warnings, response_id=response_id)
                return OrchestratorResult(
                    narrative=narrative,
                    provider="openai",
                    model=runtime.model,
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
            narrative, tools_used = generate_local_meeting_narrative(request)
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
            evidence_map = self._build_evidence_map(narrative)
        except AgentPolicyError:
            trace.finalize(status="failed-policy", warnings=warnings, response_id=None)
            raise
        except Exception:
            trace.finalize(status="failed", warnings=warnings, response_id=None)
            raise

        trace.finalize(status="completed-fallback", warnings=warnings, response_id=None)
        return OrchestratorResult(
            narrative=narrative,
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
        request: MeetingPrepRequest,
        trace: AgentTraceRecorder,
        runtime,
    ) -> tuple[MeetingNarrative, list[str], str | None]:
        client = OpenAI(
            api_key=runtime.api_key,
            base_url=runtime.base_url or None,
        )
        tools_used: list[str] = []
        trace.add_event(
            event_type="model_call_start",
            status="ok",
            message=f"Calling OpenAI Responses API with model={runtime.model}.",
        )

        response = client.responses.create(
            model=runtime.model,
            input=[
                {"role": "system", "content": self._system_prompt(request.language)},
                {"role": "user", "content": self._user_prompt(request)},
            ],
            tools=self._tool_specs(),
            text={"format": get_responses_api_format("MeetingNarrative")},
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
                model=runtime.model,
                previous_response_id=self._read(response, "id"),
                input=call_outputs,
                tools=self._tool_specs(),
                text={"format": get_responses_api_format("MeetingNarrative")},
            )

        payload = self._extract_output_json(response)
        try:
            validated = validate_contract_output("MeetingNarrative", payload)
            trace.record_contract_validation(success=True)
        except Exception as exc:
            trace.record_contract_validation(success=False, error=str(exc))
            raise
        narrative = MeetingNarrative.model_validate(validated.model_dump(mode="json"))
        response_id_raw = self._read(response, "id")
        response_id = str(response_id_raw) if response_id_raw else None
        trace.add_event(
            event_type="model_call_end",
            status="ok",
            message=f"Model response completed. response_id={response_id or 'n/a'}.",
        )
        return narrative, sorted(set(tools_used)), response_id

    @staticmethod
    def _tool_specs() -> list[dict[str, Any]]:
        return [
            {
                "type": "function",
                "name": "get_agency_profile",
                "description": (
                    "Get agency profile including latest KPIs and portfolio benchmarks "
                    "for one agency_id."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {"agency_id": {"type": "string"}},
                    "required": ["agency_id"],
                    "additionalProperties": False,
                },
            },
            {
                "type": "function",
                "name": "get_portfolio_summary",
                "description": "Get aggregate portfolio summary filtered by sales_owner and city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sales_owner": {"type": ["string", "null"]},
                        "city": {"type": ["string", "null"]},
                    },
                    "required": [],
                    "additionalProperties": False,
                },
            },
        ]

    @staticmethod
    def _dispatch_tool_call(call: _FunctionCall) -> dict[str, Any]:
        if call.name == "get_agency_profile":
            agency_id = str(call.arguments.get("agency_id", "")).strip()
            if not agency_id:
                raise ValueError("get_agency_profile requires agency_id")
            return get_agency_profile(agency_id).model_dump(mode="json")
        if call.name == "get_portfolio_summary":
            sales_owner = call.arguments.get("sales_owner")
            city = call.arguments.get("city")
            return get_portfolio_summary(
                sales_owner=str(sales_owner) if sales_owner else None,
                city=str(city) if city else None,
            ).model_dump(mode="json")
        raise ValueError(f"Unsupported tool call '{call.name}'")

    @staticmethod
    def _extract_function_calls(response: Any) -> list[_FunctionCall]:
        calls: list[_FunctionCall] = []
        for item in MeetingPrepOrchestrator._read(response, "output", []) or []:
            item_type = MeetingPrepOrchestrator._read(item, "type")
            if item_type != "function_call":
                continue

            raw_arguments = MeetingPrepOrchestrator._read(item, "arguments", "{}")
            if isinstance(raw_arguments, str):
                arguments = json.loads(raw_arguments or "{}")
            else:
                arguments = raw_arguments or {}
            if not isinstance(arguments, dict):
                raise ValueError("Tool call arguments must be an object")

            call_id = str(
                MeetingPrepOrchestrator._read(item, "call_id")
                or MeetingPrepOrchestrator._read(item, "id")
                or ""
            )
            if not call_id:
                raise ValueError("Tool call missing call_id")

            calls.append(
                _FunctionCall(
                    call_id=call_id,
                    name=str(MeetingPrepOrchestrator._read(item, "name")),
                    arguments=arguments,
                )
            )
        return calls

    @staticmethod
    def _extract_output_json(response: Any) -> dict[str, Any]:
        output_parsed = MeetingPrepOrchestrator._read(response, "output_parsed")
        if isinstance(output_parsed, dict):
            return output_parsed

        output_text = MeetingPrepOrchestrator._read(response, "output_text")
        if isinstance(output_text, str) and output_text.strip():
            return MeetingPrepOrchestrator._parse_json_object(output_text)

        for item in MeetingPrepOrchestrator._read(response, "output", []) or []:
            if MeetingPrepOrchestrator._read(item, "type") != "message":
                continue
            for content in MeetingPrepOrchestrator._read(item, "content", []) or []:
                text = (
                    MeetingPrepOrchestrator._read(content, "text")
                    or MeetingPrepOrchestrator._read(content, "value")
                    or ""
                )
                if text:
                    return MeetingPrepOrchestrator._parse_json_object(str(text))
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
            "You are an insurance agency portfolio assistant. "
            "Always call tools for numeric facts and never invent missing data. "
            f"Respond in {output_language}. "
            "Return only JSON matching the provided MeetingNarrative schema."
        )

    @staticmethod
    def _user_prompt(request: MeetingPrepRequest) -> str:
        meeting_text = f" meeting_id={request.meeting_id}." if request.meeting_id else ""
        return (
            f"Create meeting prep for agency_id={request.agency_id}. "
            f"tone={request.tone}, language={request.language}. "
            f"You must include metric quotes with benchmark deltas.{meeting_text}"
            + (f" Additional context: {request.additional_context}" if request.additional_context else "")
        )

    @staticmethod
    def _enforce_tool_policy(tools_used: list[str]) -> None:
        required = {"get_agency_profile"}
        missing = sorted(required.difference(set(tools_used)))
        if missing:
            raise AgentPolicyError(
                code="AGENT_TOOL_POLICY_MEETING_PREP",
                message=(
                    "Meeting prep tool policy violation. "
                    f"Missing required tool calls: {', '.join(missing)}."
                ),
            )

    @staticmethod
    def _build_evidence_map(narrative: MeetingNarrative) -> dict[str, list[str]]:
        metric_sources = {
            "renewal_rate": [
                "tool:get_agency_profile.kpi.renewal_rate",
                "tool:get_agency_profile.benchmarks.avg_renewal_rate",
            ],
            "claims_ratio": [
                "tool:get_agency_profile.kpi.claims_ratio",
                "tool:get_agency_profile.benchmarks.avg_claims_ratio",
            ],
            "overall_health_score": [
                "tool:get_agency_profile.kpi.overall_health_score",
                "tool:get_agency_profile.benchmarks.avg_overall_health_score",
            ],
            "portfolio_total_revenue": [
                "tool:get_portfolio_summary.total_revenue",
            ],
        }
        evidence: dict[str, list[str]] = {}
        for quote in narrative.metric_quotes:
            evidence[quote.metric_key] = metric_sources.get(
                quote.metric_key,
                ["tool:get_agency_profile"],
            )
        for recommendation in narrative.recommendations:
            evidence[f"recommendation:{recommendation.recommendation_id}"] = metric_sources.get(
                recommendation.expected_kpi,
                ["tool:get_agency_profile"],
            )
        return evidence
