"""Workflow CRUD schemas for Phase 10 protected APIs."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from backend.app.schemas.persistence import (
    TaskCreateInput,
    TaskListResponse,
    TaskPriority,
    TaskRecord,
    TaskStatus,
    UserRole,
)

DailyPlanStatus = Literal["draft", "published"]
MeetingPrepStatus = Literal["draft", "final"]


class DailyPlanCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan_date: date
    plan_json: dict[str, object]


class DailyPlanUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan_json: dict[str, object] | None = None


class DailyPlanDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    plan_id: str
    user_id: UserRole
    plan_date: date
    plan_json: dict[str, object]
    status: DailyPlanStatus
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None = None


class MeetingPrepCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agency_id: str
    narrative_json: dict[str, object]
    visit_id: str | None = None
    notes: str = ""


class MeetingPrepUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    narrative_json: dict[str, object] | None = None
    notes: str | None = None
    status: MeetingPrepStatus | None = None


class MeetingPrepDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prep_id: str
    user_id: UserRole
    agency_id: str
    visit_id: str | None = None
    narrative_json: dict[str, object]
    notes: str
    status: MeetingPrepStatus
    created_at: datetime
    updated_at: datetime


class MeetingPrepListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[MeetingPrepDetail]
    total: int


class TaskUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None


class TaskBulkFromNarrativeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agency_id: str
    assignee: UserRole
    due_date: date
    narrative_points: list[str] = Field(min_length=1)
    priority: TaskPriority = "medium"


class TaskBulkFromNarrativeResponse(TaskListResponse):
    model_config = ConfigDict(extra="forbid")


class UserSettingsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UserRole
    settings_json: dict[str, object]
    updated_at: datetime


class UserSettingsUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    settings_json: dict[str, object]


class ScopedUserQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UserRole | None = None


__all__ = [
    "DailyPlanCreateRequest",
    "DailyPlanDetail",
    "DailyPlanUpdateRequest",
    "MeetingPrepCreateRequest",
    "MeetingPrepDetail",
    "MeetingPrepListResponse",
    "MeetingPrepUpdateRequest",
    "TaskBulkFromNarrativeRequest",
    "TaskBulkFromNarrativeResponse",
    "TaskCreateInput",
    "TaskRecord",
    "TaskUpdateRequest",
    "UserSettingsResponse",
    "UserSettingsUpdateRequest",
]
