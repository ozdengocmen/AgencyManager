"""Schemas for workflow persistence helpers."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

UserRole = Literal["manager", "salesperson"]
TaskStatus = Literal["pending", "in-progress", "completed"]
TaskPriority = Literal["high", "medium", "low"]
RecommendationDecisionStatus = Literal["proposed", "accepted", "modified", "rejected"]
RecommendationConsistency = Literal["match", "mismatch"]
RecommendationEffectiveness = Literal["effective", "ineffective", "inconclusive"]


class DailyPlanSaveRequest(BaseModel):
    user_id: UserRole
    date: date
    plan_json: dict[str, object]


class DailyPlanRecord(DailyPlanSaveRequest):
    plan_id: str
    created_at: datetime


class MeetingPrepSaveRequest(BaseModel):
    user_id: UserRole = "salesperson"
    agency_id: str
    narrative_json: dict[str, object]
    visit_id: str | None = None
    notes: str = ""


class MeetingPrepRecord(MeetingPrepSaveRequest):
    prep_id: str
    created_at: datetime


class MeetingOutcomeLogRequest(BaseModel):
    user_id: UserRole = "salesperson"
    agency_id: str
    outcome: str
    notes: str = ""
    next_steps: list[str] = Field(default_factory=list)


class MeetingOutcomeRecord(MeetingOutcomeLogRequest):
    outcome_id: str
    created_at: datetime


class RecommendationDecisionSaveRequest(BaseModel):
    recommendation_id: str
    meeting_id: str
    agency_id: str
    decision: RecommendationDecisionStatus
    reason: str
    edited_text: str | None = None
    decided_by: UserRole = "salesperson"
    decided_at: datetime


class RecommendationDecisionRecord(RecommendationDecisionSaveRequest):
    decision_id: str


class PostMeetingReportSaveRequest(BaseModel):
    report_id: str | None = None
    meeting_id: str
    agency_id: str
    discussion_summary: str
    commitments: list[str] = Field(default_factory=list)
    deviations: list[str] = Field(default_factory=list)
    recommendation_consistency: dict[str, RecommendationConsistency] = Field(default_factory=dict)
    ai_critique: str
    created_by: UserRole = "salesperson"
    created_at: datetime


class PostMeetingReportRecord(PostMeetingReportSaveRequest):
    report_id: str
    linked_outcome_ids: list[str] = Field(default_factory=list)


class RecommendationOutcomeSaveRequest(BaseModel):
    outcome_id: str | None = None
    recommendation_id: str
    meeting_id: str
    agency_id: str
    baseline_value: float
    t_plus_7_delta: float
    t_plus_30_delta: float
    effectiveness: RecommendationEffectiveness
    assessed_at: date
    linked_report_id: str | None = None


class RecommendationOutcomeRecord(RecommendationOutcomeSaveRequest):
    outcome_id: str


class TaskCreateInput(BaseModel):
    agency_id: str
    assignee: UserRole
    title: str
    description: str = ""
    due_date: date
    priority: TaskPriority = "medium"
    status: TaskStatus = "pending"


class TaskRecord(TaskCreateInput):
    task_id: str
    created_at: datetime


class TaskCreateRequest(BaseModel):
    tasks: list[TaskCreateInput] = Field(min_length=1)


class TaskListResponse(BaseModel):
    items: list[TaskRecord]
    total: int
