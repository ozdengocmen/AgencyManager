"""Phase 4 data access adapters on top of the mock table shape."""

from __future__ import annotations

from collections.abc import Iterable

from backend.app.repositories import get_repository_gateway
from backend.app.schemas.agency import (
    Agency,
    AgencyKPI,
    AgencyListItem,
    AgencyListResponse,
    AgencyListSort,
    AgencyProfile,
    PortfolioBenchmarks,
    PortfolioSummary,
)

_PRIORITY_ORDER = {"A": 3, "B": 2, "C": 1}


def _load_agency_models() -> list[Agency]:
    return get_repository_gateway().list_agencies()


def _load_kpi_models() -> dict[str, AgencyKPI]:
    return get_repository_gateway().list_kpis()


def get_agency_profile(agency_id: str) -> AgencyProfile:
    gateway = get_repository_gateway()
    agency = gateway.get_agency(agency_id)
    kpi = gateway.get_kpi(agency_id)
    benchmarks = gateway.get_benchmarks()
    if not agency or not kpi:
        raise KeyError(f"Agency '{agency_id}' not found in mock data")
    return AgencyProfile(agency=agency, kpi=kpi, benchmarks=benchmarks)


def list_agencies(
    *,
    sales_owner: str | None = None,
    city: str | None = None,
    priority_tier: str | None = None,
    search: str | None = None,
    limit: int = 20,
    sort: AgencyListSort = AgencyListSort.next_visit_asc,
) -> AgencyListResponse:
    agencies = _load_agency_models()
    kpis = _load_kpi_models()

    filtered = [
        agency
        for agency in agencies
        if _matches_filters(
            agency=agency,
            sales_owner=sales_owner,
            city=city,
            priority_tier=priority_tier,
            search=search,
        )
    ]

    filtered = sorted(filtered, key=lambda agency: _sort_key(agency, kpis, sort))
    total = len(filtered)
    filtered = filtered[: max(1, limit)]

    items = [AgencyListItem(agency=agency, kpi=kpis[agency.agency_id]) for agency in filtered]
    return AgencyListResponse(items=items, total=total)


def get_portfolio_summary(
    *, sales_owner: str | None = None, city: str | None = None
) -> PortfolioSummary:
    agencies = _load_agency_models()
    kpis = _load_kpi_models()
    benchmarks = get_repository_gateway().get_benchmarks()

    scoped = [
        agency
        for agency in agencies
        if _matches_filters(
            agency=agency,
            sales_owner=sales_owner,
            city=city,
            priority_tier=None,
            search=None,
        )
    ]
    if not scoped:
        return PortfolioSummary(owner=sales_owner)

    scoped_kpis = [kpis[agency.agency_id] for agency in scoped]
    count = len(scoped_kpis)

    avg_renewal = _avg(model.renewal_rate for model in scoped_kpis)
    avg_claims_ratio = _avg(model.claims_ratio for model in scoped_kpis)
    avg_health_score = _avg(model.overall_health_score for model in scoped_kpis)

    return PortfolioSummary(
        owner=sales_owner,
        agency_count=count,
        total_premiums_written=sum(model.premiums_written_total for model in scoped_kpis),
        total_revenue=sum(model.total_revenue for model in scoped_kpis),
        total_claims=sum(model.claims_total for model in scoped_kpis),
        avg_renewal_rate=avg_renewal,
        avg_claims_ratio=avg_claims_ratio,
        avg_overall_health_score=avg_health_score,
        renewal_risk_agencies=sum(1 for model in scoped_kpis if model.renewal_risk_flag),
        benchmark_delta_renewal_rate=round(avg_renewal - benchmarks.avg_renewal_rate, 2),
        benchmark_delta_claims_ratio=round(avg_claims_ratio - benchmarks.avg_claims_ratio, 3),
    )


def _matches_filters(
    *,
    agency: Agency,
    sales_owner: str | None,
    city: str | None,
    priority_tier: str | None,
    search: str | None,
) -> bool:
    if sales_owner and agency.sales_owner.casefold() != sales_owner.casefold():
        return False
    if city and agency.city.casefold() != city.casefold():
        return False
    if priority_tier and agency.priority_tier.casefold() != priority_tier.casefold():
        return False
    if search:
        haystack = (
            f"{agency.agency_id} {agency.agency_name} {agency.city} {agency.district}"
        ).casefold()
        if search.casefold() not in haystack:
            return False
    return True


def _sort_key(agency: Agency, kpis: dict[str, AgencyKPI], sort: AgencyListSort) -> tuple:
    kpi = kpis[agency.agency_id]

    if sort == AgencyListSort.priority_desc:
        return (-_PRIORITY_ORDER.get(agency.priority_tier, 0), agency.next_recommended_visit_date)
    if sort == AgencyListSort.health_desc:
        return (-kpi.overall_health_score, agency.next_recommended_visit_date)
    if sort == AgencyListSort.renewal_risk_first:
        return (0 if kpi.renewal_risk_flag else 1, agency.next_recommended_visit_date)

    return (agency.next_recommended_visit_date, -_PRIORITY_ORDER.get(agency.priority_tier, 0))


def _avg(values: Iterable[float]) -> float:
    values_list = list(values)
    if not values_list:
        return 0.0
    return round(sum(values_list) / len(values_list), 2)
