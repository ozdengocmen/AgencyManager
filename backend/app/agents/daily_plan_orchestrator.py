"""Planner orchestrator flow for Phase 7."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from typing import Literal

from openai import OpenAI

from backend.app.agents.daily_plan_fallback import generate_local_daily_plan
from backend.app.core.config import Settings, get_settings
from backend.app.schemas.agency import AgencyListSort
from backend.app.schemas.agent_api import AgentTraceSummary, DailyPlanRequest
from backend.app.schemas.agent_outputs import DailyVisitPlan
from backend.app.schemas.planning import Coordinates
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
from backend.app.tools.data_access import list_agencies
from backend.app.tools.planning import cluster_agencies, order_visits_by_route


@dataclass(frozen=True)
class OrchestratorResult:
    plan: DailyVisitPlan
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


class DailyPlanOrchestrator:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def generate(self, request: DailyPlanRequest) -> OrchestratorResult:
        warnings: list[str] = []
        runtime = resolve_ai_settings(settings=self._settings)
        initial_provider = "openai" if runtime.enabled and runtime.api_key else "local-fallback"
        initial_model = runtime.model if runtime.enabled and runtime.api_key else "local-fallback-v1"
        trace = AgentTraceRecorder(
            repository=None,
            agent_name="daily-plan",
            request_json=request.model_dump(mode="json"),
            provider=initial_provider,
            model=initial_model,
        )

        if runtime.enabled and runtime.api_key:
            try:
                tool_sequence: list[str]
                plan, tool_sequence, response_id = self._generate_with_openai(request, trace, runtime)
                self._enforce_tool_policy(tool_sequence)
                tools_used = _unique_tools(tool_sequence)
                evidence_map = self._build_evidence_map()
                trace.finalize(status="completed", warnings=warnings, response_id=response_id)
                return OrchestratorResult(
                    plan=plan,
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
            plan, tool_sequence = generate_local_daily_plan(request)
            self._enforce_tool_policy(tool_sequence)
            for step_no, tool_name in enumerate(tool_sequence, start=1):
                trace.record_tool_call(
                    tool_name=tool_name,
                    arguments_json={"fallback_step": step_no},
                    output_json={"source": "local-fallback"},
                    status="ok",
                    error=None,
                    duration_ms=0,
                )
            tools_used = _unique_tools(tool_sequence)
            evidence_map = self._build_evidence_map()
        except AgentPolicyError:
            trace.finalize(status="failed-policy", warnings=warnings, response_id=None)
            raise
        except Exception:
            trace.finalize(status="failed", warnings=warnings, response_id=None)
            raise

        trace.finalize(status="completed-fallback", warnings=warnings, response_id=None)
        return OrchestratorResult(
            plan=plan,
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
        request: DailyPlanRequest,
        trace: AgentTraceRecorder,
        runtime,
    ) -> tuple[DailyVisitPlan, list[str], str | None]:
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
            text={"format": get_responses_api_format("DailyVisitPlan")},
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
                text={"format": get_responses_api_format("DailyVisitPlan")},
            )

        payload = self._extract_output_json(response)
        try:
            validated = validate_contract_output("DailyVisitPlan", payload)
            trace.record_contract_validation(success=True)
        except Exception as exc:
            trace.record_contract_validation(success=False, error=str(exc))
            raise
        plan = DailyVisitPlan.model_validate(validated.model_dump(mode="json"))
        response_id_raw = self._read(response, "id")
        response_id = str(response_id_raw) if response_id_raw else None
        trace.add_event(
            event_type="model_call_end",
            status="ok",
            message=f"Model response completed. response_id={response_id or 'n/a'}.",
        )
        return plan, tools_used, response_id

    @staticmethod
    def _tool_specs() -> list[dict[str, Any]]:
        return [
            {
                "type": "function",
                "name": "list_agencies",
                "description": "List agency candidates with optional filters and sorting.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sales_owner": {"type": ["string", "null"]},
                        "city": {"type": ["string", "null"]},
                        "priority_tier": {"type": ["string", "null"]},
                        "search": {"type": ["string", "null"]},
                        "limit": {"type": "integer", "minimum": 1, "maximum": 200},
                        "sort": {
                            "type": "string",
                            "enum": [
                                "priority_desc",
                                "next_visit_asc",
                                "health_desc",
                                "renewal_risk_first",
                            ],
                        },
                    },
                    "required": [],
                    "additionalProperties": False,
                },
            },
            {
                "type": "function",
                "name": "cluster_agencies",
                "description": "Cluster candidate agencies by geo coordinates.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "agency_ids": {"type": "array", "items": {"type": "string"}, "minItems": 1},
                        "k": {"type": "integer", "minimum": 1},
                        "method": {"type": "string"},
                    },
                    "required": ["agency_ids", "k"],
                    "additionalProperties": False,
                },
            },
            {
                "type": "function",
                "name": "order_visits_by_route",
                "description": "Create a route order and travel estimates for agency ids.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "agency_ids": {"type": "array", "items": {"type": "string"}, "minItems": 1},
                        "start": {
                            "type": ["object", "null"],
                            "properties": {
                                "latitude": {"type": "number"},
                                "longitude": {"type": "number"},
                            },
                            "required": ["latitude", "longitude"],
                            "additionalProperties": False,
                        },
                        "avg_speed_kmh": {"type": "number", "exclusiveMinimum": 0},
                    },
                    "required": ["agency_ids"],
                    "additionalProperties": False,
                },
            },
        ]

    @staticmethod
    def _dispatch_tool_call(call: _FunctionCall) -> dict[str, Any]:
        if call.name == "list_agencies":
            sort_raw = str(call.arguments.get("sort") or AgencyListSort.priority_desc.value)
            sort = AgencyListSort(sort_raw)
            limit = int(call.arguments.get("limit", 200))
            return list_agencies(
                sales_owner=_to_optional_string(call.arguments.get("sales_owner")),
                city=_to_optional_string(call.arguments.get("city")),
                priority_tier=_to_optional_string(call.arguments.get("priority_tier")),
                search=_to_optional_string(call.arguments.get("search")),
                limit=max(1, min(limit, 200)),
                sort=sort,
            ).model_dump(mode="json")

        if call.name == "cluster_agencies":
            agency_ids = call.arguments.get("agency_ids")
            if not isinstance(agency_ids, list):
                raise ValueError("cluster_agencies requires agency_ids as an array")
            k = int(call.arguments.get("k", 1))
            method = str(call.arguments.get("method", "kmeans-lite"))
            return cluster_agencies([str(item) for item in agency_ids], max(1, k), method=method).model_dump(
                mode="json"
            )

        if call.name == "order_visits_by_route":
            agency_ids = call.arguments.get("agency_ids")
            if not isinstance(agency_ids, list):
                raise ValueError("order_visits_by_route requires agency_ids as an array")
            start_payload = call.arguments.get("start")
            start = Coordinates.model_validate(start_payload) if isinstance(start_payload, dict) else None
            avg_speed = float(call.arguments.get("avg_speed_kmh", 28.0))
            return order_visits_by_route(
                [str(item) for item in agency_ids],
                start=start,
                avg_speed_kmh=avg_speed,
            ).model_dump(mode="json")

        raise ValueError(f"Unsupported tool call '{call.name}'")

    @staticmethod
    def _extract_function_calls(response: Any) -> list[_FunctionCall]:
        calls: list[_FunctionCall] = []
        for item in DailyPlanOrchestrator._read(response, "output", []) or []:
            if DailyPlanOrchestrator._read(item, "type") != "function_call":
                continue

            raw_arguments = DailyPlanOrchestrator._read(item, "arguments", "{}")
            arguments = json.loads(raw_arguments or "{}") if isinstance(raw_arguments, str) else raw_arguments
            if not isinstance(arguments, dict):
                raise ValueError("Tool call arguments must be an object")

            call_id = str(
                DailyPlanOrchestrator._read(item, "call_id")
                or DailyPlanOrchestrator._read(item, "id")
                or ""
            )
            if not call_id:
                raise ValueError("Tool call missing call_id")

            calls.append(
                _FunctionCall(
                    call_id=call_id,
                    name=str(DailyPlanOrchestrator._read(item, "name")),
                    arguments=arguments,
                )
            )
        return calls

    @staticmethod
    def _extract_output_json(response: Any) -> dict[str, Any]:
        output_parsed = DailyPlanOrchestrator._read(response, "output_parsed")
        if isinstance(output_parsed, dict):
            return output_parsed

        output_text = DailyPlanOrchestrator._read(response, "output_text")
        if isinstance(output_text, str) and output_text.strip():
            return DailyPlanOrchestrator._parse_json_object(output_text)

        for item in DailyPlanOrchestrator._read(response, "output", []) or []:
            if DailyPlanOrchestrator._read(item, "type") != "message":
                continue
            for content in DailyPlanOrchestrator._read(item, "content", []) or []:
                text = (
                    DailyPlanOrchestrator._read(content, "text")
                    or DailyPlanOrchestrator._read(content, "value")
                    or ""
                )
                if text:
                    return DailyPlanOrchestrator._parse_json_object(str(text))
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
            "You are a field planner for insurance agency visits. "
            "Always call tools in this order: list_agencies, cluster_agencies, order_visits_by_route. "
            "Use numeric outputs from tools and do not invent values. "
            f"Respond in {output_language}. "
            "Return only JSON matching the provided DailyVisitPlan schema."
        )

    @staticmethod
    def _user_prompt(request: DailyPlanRequest) -> str:
        start_text = (
            f"start=({request.start.latitude},{request.start.longitude})" if request.start else "start=auto"
        )
        return (
            f"Build a daily plan for user_id={request.user_id}, plan_date={request.plan_date.isoformat()}, "
            f"max_visits={request.max_visits}, language={request.language}, {start_text}. "
            f"sales_owner={request.sales_owner or 'any'}, city={request.city or 'any'}, "
            f"cluster_count={request.cluster_count or 'auto'}."
        )

    @staticmethod
    def _enforce_tool_policy(tools_used: list[str]) -> None:
        ordered = ["list_agencies", "cluster_agencies", "order_visits_by_route"]
        seen_positions: dict[str, int] = {}
        for idx, tool in enumerate(tools_used):
            if tool not in seen_positions:
                seen_positions[tool] = idx

        missing = [tool for tool in ordered if tool not in seen_positions]
        if missing:
            raise AgentPolicyError(
                code="AGENT_TOOL_POLICY_DAILY_PLAN",
                message=(
                    "Daily plan tool policy violation. "
                    f"Missing required tool calls: {', '.join(missing)}."
                ),
            )

        if not (
            seen_positions["list_agencies"]
            < seen_positions["cluster_agencies"]
            < seen_positions["order_visits_by_route"]
        ):
            raise AgentPolicyError(
                code="AGENT_TOOL_POLICY_DAILY_PLAN",
                message=(
                    "Daily plan tool policy violation. Required order is "
                    "list_agencies -> cluster_agencies -> order_visits_by_route."
                ),
            )

    @staticmethod
    def _build_evidence_map() -> dict[str, list[str]]:
        return {
            "summary.total_visits": [
                "tool:list_agencies.items",
                "tool:cluster_agencies.clusters",
            ],
            "summary.total_distance_km": [
                "tool:order_visits_by_route.total_distance_km",
            ],
            "summary.total_travel_minutes": [
                "tool:order_visits_by_route.total_eta_minutes",
            ],
        }


def _to_optional_string(value: Any) -> str | None:
    if value is None:
        return None
    rendered = str(value).strip()
    return rendered or None


def _unique_tools(tools: list[str]) -> list[str]:
    unique: list[str] = []
    seen: set[str] = set()
    for tool in tools:
        if tool in seen:
            continue
        seen.add(tool)
        unique.append(tool)
    return unique
