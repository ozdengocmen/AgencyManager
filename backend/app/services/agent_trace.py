"""Phase 12 traceability helpers for agent runs and tool calls."""

from __future__ import annotations

from datetime import datetime, timezone
from time import perf_counter
from typing import Any, Literal

from backend.app.repositories import RepositoryGateway, get_repository_gateway
from backend.app.schemas.agent_api import AgentTraceEvent, AgentTraceSummary

_MAX_PREVIEW_STR_LEN = 280
_MAX_PREVIEW_ITEMS = 16
TraceEventType = Literal[
    "model_call_start",
    "model_call_end",
    "tool_call",
    "contract_validation",
    "fallback",
]
TraceEventStatus = Literal["ok", "warning", "error"]


class AgentPolicyError(ValueError):
    """Explicit tool policy violation raised by agent orchestrators."""

    def __init__(self, *, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class AgentTraceRecorder:
    def __init__(
        self,
        *,
        repository: RepositoryGateway | None,
        agent_name: str,
        request_json: dict[str, object],
        provider: str,
        model: str,
    ) -> None:
        self._repository = repository or get_repository_gateway()
        self.run_id = self._repository.create_agent_run(
            agent_name=agent_name,
            request_json=request_json,
            provider=provider,
            model=model,
            status="running",
            started_at=_utc_now().isoformat(),
        )
        self._provider = provider
        self._model = model
        self._fallback_reason: str | None = None
        self._events: list[AgentTraceEvent] = []
        self._step_no = 1

    def set_provider_model(self, *, provider: str, model: str) -> None:
        self._provider = provider
        self._model = model

    def add_event(
        self,
        *,
        event_type: TraceEventType,
        status: TraceEventStatus,
        message: str,
    ) -> None:
        self._events.append(
            AgentTraceEvent(
                event_type=event_type,
                status=status,
                message=message,
                timestamp=_utc_now(),
            )
        )

    def record_tool_call(
        self,
        *,
        tool_name: str,
        arguments_json: dict[str, object],
        output_json: dict[str, object],
        status: str,
        error: str | None,
        duration_ms: int,
    ) -> None:
        self._repository.create_agent_tool_call(
            run_id=self.run_id,
            step_no=self._step_no,
            tool_name=tool_name,
            arguments_json=_redacted_preview(arguments_json),
            output_json=_redacted_preview(output_json),
            status=status,
            error=error,
            duration_ms=duration_ms,
        )
        self._step_no += 1
        event_status: TraceEventStatus = "ok" if status == "ok" else "error"
        message = (
            f"{tool_name} succeeded in {duration_ms}ms"
            if status == "ok"
            else f"{tool_name} failed in {duration_ms}ms"
        )
        if error:
            message = f"{message}: {error}"
        self.add_event(event_type="tool_call", status=event_status, message=message)

    def record_contract_validation(self, *, success: bool, error: str | None = None) -> None:
        if success:
            self.add_event(
                event_type="contract_validation",
                status="ok",
                message="Structured output contract validation passed.",
            )
            return
        self.add_event(
            event_type="contract_validation",
            status="error",
            message=f"Structured output contract validation failed: {error or 'unknown error'}",
        )

    def mark_fallback(self, reason: str) -> None:
        self._fallback_reason = reason
        self.add_event(
            event_type="fallback",
            status="warning",
            message=f"Fell back to local path due to: {reason}.",
        )

    def finalize(
        self,
        *,
        status: str,
        warnings: list[str],
        response_id: str | None,
    ) -> None:
        self._repository.update_agent_run(
            run_id=self.run_id,
            provider=self._provider,
            model=self._model,
            status=status,
            fallback_reason=self._fallback_reason,
            warnings=warnings,
            response_id=response_id,
            ended_at=_utc_now().isoformat(),
        )

    def build_summary(
        self,
        *,
        tools_used: list[str],
        warnings: list[str],
    ) -> AgentTraceSummary:
        return AgentTraceSummary(
            run_id=self.run_id,
            tools_used=sorted(set(tools_used)),
            warnings=warnings,
            events=self._events,
        )


class Timer:
    def __init__(self) -> None:
        self._started = perf_counter()

    def elapsed_ms(self) -> int:
        elapsed = (perf_counter() - self._started) * 1000
        return max(0, int(round(elapsed)))


def to_trace_payload(value: Any) -> dict[str, object]:
    if isinstance(value, dict):
        return _redacted_preview(value)
    return {"value": _coerce_scalar(value)}


def _redacted_preview(value: dict[str, object]) -> dict[str, object]:
    result: dict[str, object] = {}
    for idx, (key, item) in enumerate(value.items()):
        if idx >= _MAX_PREVIEW_ITEMS:
            result["__truncated__"] = True
            break
        result[key] = _normalize_preview_value(item)
    return result


def _normalize_preview_value(value: Any) -> Any:
    if isinstance(value, dict):
        return _redacted_preview({str(key): cast_value for key, cast_value in value.items()})
    if isinstance(value, list):
        preview = [_normalize_preview_value(item) for item in value[:_MAX_PREVIEW_ITEMS]]
        if len(value) > _MAX_PREVIEW_ITEMS:
            preview.append("...truncated...")
        return preview
    return _coerce_scalar(value)


def _coerce_scalar(value: Any) -> object:
    if isinstance(value, str):
        if len(value) <= _MAX_PREVIEW_STR_LEN:
            return value
        return f"{value[:_MAX_PREVIEW_STR_LEN]}...<truncated>"
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return str(value)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)
