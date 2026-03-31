"""Structured output contracts for agent responses (Phase 5)."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from backend.app.schemas.persistence import TaskPriority, TaskStatus, UserRole
from backend.app.schemas.planning import Coordinates

Branch = Literal["motor", "home", "health"]
Goal = Literal["renewal", "claims", "cross-sell", "relationship"]
Tone = Literal["friendly", "consultative", "assertive"]
OutputLanguage = Literal["en", "tr"]
RiskSeverity = Literal["high", "medium", "low"]
MeetingExpectedKpi = Literal[
    "renewal_rate",
    "claims_ratio",
    "yoy_growth_motor",
    "yoy_growth_home",
    "yoy_growth_health",
    "overall_health_score",
]
RecommendationDecisionStatus = Literal["proposed", "accepted", "modified", "rejected"]
RecommendationSource = Literal["ai_generated", "peer_enriched", "manager_override"]
RecommendationConsistency = Literal["match", "mismatch"]
RecommendationEffectiveness = Literal["effective", "ineffective", "inconclusive"]


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MetricQuote(ContractModel):
    metric_key: str = Field(min_length=2)
    agency_value: float
    benchmark_value: float | None = None
    delta_vs_benchmark: float | None = None
    quote_text: str = Field(
        min_length=5,
        description="Human-readable statement that cites metric values.",
    )


class AgendaItem(ContractModel):
    order: int = Field(ge=1)
    topic: str = Field(min_length=3)
    objective: str = Field(min_length=3)
    duration_minutes: int = Field(ge=5, le=120)


class RiskItem(ContractModel):
    title: str = Field(min_length=3)
    severity: RiskSeverity
    explanation: str = Field(min_length=8)
    linked_metrics: list[str] = Field(default_factory=list)
    mitigation_actions: list[str] = Field(default_factory=list)


class OpportunityItem(ContractModel):
    branch: Branch
    title: str = Field(min_length=3)
    rationale: str = Field(min_length=8)
    suggested_actions: list[str] = Field(min_length=1)


class MeetingRecommendationItem(ContractModel):
    recommendation_id: str = Field(min_length=2)
    text: str = Field(min_length=8)
    source: RecommendationSource = "ai_generated"
    rationale: str = Field(min_length=8)
    expected_kpi: MeetingExpectedKpi
    expected_window_days: int = Field(ge=1, le=180)
    confidence: float = Field(ge=0, le=1)


class MeetingNarrative(ContractModel):
    agency_id: str
    language: OutputLanguage = "en"
    tone: Tone = "consultative"
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    opening_context: str = Field(min_length=10)
    talk_track: list[str] = Field(min_length=3, max_length=12)
    agenda: list[AgendaItem] = Field(min_length=3, max_length=12)
    questions_to_ask: list[str] = Field(min_length=5, max_length=8)
    risks: list[RiskItem] = Field(default_factory=list)
    opportunities: list[OpportunityItem] = Field(default_factory=list)
    recommendations: list[MeetingRecommendationItem] = Field(min_length=1, max_length=12)
    commitments_next_steps: list[str] = Field(min_length=1)
    metric_quotes: list[MetricQuote] = Field(min_length=1)
    missing_data_notes: list[str] = Field(
        default_factory=list,
        description="Used when data points are unavailable instead of hallucinating values.",
    )


class PostMeetingComparisonItem(ContractModel):
    recommendation_id: str = Field(min_length=2)
    planned_recommendation: str = Field(min_length=8)
    decision: RecommendationDecisionStatus
    expected_kpi: MeetingExpectedKpi
    confidence: float = Field(ge=0, le=1)
    meeting_report_evidence: str = Field(min_length=3)
    consistency: RecommendationConsistency
    consistency_note: str = Field(min_length=8)
    ai_suggestion: str = Field(min_length=8)


class PostMeetingOutcomeItem(ContractModel):
    outcome_id: str = Field(min_length=2)
    recommendation_id: str = Field(min_length=2)
    linked_report_id: str = Field(min_length=2)
    baseline_value: float
    t_plus_7_delta: float
    t_plus_30_delta: float
    effectiveness: RecommendationEffectiveness
    expected_window_days: int = Field(ge=1, le=180)


class PostMeetingAnalysis(ContractModel):
    meeting_id: str = Field(min_length=2)
    agency_id: str = Field(min_length=2)
    report_id: str = Field(min_length=2)
    language: OutputLanguage = "en"
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    report_summary: str = Field(min_length=8)
    commitments: list[str] = Field(default_factory=list)
    deviations: list[str] = Field(default_factory=list)
    consistency_summary: str = Field(min_length=8)
    report_quality_notes: list[str] = Field(default_factory=list)
    comparisons: list[PostMeetingComparisonItem] = Field(min_length=1)
    outcomes: list[PostMeetingOutcomeItem] = Field(min_length=1)
    missing_data_notes: list[str] = Field(default_factory=list)


class DailyVisitPlanItem(ContractModel):
    order: int = Field(ge=1)
    agency_id: str
    agency_name: str = Field(min_length=2)
    city: str = Field(min_length=2)
    district: str = Field(min_length=2)
    goal: Goal
    time_window: str = Field(min_length=3)
    objective: str = Field(min_length=8)
    rationale: list[str] = Field(min_length=1, max_length=6)
    estimated_travel_minutes_from_previous: int = Field(ge=0, le=300)
    estimated_distance_km_from_previous: float = Field(ge=0, le=500)


class DailyVisitPlanSummary(ContractModel):
    total_visits: int = Field(ge=1)
    total_distance_km: float = Field(ge=0)
    total_travel_minutes: int = Field(ge=0)
    optimization_notes: list[str] = Field(default_factory=list)


class DailyVisitPlan(ContractModel):
    user_id: UserRole
    plan_date: date
    start: Coordinates
    visits: list[DailyVisitPlanItem] = Field(min_length=1)
    summary: DailyVisitPlanSummary

    @model_validator(mode="after")
    def validate_visits(self) -> "DailyVisitPlan":
        orders = [visit.order for visit in self.visits]
        expected = list(range(1, len(self.visits) + 1))
        if sorted(orders) != expected:
            raise ValueError("visits.order must be a contiguous sequence starting at 1")
        self.summary.total_visits = len(self.visits)
        return self


class ClusterPlanCluster(ContractModel):
    cluster_id: str = Field(min_length=3)
    label: str = Field(min_length=3)
    centroid: Coordinates
    agency_ids: list[str] = Field(min_length=1)
    recommended_sequence: list[str] = Field(min_length=1)
    estimated_distance_km: float = Field(ge=0)
    estimated_travel_minutes: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_sequence(self) -> "ClusterPlanCluster":
        if not set(self.recommended_sequence).issubset(set(self.agency_ids)):
            raise ValueError("recommended_sequence must only contain ids in agency_ids")
        return self


class ClusterPlan(ContractModel):
    user_id: UserRole
    plan_date: date
    method: str = "kmeans-lite+nearest-neighbor"
    clusters: list[ClusterPlanCluster] = Field(min_length=1)
    notes: list[str] = Field(default_factory=list)


class TaskListItem(ContractModel):
    agency_id: str
    assignee: UserRole
    title: str = Field(min_length=3)
    description: str = ""
    due_date: date
    priority: TaskPriority = "medium"
    status: TaskStatus = "pending"
    reason: str = Field(min_length=5)


class TaskList(ContractModel):
    generated_for: UserRole
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tasks: list[TaskListItem] = Field(min_length=1)
    summary: str = Field(min_length=5)
