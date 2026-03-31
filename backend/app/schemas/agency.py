"""Schemas for agency and portfolio data access tools."""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field

Branch = Literal["motor", "home", "health"]
PriorityTier = Literal["A", "B", "C"]
VisitFrequency = Literal["weekly", "monthly", "quarterly"]
VisitWindow = Literal["morning", "afternoon", "any"]


class Agency(BaseModel):
    agency_id: str
    agency_name: str
    address_text: str
    city: str
    district: str
    latitude: float
    longitude: float
    sales_owner: str
    priority_tier: PriorityTier
    target_visit_frequency: VisitFrequency
    preferred_visit_time_window: VisitWindow
    last_visit_date: date
    next_recommended_visit_date: date


class AgencyKPI(BaseModel):
    agency_id: str
    premiums_written_total: float
    total_revenue: float
    claims_total: float
    portfolio_concentration: float
    renewal_rate: float
    yoy_growth_motor: float
    yoy_growth_home: float
    yoy_growth_health: float
    claims_ratio: float
    overall_health_score: float
    renewal_risk_flag: bool
    growth_best_branch: Branch
    growth_worst_branch: Branch


class PortfolioBenchmarks(BaseModel):
    benchmark_key: str
    avg_renewal_rate: float
    avg_claims_ratio: float
    avg_overall_health_score: float
    avg_yoy_growth_motor: float
    avg_yoy_growth_home: float
    avg_yoy_growth_health: float


class AgencyProfile(BaseModel):
    agency: Agency
    kpi: AgencyKPI
    benchmarks: PortfolioBenchmarks


class AgencyListSort(str, Enum):
    priority_desc = "priority_desc"
    next_visit_asc = "next_visit_asc"
    health_desc = "health_desc"
    renewal_risk_first = "renewal_risk_first"


class AgencyListItem(BaseModel):
    agency: Agency
    kpi: AgencyKPI


class AgencyListResponse(BaseModel):
    items: list[AgencyListItem]
    total: int


class PortfolioSummary(BaseModel):
    owner: str | None = None
    agency_count: int = 0
    total_premiums_written: float = 0
    total_revenue: float = 0
    total_claims: float = 0
    avg_renewal_rate: float = 0
    avg_claims_ratio: float = 0
    avg_overall_health_score: float = 0
    renewal_risk_agencies: int = 0
    benchmark_delta_renewal_rate: float = Field(
        default=0,
        description="Portfolio average renewal_rate minus benchmark average renewal_rate.",
    )
    benchmark_delta_claims_ratio: float = Field(
        default=0,
        description="Portfolio average claims_ratio minus benchmark average claims_ratio.",
    )
