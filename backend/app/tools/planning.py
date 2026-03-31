"""Phase 4 planning helpers: local clustering and route heuristics."""

from __future__ import annotations

import math
from dataclasses import dataclass

from backend.app.schemas.agency import Agency
from backend.app.schemas.planning import (
    Cluster,
    ClusterMember,
    ClusterResult,
    Coordinates,
    RouteLeg,
    RoutePlan,
)
from backend.app.tools.data_access import list_agencies

_EARTH_RADIUS_KM = 6371.0


@dataclass(frozen=True)
class _Point:
    agency_id: str
    agency_name: str
    city: str
    district: str
    latitude: float
    longitude: float


def cluster_agencies(agency_ids: list[str], k: int, method: str = "kmeans-lite") -> ClusterResult:
    points = _load_points(agency_ids)
    cluster_count = min(max(1, k), len(points))

    centroids = _initial_centroids(points, cluster_count)
    assignments = [0] * len(points)

    for _ in range(10):
        assignments = [
            _nearest_centroid_index(point.latitude, point.longitude, centroids) for point in points
        ]
        centroids = _recompute_centroids(points, assignments, cluster_count)

    clusters: list[Cluster] = []
    for index in range(cluster_count):
        members = [point for point, group in zip(points, assignments, strict=True) if group == index]
        if not members:
            continue
        centroid_lat = sum(item.latitude for item in members) / len(members)
        centroid_lon = sum(item.longitude for item in members) / len(members)
        clusters.append(
            Cluster(
                cluster_id=f"cluster-{index + 1}",
                centroid=Coordinates(latitude=round(centroid_lat, 6), longitude=round(centroid_lon, 6)),
                members=[
                    ClusterMember(
                        agency_id=member.agency_id,
                        agency_name=member.agency_name,
                        city=member.city,
                        district=member.district,
                        latitude=member.latitude,
                        longitude=member.longitude,
                    )
                    for member in members
                ],
            )
        )

    return ClusterResult(method=method, total_agencies=len(points), clusters=clusters)


def order_visits_by_route(
    agency_ids: list[str], start: Coordinates | None = None, avg_speed_kmh: float = 28.0
) -> RoutePlan:
    points = _load_points(agency_ids)

    if start:
        current_lat, current_lon = start.latitude, start.longitude
    else:
        current_lat, current_lon = points[0].latitude, points[0].longitude
        start = Coordinates(latitude=current_lat, longitude=current_lon)

    unvisited = points.copy()
    ordered: list[str] = []
    legs: list[RouteLeg] = []
    total_distance = 0.0

    for step in range(1, len(points) + 1):
        nearest = min(
            unvisited,
            key=lambda point: _haversine_km(current_lat, current_lon, point.latitude, point.longitude),
        )
        leg_distance = _haversine_km(current_lat, current_lon, nearest.latitude, nearest.longitude)
        leg_eta = int(round((leg_distance / avg_speed_kmh) * 60))
        legs.append(
            RouteLeg(
                order=step,
                from_point="START" if step == 1 else ordered[-1],
                to_agency_id=nearest.agency_id,
                to_agency_name=nearest.agency_name,
                leg_distance_km=round(leg_distance, 2),
                leg_eta_minutes=leg_eta,
            )
        )
        ordered.append(nearest.agency_id)
        total_distance += leg_distance
        current_lat, current_lon = nearest.latitude, nearest.longitude
        unvisited.remove(nearest)

    return RoutePlan(
        ordered_agency_ids=ordered,
        legs=legs,
        total_distance_km=round(total_distance, 2),
        total_eta_minutes=sum(item.leg_eta_minutes for item in legs),
        start=start,
    )


def _load_points(agency_ids: list[str]) -> list[_Point]:
    seen: set[str] = set()
    unique_ids = [agency_id for agency_id in agency_ids if not (agency_id in seen or seen.add(agency_id))]
    if not unique_ids:
        raise ValueError("agency_ids cannot be empty")

    response = list_agencies(limit=200)
    agency_index: dict[str, Agency] = {item.agency.agency_id: item.agency for item in response.items}

    points: list[_Point] = []
    for agency_id in unique_ids:
        agency = agency_index.get(agency_id)
        if not agency:
            raise KeyError(f"Agency '{agency_id}' not found")
        points.append(
            _Point(
                agency_id=agency.agency_id,
                agency_name=agency.agency_name,
                city=agency.city,
                district=agency.district,
                latitude=agency.latitude,
                longitude=agency.longitude,
            )
        )
    return points


def _initial_centroids(points: list[_Point], k: int) -> list[tuple[float, float]]:
    ordered = sorted(points, key=lambda item: (item.latitude, item.longitude, item.agency_id))
    if k == 1:
        first = ordered[0]
        return [(first.latitude, first.longitude)]

    step = (len(ordered) - 1) / (k - 1)
    centroids: list[tuple[float, float]] = []
    for index in range(k):
        point = ordered[round(index * step)]
        centroids.append((point.latitude, point.longitude))
    return centroids


def _nearest_centroid_index(lat: float, lon: float, centroids: list[tuple[float, float]]) -> int:
    return min(
        range(len(centroids)),
        key=lambda idx: _haversine_km(lat, lon, centroids[idx][0], centroids[idx][1]),
    )


def _recompute_centroids(
    points: list[_Point], assignments: list[int], cluster_count: int
) -> list[tuple[float, float]]:
    centroids: list[tuple[float, float]] = []
    for index in range(cluster_count):
        members = [point for point, group in zip(points, assignments, strict=True) if group == index]
        if not members:
            fallback = points[index % len(points)]
            centroids.append((fallback.latitude, fallback.longitude))
            continue
        centroids.append(
            (
                sum(item.latitude for item in members) / len(members),
                sum(item.longitude for item in members) / len(members),
            )
        )
    return centroids


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return _EARTH_RADIUS_KM * c
