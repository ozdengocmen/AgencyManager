"""Protected workflow CRUD routes backed by repository storage."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.app.api.dependencies import (
    AuthContext,
    get_auth_context,
    get_repository,
    resolve_scoped_user,
    scoped_user_query,
)
from backend.app.core.config import get_settings as get_app_settings
from backend.app.repositories import RepositoryGateway
from backend.app.services.contact_closure import validate_contact_closure_note
from backend.app.services.ai_settings import build_system_ai_settings_detail, list_available_models
from backend.app.schemas.persistence import (
    MeetingOutcomeLogRequest,
    MeetingOutcomeRecord,
    MeetingPrepSaveRequest,
    TaskCreateInput,
    TaskCreateRequest,
    TaskListResponse,
    TaskRecord,
)
from backend.app.schemas.workflows import (
    ContactClosureCreateRequest,
    ContactClosureDetail,
    ContactClosureListResponse,
    ContactClosureValidationRequest,
    ContactClosureValidationResult,
    DailyPlanCreateRequest,
    DailyPlanDetail,
    DailyPlanUpdateRequest,
    MeetingPrepCreateRequest,
    MeetingPrepDetail,
    MeetingPrepListResponse,
    MeetingPrepUpdateRequest,
    SystemAISettingsDetail,
    SystemAIModelListResponse,
    SystemAISettingsUpdateRequest,
    TaskBulkFromNarrativeRequest,
    TaskBulkFromNarrativeResponse,
    TaskUpdateRequest,
    UserSettingsResponse,
    UserSettingsUpdateRequest,
)

router = APIRouter()


@router.get("/system/ai-settings", response_model=SystemAISettingsDetail)
def get_system_ai_settings(
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> SystemAISettingsDetail:
    if context.user.role != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    current = repository.get_system_ai_settings()
    if current:
        return current

    return build_system_ai_settings_detail(
        provider="openai",
        enabled=True,
        model="gpt-4.1-mini",
        base_url=None,
        api_key=None,
        updated_at=context.session.created_at,
        updated_by=context.user.user_id,
    )


@router.put("/system/ai-settings", response_model=SystemAISettingsDetail)
def update_system_ai_settings(
    payload: SystemAISettingsUpdateRequest,
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> SystemAISettingsDetail:
    if context.user.role != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    existing = repository.get_system_ai_settings()
    next_api_key = payload.api_key.strip() if isinstance(payload.api_key, str) else None
    if payload.clear_api_key:
        next_api_key = None
    elif payload.retain_existing_api_key and not next_api_key:
        next_api_key = existing.api_key if existing and existing.has_api_key else None

    return repository.upsert_system_ai_settings(
        provider=payload.provider,
        enabled=payload.enabled,
        model=payload.model.strip(),
        base_url=payload.base_url.strip() if isinstance(payload.base_url, str) and payload.base_url.strip() else None,
        api_key=next_api_key,
        updated_by=context.user.user_id,
    )


@router.get("/system/ai-models", response_model=SystemAIModelListResponse)
def get_system_ai_models(
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> SystemAIModelListResponse:
    if context.user.role != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    return list_available_models(settings=get_app_settings(), repository=repository)


@router.post("/contact-closures/validate", response_model=ContactClosureValidationResult)
def validate_contact_closure(
    payload: ContactClosureValidationRequest,
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> ContactClosureValidationResult:
    del context
    return ContactClosureValidationResult.model_validate(
        validate_contact_closure_note(
            raw_note=payload.raw_note,
            contact_reason=payload.contact_reason,
            input_mode=payload.input_mode,
            settings=get_app_settings(),
            repository=repository,
        )
    )


@router.post("/contact-closures", response_model=ContactClosureDetail)
def create_contact_closure(
    payload: ContactClosureCreateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> ContactClosureDetail:
    target_user = resolve_scoped_user(context, user_id)
    validation = ContactClosureValidationResult.model_validate(
        validate_contact_closure_note(
            raw_note=payload.raw_note,
            contact_reason=payload.contact_reason,
            input_mode=payload.input_mode,
            settings=get_app_settings(),
            repository=repository,
        )
    )
    if not validation.is_valid:
        raise HTTPException(status_code=422, detail="Contact closure note did not pass validation")

    return repository.create_contact_closure(
        user_id=target_user,
        agency_id=payload.agency_id,
        contact_reason=payload.contact_reason,
        input_mode=payload.input_mode,
        raw_note=payload.raw_note,
        normalized_note=validation.normalized_note,
        summary=validation.summary,
        key_points=validation.key_points,
        action_items=validation.action_items,
        next_steps=validation.next_steps,
        topics=validation.topics,
        department_notes=validation.department_notes.model_dump(),
        quality_score=validation.quality_score,
        validation_status="valid",
        validator_version=validation.validator_version,
    )


@router.get("/contact-closures", response_model=ContactClosureListResponse)
def list_contact_closures(
    agency_id: str | None = Query(default=None),
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> ContactClosureListResponse:
    target_user = resolve_scoped_user(context, user_id)
    items = repository.list_contact_closures(user_id=target_user, agency_id=agency_id)
    return ContactClosureListResponse(items=items, total=len(items))


@router.post("/daily-plans", response_model=DailyPlanDetail)
def create_daily_plan(
    payload: DailyPlanCreateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> DailyPlanDetail:
    target_user = resolve_scoped_user(context, user_id)
    return repository.create_daily_plan(
        user_id=target_user,
        plan_date=payload.plan_date,
        plan_json=payload.plan_json,
        status="draft",
    )


@router.patch("/daily-plans/{plan_id}", response_model=DailyPlanDetail)
def update_daily_plan(
    plan_id: str,
    payload: DailyPlanUpdateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> DailyPlanDetail:
    target_user = resolve_scoped_user(context, user_id)
    updated = repository.update_daily_plan(
        plan_id=plan_id,
        user_id=target_user,
        plan_json=payload.plan_json,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Daily plan '{plan_id}' not found")
    return updated


@router.get("/daily-plans/current", response_model=DailyPlanDetail)
def get_current_daily_plan(
    plan_date: date,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> DailyPlanDetail:
    target_user = resolve_scoped_user(context, user_id)
    current = repository.get_current_daily_plan(user_id=target_user, plan_date=plan_date)
    if current:
        return current

    # First load for a given day should be idempotent for clients; create an empty draft instead of 404.
    return repository.create_daily_plan(
        user_id=target_user,
        plan_date=plan_date,
        plan_json={"visits": [], "checklist_by_visit": {}, "outcomes_by_visit": {}},
        status="draft",
    )


@router.post("/daily-plans/{plan_id}/publish", response_model=DailyPlanDetail)
def publish_daily_plan(
    plan_id: str,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> DailyPlanDetail:
    target_user = resolve_scoped_user(context, user_id)
    published = repository.publish_daily_plan(plan_id=plan_id, user_id=target_user)
    if not published:
        raise HTTPException(status_code=404, detail=f"Daily plan '{plan_id}' not found")
    return published


@router.post("/meeting-preps", response_model=MeetingPrepDetail)
def create_meeting_prep(
    payload: MeetingPrepCreateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> MeetingPrepDetail:
    target_user = resolve_scoped_user(context, user_id)
    return repository.create_meeting_prep_draft(
        MeetingPrepSaveRequest(
            user_id=target_user,
            agency_id=payload.agency_id,
            narrative_json=payload.narrative_json,
            visit_id=payload.visit_id,
            notes=payload.notes,
        )
    )


@router.patch("/meeting-preps/{prep_id}", response_model=MeetingPrepDetail)
def update_meeting_prep(
    prep_id: str,
    payload: MeetingPrepUpdateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> MeetingPrepDetail:
    target_user = resolve_scoped_user(context, user_id)
    updated = repository.update_meeting_prep(
        prep_id=prep_id,
        user_id=target_user,
        narrative_json=payload.narrative_json,
        notes=payload.notes,
        status=payload.status,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Meeting prep '{prep_id}' not found")
    return updated


@router.get("/meeting-preps", response_model=MeetingPrepListResponse)
def list_meeting_preps(
    agency_id: str | None = Query(default=None),
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> MeetingPrepListResponse:
    target_user = resolve_scoped_user(context, user_id)
    items = repository.list_meeting_preps(user_id=target_user, agency_id=agency_id)
    return MeetingPrepListResponse(items=items, total=len(items))


@router.post("/meeting-outcomes", response_model=MeetingOutcomeRecord)
def create_meeting_outcome(
    payload: MeetingOutcomeLogRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> MeetingOutcomeRecord:
    target_user = resolve_scoped_user(context, user_id)
    scoped_payload = payload.model_copy(update={"user_id": target_user})
    return repository.log_meeting_outcome(scoped_payload)


@router.post("/tasks", response_model=TaskListResponse)
def create_tasks(
    payload: TaskCreateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> TaskListResponse:
    target_user = resolve_scoped_user(context, user_id)

    tasks = payload.tasks
    if context.user.role != "manager":
        tasks = [task.model_copy(update={"assignee": target_user}) for task in payload.tasks]

    created = repository.create_tasks(user_id=target_user, tasks=tasks)
    return TaskListResponse(items=created, total=len(created))


@router.get("/tasks", response_model=TaskListResponse)
def list_tasks(
    assignee: str | None = Query(default=None, pattern="^(manager|salesperson)$"),
    status: str | None = Query(default=None, pattern="^(pending|in-progress|completed)$"),
    agency_id: str | None = None,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> TaskListResponse:
    target_user = resolve_scoped_user(context, user_id)
    effective_assignee = assignee
    if context.user.role != "manager":
        effective_assignee = target_user

    items = repository.list_tasks(
        user_id=target_user,
        assignee=effective_assignee,
        status=status,
        agency_id=agency_id,
    )
    return TaskListResponse(items=items, total=len(items))


@router.patch("/tasks/{task_id}", response_model=TaskRecord)
def update_task(
    task_id: str,
    payload: TaskUpdateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> TaskRecord:
    target_user = resolve_scoped_user(context, user_id)
    updated = repository.update_task(user_id=target_user, task_id=task_id, patch=payload)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    return updated


@router.post("/tasks/{task_id}/complete", response_model=TaskRecord)
def complete_task(
    task_id: str,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> TaskRecord:
    target_user = resolve_scoped_user(context, user_id)
    completed = repository.complete_task(user_id=target_user, task_id=task_id)
    if not completed:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    return completed


@router.post("/tasks/bulk-from-narrative", response_model=TaskBulkFromNarrativeResponse)
def bulk_create_tasks_from_narrative(
    payload: TaskBulkFromNarrativeRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> TaskBulkFromNarrativeResponse:
    target_user = resolve_scoped_user(context, user_id)
    assignee = payload.assignee if context.user.role == "manager" else target_user

    tasks = [
        TaskCreateInput(
            agency_id=payload.agency_id,
            assignee=assignee,
            title=point.strip(),
            description="Generated from narrative",
            due_date=payload.due_date,
            priority=payload.priority,
            status="pending",
        )
        for point in payload.narrative_points
        if point.strip()
    ]
    created = repository.create_tasks(user_id=target_user, tasks=tasks)
    return TaskBulkFromNarrativeResponse(items=created, total=len(created))


@router.get("/settings", response_model=UserSettingsResponse)
def get_settings(
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> UserSettingsResponse:
    target_user = resolve_scoped_user(context, user_id)
    try:
        return repository.get_settings(target_user)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/settings", response_model=UserSettingsResponse)
def update_settings(
    payload: UserSettingsUpdateRequest,
    user_id: str | None = Depends(scoped_user_query),
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> UserSettingsResponse:
    target_user = resolve_scoped_user(context, user_id)
    return repository.update_settings(target_user, payload.settings_json)
