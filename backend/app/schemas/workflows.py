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
ContactClosureInputMode = Literal["manual", "speech"]
ContactClosureValidationStatus = Literal["valid", "invalid"]


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


class ContactClosureDepartmentNotes(BaseModel):
    model_config = ConfigDict(extra="forbid")

    technical: list[str] = Field(default_factory=list)
    collections: list[str] = Field(default_factory=list)
    claims: list[str] = Field(default_factory=list)


class ContactClosureAnalysisOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str
    key_points: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)
    department_notes: ContactClosureDepartmentNotes


class ContactClosureValidationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agency_id: str
    contact_reason: str
    input_mode: ContactClosureInputMode
    raw_note: str


class ContactClosureValidationResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_valid: bool
    quality_score: int = Field(ge=0, le=100)
    rejection_reasons: list[str] = Field(default_factory=list)
    normalized_note: str
    summary: str
    key_points: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)
    department_notes: ContactClosureDepartmentNotes
    validator_version: str
    provider: Literal["openai", "local-fallback"]
    model: str
    warnings: list[str] = Field(default_factory=list)


class ContactClosureCreateRequest(ContactClosureValidationRequest):
    model_config = ConfigDict(extra="forbid")


class ContactClosureDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    closure_id: str
    user_id: UserRole
    agency_id: str
    contact_reason: str
    input_mode: ContactClosureInputMode
    raw_note: str
    normalized_note: str
    summary: str
    key_points: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)
    department_notes: ContactClosureDepartmentNotes
    quality_score: int = Field(ge=0, le=100)
    validation_status: ContactClosureValidationStatus
    validator_version: str
    created_at: datetime
    validation_result: ContactClosureValidationResult


class ContactClosureListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ContactClosureDetail]
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


class SystemAISettingsDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: Literal["openai"]
    enabled: bool
    model: str
    base_url: str | None = None
    api_key: str | None = None
    has_api_key: bool
    masked_api_key: str | None = None
    updated_at: datetime
    updated_by: UserRole | None = None


class SystemAISettingsUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: Literal["openai"] = "openai"
    enabled: bool = True
    model: str
    base_url: str | None = None
    api_key: str | None = None
    retain_existing_api_key: bool = True
    clear_api_key: bool = False


class SystemAIModelListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[str] = Field(default_factory=list)
    provider: Literal["openai"]
    source: Literal["live", "fallback"]


class ScopedUserQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UserRole | None = None


__all__ = [
    "DailyPlanCreateRequest",
    "DailyPlanDetail",
    "DailyPlanUpdateRequest",
    "ContactClosureCreateRequest",
    "ContactClosureDetail",
    "ContactClosureListResponse",
    "ContactClosureValidationRequest",
    "ContactClosureValidationResult",
    "MeetingPrepCreateRequest",
    "MeetingPrepDetail",
    "MeetingPrepListResponse",
    "MeetingPrepUpdateRequest",
    "SystemAISettingsDetail",
    "SystemAIModelListResponse",
    "SystemAISettingsUpdateRequest",
    "TaskBulkFromNarrativeRequest",
    "TaskBulkFromNarrativeResponse",
    "TaskCreateInput",
    "TaskRecord",
    "TaskUpdateRequest",
    "UserSettingsResponse",
    "UserSettingsUpdateRequest",
]
