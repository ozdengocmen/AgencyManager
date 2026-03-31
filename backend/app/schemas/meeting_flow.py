"""Meeting flow schemas for Phase 1 data and contract foundation."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from backend.app.schemas.persistence import UserRole

MeetingObjective = Literal["renewal", "claims", "cross-sell", "relationship"]
RecommendationSource = Literal["ai_generated", "peer_enriched", "manager_override"]
RecommendationDecisionStatus = Literal["proposed", "accepted", "modified", "rejected"]
RecommendationEffectiveness = Literal["effective", "ineffective", "inconclusive"]
ValidationReason = Literal["data_issue", "context_mismatch", "execution_failure"]
RecommendationConsistency = Literal["match", "mismatch"]
ExpectedKpi = Literal[
    "renewal_rate",
    "claims_ratio",
    "yoy_growth_motor",
    "yoy_growth_home",
    "yoy_growth_health",
    "overall_health_score",
]


class MeetingFlowModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MeetingBaselineKpis(MeetingFlowModel):
    renewal_rate: float = Field(ge=0, le=100)
    claims_ratio: float = Field(ge=0, le=1.5)
    yoy_growth_motor: float = Field(ge=-100, le=200)
    yoy_growth_home: float = Field(ge=-100, le=200)
    yoy_growth_health: float = Field(ge=-100, le=200)
    overall_health_score: float = Field(ge=0, le=100)


class MeetingRecord(MeetingFlowModel):
    id: str = Field(min_length=2)
    date: date
    agency_id: str = Field(min_length=2)
    salesperson_id: UserRole
    objective: MeetingObjective
    baseline_kpis: MeetingBaselineKpis


class Recommendation(MeetingFlowModel):
    id: str = Field(min_length=2)
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    text: str = Field(min_length=8)
    source: RecommendationSource
    rationale: str = Field(min_length=8)
    expected_kpi: ExpectedKpi
    expected_window_days: int = Field(ge=1, le=180)
    confidence: float = Field(ge=0, le=1)


class PreMeetingBrief(MeetingFlowModel):
    id: str = Field(min_length=2)
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    created_by: UserRole
    key_points: list[str] = Field(min_length=1)
    recommendation_ids: list[str] = Field(min_length=1)
    generated_at: datetime


class RecommendationDecision(MeetingFlowModel):
    id: str = Field(min_length=2)
    recommendation_id: str = Field(min_length=2)
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    decision: RecommendationDecisionStatus
    reason: str = Field(min_length=3)
    edited_text: str | None = None
    decided_by: UserRole
    decided_at: datetime


class PostMeetingReport(MeetingFlowModel):
    id: str = Field(min_length=2)
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    discussion_summary: str = Field(min_length=8)
    commitments: list[str] = Field(default_factory=list)
    deviations: list[str] = Field(default_factory=list)
    recommendation_consistency: dict[str, RecommendationConsistency] = Field(default_factory=dict)
    ai_critique: str = Field(min_length=3)
    created_by: UserRole
    created_at: datetime


class RecommendationComparison(MeetingFlowModel):
    recommendation_id: str = Field(min_length=2)
    planned_recommendation: str = Field(min_length=8)
    meeting_report_evidence: str = Field(min_length=3)
    consistency: RecommendationConsistency
    ai_suggestion: str = Field(min_length=3)


class RecommendationOutcome(MeetingFlowModel):
    id: str = Field(min_length=2)
    recommendation_id: str = Field(min_length=2)
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    baseline_value: float
    t_plus_7_delta: float
    t_plus_30_delta: float
    effectiveness: RecommendationEffectiveness
    assessed_at: date


class ValidationFlag(MeetingFlowModel):
    id: str = Field(min_length=2)
    recommendation_id: str = Field(min_length=2)
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    reason: ValidationReason
    reviewer_id: UserRole
    notes: str = Field(min_length=3)
    created_at: datetime
