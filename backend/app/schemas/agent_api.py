"""Request/response schemas for Phase 6+7 agent endpoints."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from backend.app.schemas.agent_outputs import (
    DailyVisitPlan,
    MeetingExpectedKpi,
    MeetingNarrative,
    OutputLanguage,
    PostMeetingAnalysis,
    RecommendationDecisionStatus,
    Tone,
)
from backend.app.schemas.persistence import UserRole
from backend.app.schemas.planning import Coordinates


class MeetingPrepRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agency_id: str = Field(min_length=2)
    meeting_id: str | None = None
    user_id: UserRole = "salesperson"
    language: OutputLanguage = "en"
    tone: Tone = "consultative"
    additional_context: str = ""
    save_result: bool = True


class MeetingPrepResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    narrative: MeetingNarrative
    provider: Literal["openai", "local-fallback"]
    model: str
    tools_used: list[str]
    run_id: str
    trace_summary: "AgentTraceSummary"
    evidence_map: dict[str, list[str]] = Field(default_factory=dict)
    saved_prep_id: str | None = None
    saved_recommendation_decision_ids: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class MeetingRecommendationInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recommendation_id: str = Field(min_length=2)
    text: str = Field(min_length=8)
    rationale: str = Field(min_length=8)
    expected_kpi: MeetingExpectedKpi
    expected_window_days: int = Field(ge=1, le=180)
    confidence: float = Field(ge=0, le=1)
    decision: RecommendationDecisionStatus = "proposed"


class PostMeetingReviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agency_id: str = Field(min_length=2)
    meeting_id: str | None = None
    user_id: UserRole = "salesperson"
    language: OutputLanguage = "en"
    report_summary: str = ""
    commitments: list[str] = Field(default_factory=list)
    deviations: list[str] = Field(default_factory=list)
    recommendations: list[MeetingRecommendationInput] = Field(default_factory=list)
    additional_context: str = ""
    save_result: bool = True


class PostMeetingReviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    analysis: PostMeetingAnalysis
    provider: Literal["openai", "local-fallback"]
    model: str
    tools_used: list[str]
    run_id: str
    trace_summary: "AgentTraceSummary"
    evidence_map: dict[str, list[str]] = Field(default_factory=dict)
    saved_report_id: str | None = None
    saved_outcome_ids: list[str] = Field(default_factory=list)
    saved_recommendation_decision_ids: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class DailyPlanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UserRole = "salesperson"
    plan_date: date = Field(default_factory=date.today)
    language: OutputLanguage = "en"
    sales_owner: str | None = None
    city: str | None = None
    max_visits: int = Field(default=4, ge=1, le=8)
    cluster_count: int | None = Field(default=None, ge=1, le=6)
    start: Coordinates | None = None
    save_result: bool = True


class DailyPlanResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan: DailyVisitPlan
    provider: Literal["openai", "local-fallback"]
    model: str
    tools_used: list[str]
    run_id: str
    trace_summary: "AgentTraceSummary"
    evidence_map: dict[str, list[str]] = Field(default_factory=dict)
    saved_plan_id: str | None = None
    warnings: list[str] = Field(default_factory=list)


class AgentTraceEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: Literal[
        "model_call_start",
        "model_call_end",
        "tool_call",
        "contract_validation",
        "fallback",
    ]
    status: Literal["ok", "warning", "error"]
    message: str
    timestamp: datetime


class AgentTraceSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str
    tools_used: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    events: list[AgentTraceEvent] = Field(default_factory=list)


class AgentRunMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str
    agent_name: str
    request_json: dict[str, object]
    provider: str
    model: str
    status: str
    fallback_reason: str | None = None
    warnings: list[str] = Field(default_factory=list)
    response_id: str | None = None
    started_at: datetime
    ended_at: datetime | None = None


class AgentToolCallMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str
    step_no: int
    tool_name: str
    arguments_json: dict[str, object]
    output_json: dict[str, object]
    status: str
    error: str | None = None
    duration_ms: int


class AgentRunTraceResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run: AgentRunMetadata
    tool_calls: list[AgentToolCallMetadata]
