"""Schemas for clustering and route-planning helpers."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class ClusterRequest(BaseModel):
    agency_ids: list[str] = Field(min_length=1)
    k: int = Field(default=2, ge=1)
    method: str = "kmeans-lite"


class ClusterMember(BaseModel):
    agency_id: str
    agency_name: str
    city: str
    district: str
    latitude: float
    longitude: float


class Cluster(BaseModel):
    cluster_id: str
    centroid: Coordinates
    members: list[ClusterMember]


class ClusterResult(BaseModel):
    method: str
    total_agencies: int
    clusters: list[Cluster]


class RouteRequest(BaseModel):
    agency_ids: list[str] = Field(min_length=1)
    start: Coordinates | None = None
    avg_speed_kmh: float = Field(default=28.0, gt=0)


class RouteLeg(BaseModel):
    order: int
    from_point: str
    to_agency_id: str
    to_agency_name: str
    leg_distance_km: float
    leg_eta_minutes: int


class RoutePlan(BaseModel):
    ordered_agency_ids: list[str]
    legs: list[RouteLeg]
    total_distance_km: float
    total_eta_minutes: int
    start: Coordinates
