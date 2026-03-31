"""Local deterministic fallback for daily planner generation (Phase 7)."""

from __future__ import annotations

from datetime import date
from typing import Any

from backend.app.schemas.agency import AgencyListItem, AgencyListSort
from backend.app.schemas.agent_api import DailyPlanRequest
from backend.app.schemas.agent_outputs import DailyVisitPlan, Goal
from backend.app.schemas.planning import Cluster, RoutePlan
from backend.app.services.structured_outputs import validate_contract_output
from backend.app.tools.data_access import list_agencies
from backend.app.tools.planning import cluster_agencies, order_visits_by_route


def generate_local_daily_plan(request: DailyPlanRequest) -> tuple[DailyVisitPlan, list[str]]:
    agencies = list_agencies(
        sales_owner=request.sales_owner,
        city=request.city,
        limit=200,
        sort=AgencyListSort.priority_desc,
    )
    if not agencies.items:
        raise ValueError("No agencies found for the provided filters")

    candidates = _select_candidates(agencies.items, request.plan_date, request.max_visits)
    candidate_ids = [item.agency.agency_id for item in candidates]
    if not candidate_ids:
        raise ValueError("No candidates available to build a daily plan")

    cluster_count = request.cluster_count or _default_cluster_count(len(candidate_ids))
    cluster_result = cluster_agencies(candidate_ids, min(cluster_count, len(candidate_ids)))
    focus_cluster = _select_focus_cluster(cluster_result.clusters, candidates, request.plan_date)
    selected_items = _select_visits(focus_cluster, candidates, request.plan_date, request.max_visits)
    selected_ids = [item.agency.agency_id for item in selected_items]

    route = order_visits_by_route(selected_ids, start=request.start)
    selected_index = {item.agency.agency_id: item for item in selected_items}
    visits = [
        _build_visit_payload(
            route,
            leg.order,
            selected_index[leg.to_agency_id],
            request.language == "tr",
        )
        for leg in route.legs
    ]

    payload: dict[str, Any] = {
        "user_id": request.user_id,
        "plan_date": request.plan_date,
        "start": route.start.model_dump(mode="json"),
        "visits": visits,
        "summary": {
            "total_visits": len(visits),
            "total_distance_km": route.total_distance_km,
            "total_travel_minutes": route.total_eta_minutes,
            "optimization_notes": _build_optimization_notes(
                request=request,
                route=route,
                focus_cluster=focus_cluster,
                candidate_count=len(candidate_ids),
                selected_count=len(selected_ids),
            ),
        },
    }

    validated = validate_contract_output("DailyVisitPlan", payload)
    plan = DailyVisitPlan.model_validate(validated.model_dump(mode="json"))
    return plan, ["list_agencies", "cluster_agencies", "order_visits_by_route"]


def _select_candidates(
    items: list[AgencyListItem],
    plan_date: date,
    max_visits: int,
) -> list[AgencyListItem]:
    ranked = sorted(items, key=lambda item: _candidate_rank(item, plan_date))
    pool_size = min(len(ranked), max(max_visits, max_visits * 2))
    return ranked[:pool_size]


def _candidate_rank(item: AgencyListItem, plan_date: date) -> tuple[int, int, int, date, float]:
    agency = item.agency
    kpi = item.kpi
    due_rank = 0 if agency.next_recommended_visit_date <= plan_date else 1
    priority_rank = -_priority_weight(agency.priority_tier)
    risk_rank = -1 if kpi.renewal_risk_flag else 0
    return (due_rank, priority_rank, risk_rank, agency.next_recommended_visit_date, kpi.overall_health_score)


def _default_cluster_count(candidate_count: int) -> int:
    if candidate_count <= 3:
        return 1
    if candidate_count <= 6:
        return 2
    return 3


def _select_focus_cluster(
    clusters: list[Cluster],
    candidates: list[AgencyListItem],
    plan_date: date,
) -> Cluster:
    candidate_index = {item.agency.agency_id: item for item in candidates}
    scored = sorted(
        clusters,
        key=lambda cluster: (
            _cluster_score(cluster, candidate_index, plan_date),
            len(cluster.members),
        ),
        reverse=True,
    )
    if not scored:
        raise ValueError("Planner could not determine any cluster")
    return scored[0]


def _cluster_score(
    cluster: Cluster,
    candidate_index: dict[str, AgencyListItem],
    plan_date: date,
) -> int:
    score = 0
    for member in cluster.members:
        item = candidate_index.get(member.agency_id)
        if item is None:
            continue
        score += _urgency_score(item, plan_date)
    return score


def _urgency_score(item: AgencyListItem, plan_date: date) -> int:
    agency = item.agency
    kpi = item.kpi

    score = _priority_weight(agency.priority_tier) * 3
    if agency.next_recommended_visit_date <= plan_date:
        score += 2
    if kpi.renewal_risk_flag:
        score += 2
    if kpi.claims_ratio >= 0.73:
        score += 1
    if kpi.overall_health_score < 70:
        score += 1
    return score


def _select_visits(
    cluster: Cluster,
    candidates: list[AgencyListItem],
    plan_date: date,
    max_visits: int,
) -> list[AgencyListItem]:
    candidate_index = {item.agency.agency_id: item for item in candidates}
    members = [
        candidate_index[member.agency_id]
        for member in cluster.members
        if member.agency_id in candidate_index
    ]
    ordered = sorted(
        members,
        key=lambda item: (
            -_urgency_score(item, plan_date),
            item.agency.next_recommended_visit_date,
        ),
    )
    selected = ordered[:max_visits]
    if not selected:
        raise ValueError("Planner selected an empty visit sequence")
    return selected


