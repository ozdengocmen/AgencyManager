"""Repository interfaces for Phase 10 domain modules."""

from __future__ import annotations

from datetime import date
from typing import Protocol

from backend.app.schemas.agency import Agency, AgencyKPI, PortfolioBenchmarks
from backend.app.schemas.auth import AuthUser, SessionRecord
from backend.app.schemas.agent_api import AgentRunMetadata, AgentToolCallMetadata
from backend.app.schemas.persistence import (
    MeetingOutcomeLogRequest,
    MeetingOutcomeRecord,
    MeetingPrepSaveRequest,
    MeetingPrepRecord,
    TaskCreateInput,
    TaskRecord,
)
from backend.app.schemas.workflows import (
    ContactClosureDetail,
    DailyPlanDetail,
    MeetingPrepDetail,
    SystemAISettingsDetail,
    TaskUpdateRequest,
    UserSettingsResponse,
)


class AuthRepository(Protocol):
    def authenticate(self, *, email: str, password: str, role: str) -> AuthUser | None: ...

    def get_user_by_id(self, user_id: str) -> AuthUser | None: ...


class SessionRepository(Protocol):
    def create_session(
        self,
        *,
        user: AuthUser,
        language: str,
        portfolio_scope: str,
        ttl_hours: int,
    ) -> SessionRecord: ...

    def get_active_session(self, token: str) -> SessionRecord | None: ...

    def revoke_session(self, token: str) -> bool: ...


class AgencyRepository(Protocol):
    def list_agencies(self) -> list[Agency]: ...

    def get_agency(self, agency_id: str) -> Agency | None: ...

    def list_kpis(self) -> dict[str, AgencyKPI]: ...

    def get_kpi(self, agency_id: str) -> AgencyKPI | None: ...

    def get_benchmarks(self) -> PortfolioBenchmarks: ...


class DailyPlanRepository(Protocol):
    def create_daily_plan(
        self,
        *,
        user_id: str,
        plan_date: date,
        plan_json: dict[str, object],
        status: str = "draft",
    ) -> DailyPlanDetail: ...

    def update_daily_plan(
        self,
        *,
        plan_id: str,
        user_id: str,
        plan_json: dict[str, object] | None = None,
    ) -> DailyPlanDetail | None: ...

    def get_current_daily_plan(self, *, user_id: str, plan_date: date) -> DailyPlanDetail | None: ...

    def publish_daily_plan(self, *, plan_id: str, user_id: str) -> DailyPlanDetail | None: ...


class MeetingPrepRepository(Protocol):
    def create_meeting_prep(self, payload: MeetingPrepSaveRequest) -> MeetingPrepRecord: ...

    def create_meeting_prep_draft(self, payload: MeetingPrepSaveRequest) -> MeetingPrepDetail: ...

    def update_meeting_prep(
        self,
        *,
        prep_id: str,
        user_id: str,
        narrative_json: dict[str, object] | None = None,
        notes: str | None = None,
        status: str | None = None,
    ) -> MeetingPrepDetail | None: ...

    def list_meeting_preps(self, *, user_id: str, agency_id: str | None = None) -> list[MeetingPrepDetail]: ...


class MeetingOutcomeRepository(Protocol):
    def log_meeting_outcome(self, payload: MeetingOutcomeLogRequest) -> MeetingOutcomeRecord: ...

    def create_contact_closure(
        self,
        *,
        user_id: str,
        agency_id: str,
        contact_reason: str,
        input_mode: str,
        raw_note: str,
        normalized_note: str,
        summary: str,
        key_points: list[str],
        action_items: list[str],
        next_steps: list[str],
        topics: list[str],
        department_notes: dict[str, list[str]],
        quality_score: int,
        validation_status: str,
        validator_version: str,
    ) -> ContactClosureDetail: ...

    def list_contact_closures(
        self,
        *,
        user_id: str,
        agency_id: str | None = None,
    ) -> list[ContactClosureDetail]: ...


class TaskRepository(Protocol):
    def create_tasks(
        self,
        *,
        user_id: str,
        tasks: list[TaskCreateInput],
        source_prep_id: str | None = None,
    ) -> list[TaskRecord]: ...

    def list_tasks(
        self,
        *,
        user_id: str,
        assignee: str | None = None,
        status: str | None = None,
        agency_id: str | None = None,
    ) -> list[TaskRecord]: ...

    def update_task(
        self,
        *,
        user_id: str,
        task_id: str,
        patch: TaskUpdateRequest,
    ) -> TaskRecord | None: ...

    def complete_task(self, *, user_id: str, task_id: str) -> TaskRecord | None: ...


class SettingsRepository(Protocol):
    def get_settings(self, user_id: str) -> UserSettingsResponse: ...

    def update_settings(self, user_id: str, settings_json: dict[str, object]) -> UserSettingsResponse: ...

    def get_system_ai_settings(self) -> SystemAISettingsDetail | None: ...

    def upsert_system_ai_settings(
        self,
        *,
        provider: str,
        enabled: bool,
        model: str,
        base_url: str | None,
        api_key: str | None,
        updated_by: str,
    ) -> SystemAISettingsDetail: ...


class AgentTraceRepository(Protocol):
    def create_agent_run(
        self,
        *,
        agent_name: str,
        request_json: dict[str, object],
        provider: str,
        model: str,
        status: str,
        started_at: str,
    ) -> str: ...

    def update_agent_run(
        self,
        *,
        run_id: str,
        provider: str,
        model: str,
        status: str,
        fallback_reason: str | None,
        warnings: list[str],
        response_id: str | None,
        ended_at: str,
    ) -> None: ...

    def create_agent_tool_call(
        self,
        *,
        run_id: str,
        step_no: int,
        tool_name: str,
        arguments_json: dict[str, object],
        output_json: dict[str, object],
        status: str,
        error: str | None,
        duration_ms: int,
    ) -> None: ...

    def get_agent_run(self, run_id: str) -> AgentRunMetadata | None: ...

    def list_agent_tool_calls(self, run_id: str) -> list[AgentToolCallMetadata]: ...


class RepositoryGateway(
    AuthRepository,
    SessionRepository,
    AgencyRepository,
    DailyPlanRepository,
    MeetingPrepRepository,
    MeetingOutcomeRepository,
    TaskRepository,
    SettingsRepository,
    AgentTraceRepository,
    Protocol,
):
    """Aggregate repository contract used by API routes and services."""
