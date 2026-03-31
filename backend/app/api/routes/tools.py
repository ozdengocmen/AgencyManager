"""Phase 4 API routes exposing data, planning, and persistence helpers."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from backend.app.schemas.agency import (
    AgencyListResponse,
    AgencyListSort,
    AgencyProfile,
    PortfolioSummary,
)
from backend.app.schemas.persistence import (
    DailyPlanRecord,
    DailyPlanSaveRequest,
    MeetingOutcomeLogRequest,
    MeetingOutcomeRecord,
    MeetingPrepRecord,
    MeetingPrepSaveRequest,
    TaskCreateRequest,
    TaskListResponse,
)
from backend.app.schemas.planning import ClusterRequest, ClusterResult, RoutePlan, RouteRequest
from backend.app.services.workflow_store import get_workflow_store
from backend.app.tools.data_access import (
    get_agency_profile,
    get_portfolio_summary,
    list_agencies,
)
from backend.app.tools.planning import cluster_agencies, order_visits_by_route

router = APIRouter()


@router.get("/agencies", response_model=AgencyListResponse)
def agencies(
    sales_owner: str | None = None,
    city: str | None = None,
    priority_tier: str | None = Query(default=None, pattern="^(A|B|C)$"),
    search: str | None = None,
    limit: int = Query(default=20, ge=1, le=200),
    sort: AgencyListSort = AgencyListSort.next_visit_asc,
) -> AgencyListResponse:
    return list_agencies(
        sales_owner=sales_owner,
        city=city,
        priority_tier=priority_tier,
        search=search,
        limit=limit,
        sort=sort,
    )


@router.get("/agencies/{agency_id}/profile", response_model=AgencyProfile)
def agency_profile(agency_id: str) -> AgencyProfile:
    try:
        return get_agency_profile(agency_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/portfolio/summary", response_model=PortfolioSummary)
def portfolio_summary(sales_owner: str | None = None, city: str | None = None) -> PortfolioSummary:
    return get_portfolio_summary(sales_owner=sales_owner, city=city)


@router.post("/planning/cluster", response_model=ClusterResult)
def plan_clusters(payload: ClusterRequest) -> ClusterResult:
    try:
        return cluster_agencies(payload.agency_ids, payload.k, method=payload.method)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/planning/route", response_model=RoutePlan)
def plan_route(payload: RouteRequest) -> RoutePlan:
    try:
        return order_visits_by_route(
            agency_ids=payload.agency_ids,
            start=payload.start,
            avg_speed_kmh=payload.avg_speed_kmh,
        )
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/persistence/daily-plan", response_model=DailyPlanRecord)
def save_daily_plan(payload: DailyPlanSaveRequest) -> DailyPlanRecord:
    return get_workflow_store().save_daily_plan(payload)


@router.post("/persistence/meeting-prep", response_model=MeetingPrepRecord)
def save_meeting_prep(payload: MeetingPrepSaveRequest) -> MeetingPrepRecord:
    return get_workflow_store().save_meeting_prep(payload)


@router.post("/persistence/meeting-outcome", response_model=MeetingOutcomeRecord)
def save_meeting_outcome(payload: MeetingOutcomeLogRequest) -> MeetingOutcomeRecord:
    return get_workflow_store().log_meeting_outcome(payload)


@router.post("/persistence/tasks", response_model=TaskListResponse)
def create_tasks(payload: TaskCreateRequest) -> TaskListResponse:
    created = get_workflow_store().create_tasks(payload.tasks)
    return TaskListResponse(items=created, total=len(created))


@router.get("/persistence/tasks", response_model=TaskListResponse)
def list_tasks(
    assignee: str | None = Query(default=None, pattern="^(manager|salesperson)$"),
    status: str | None = Query(default=None, pattern="^(pending|in-progress|completed)$"),
    agency_id: str | None = None,
) -> TaskListResponse:
    items = get_workflow_store().list_tasks(assignee=assignee, status=status, agency_id=agency_id)
    return TaskListResponse(items=items, total=len(items))