def _build_visit_payload(
    route: RoutePlan,
    order: int,
    item: AgencyListItem,
    language_is_tr: bool,
) -> dict[str, Any]:
    leg = route.legs[order - 1]
    goal = _goal_for_visit(item)

    return {
        "order": order,
        "agency_id": item.agency.agency_id,
        "agency_name": item.agency.agency_name,
        "city": item.agency.city,
        "district": item.agency.district,
        "goal": goal,
        "time_window": _time_window(item.agency.preferred_visit_time_window, order),
        "objective": _objective_text(goal, item.agency.agency_name, language_is_tr),
        "rationale": _rationale(item=item, language_is_tr=language_is_tr),
        "estimated_travel_minutes_from_previous": leg.leg_eta_minutes,
        "estimated_distance_km_from_previous": leg.leg_distance_km,
    }


def _goal_for_visit(item: AgencyListItem) -> Goal:
    kpi = item.kpi
    growth_max = max(kpi.yoy_growth_motor, kpi.yoy_growth_home, kpi.yoy_growth_health)
    if kpi.renewal_risk_flag or kpi.renewal_rate < 70:
        return "renewal"
    if kpi.claims_ratio >= 0.73:
        return "claims"
    if kpi.overall_health_score >= 80 and growth_max >= 10:
        return "cross-sell"
    return "relationship"


def _objective_text(goal: Goal, agency_name: str, language_is_tr: bool) -> str:
    if language_is_tr:
        lookup = {
            "renewal": "Yenileme kaybini azaltacak aksiyonlarda mutabakat sagla.",
            "claims": "Hasar dengesini iyilestirecek operasyonel adimlari netlestir.",
            "cross-sell": "Capraz satis icin hizli kazanilacak teklifleri belirle.",
            "relationship": "Iliski ritmini guclendirip takip planini sabitle.",
        }
        return f"{agency_name}: {lookup[goal]}"

    lookup = {
        "renewal": "Align on actions that stabilize renewal retention this cycle.",
        "claims": "Define actions that improve claims-ratio control.",
        "cross-sell": "Identify fast-win cross-sell opportunities.",
        "relationship": "Strengthen cadence and confirm follow-up ownership.",
    }
    return f"{agency_name}: {lookup[goal]}"


def _rationale(item: AgencyListItem, language_is_tr: bool) -> list[str]:
    agency = item.agency
    kpi = item.kpi

    if language_is_tr:
        reasons = [
            f"Oncelik seviyesi {agency.priority_tier} ve bir sonraki ziyaret tarihi {agency.next_recommended_visit_date}.",
            f"Yenileme %{kpi.renewal_rate:.1f}, hasar orani {kpi.claims_ratio:.2f}, saglik skoru {kpi.overall_health_score:.1f}.",
        ]
        if kpi.renewal_risk_flag:
            reasons.append("Yenileme risk bayragi acik oldugu icin gorusme aciliyetli.")
        return reasons

    reasons = [
        f"Priority tier is {agency.priority_tier} with next visit date {agency.next_recommended_visit_date}.",
        f"Renewal {kpi.renewal_rate:.1f}, claims ratio {kpi.claims_ratio:.2f}, health score {kpi.overall_health_score:.1f}.",
    ]
    if kpi.renewal_risk_flag:
        reasons.append("Renewal risk flag is active, increasing urgency.")
    return reasons


def _time_window(preferred_window: str, order: int) -> str:
    if preferred_window == "morning":
        return "09:00-11:30"
    if preferred_window == "afternoon":
        return "13:00-16:30"
    start_hour = min(17, 9 + (order - 1) * 2)
    end_hour = min(18, start_hour + 1)
    return f"{start_hour:02d}:00-{end_hour:02d}:00"


def _priority_weight(tier: str) -> int:
    if tier == "A":
        return 3
    if tier == "B":
        return 2
    return 1


def _build_optimization_notes(
    request: DailyPlanRequest,
    route: RoutePlan,
    focus_cluster: Cluster,
    candidate_count: int,
    selected_count: int,
) -> list[str]:
    if request.language == "tr":
        notes = [
            (
                f"Plan, {candidate_count} adaydan {focus_cluster.cluster_id} grubunu secerek "
                f"{selected_count} ziyaret uzerinden olusturuldu."
            ),
            (
                f"Rota optimizasyonu toplam {route.total_distance_km:.1f} km ve "
                f"{route.total_eta_minutes} dakika seyahat tahmini uretildi."
            ),
        ]
        if selected_count < candidate_count:
            notes.append("Gunluk kapasite nedeniyle kalan acenteler bir sonraki plana aktarildi.")
        return notes

    notes = [
        (
            f"Plan selected cluster {focus_cluster.cluster_id} from {candidate_count} candidates "
            f"and scheduled {selected_count} visits."
        ),
        (
            f"Route optimization estimated {route.total_distance_km:.1f} km total distance and "
            f"{route.total_eta_minutes} travel minutes."
        ),
    ]
    if selected_count < candidate_count:
        notes.append("Remaining agencies were deferred to the next planning cycle due to visit capacity.")
    return notes
