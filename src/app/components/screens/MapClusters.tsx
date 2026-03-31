import { useMemo, useState } from "react";
import maplibregl from "maplibre-gl";
import MapView, { Layer, Marker, NavigationControl, Popup, Source } from "react-map-gl/maplibre";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { mockAgencies, mockKPIs } from "../../data/mockData";
import { useI18n } from "../../i18n";
import { useAppState } from "../../state";
import {
  CLUSTER_COLORS_CLASS,
  CLUSTER_COLORS_HEX,
  createAgencyClusters,
  formatCompactCurrency,
  type MapCluster,
} from "./mapClustersUtils";

const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const MAP_STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function formatRouteTimestamp(value: string | null, language: "en" | "tr", fallback: string): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitialMapView(): { longitude: number; latitude: number; zoom: number } {
  if (mockAgencies.length === 0) {
    return {
      longitude: -74.0,
      latitude: 40.72,
      zoom: 10,
    };
  }

  const avgLatitude =
    mockAgencies.reduce((sum, agency) => sum + agency.latitude, 0) / mockAgencies.length;
  const avgLongitude =
    mockAgencies.reduce((sum, agency) => sum + agency.longitude, 0) / mockAgencies.length;

  return {
    longitude: avgLongitude,
    latitude: avgLatitude,
    zoom: 10.5,
  };
}

export function MapClusters() {
  const {
    state: { planner, settings },
    addAgencyToPlan,
    selectPlannerVisit,
    markPlannerVisitVisited,
    recalculatePlannerRoute,
  } = useAppState();

  const { copy: i18nCopy } = useI18n();
  const copy = i18nCopy.mapClusters;
  const [numClusters, setNumClusters] = useState([3]);
  const [weightByPriority, setWeightByPriority] = useState(true);
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(
    planner.visits[0]?.agency_id || mockAgencies[0]?.agency_id || null,
  );
  const [isRecalculating, setIsRecalculating] = useState(false);

  const visitedVisitIds = useMemo(() => new Set(planner.route.visitedVisitIds), [planner.route.visitedVisitIds]);

  const agenciesById = useMemo(
    () => new Map(mockAgencies.map((agency) => [agency.agency_id, agency])),
    [],
  );

  const plannedVisits = useMemo(
    () => [...planner.visits].sort((left, right) => left.order - right.order),
    [planner.visits],
  );

  const plannedVisitByAgencyId = useMemo(
    () => new Map(plannedVisits.map((visit) => [visit.agency_id, visit])),
    [plannedVisits],
  );

  const clustersByAgencyId = useMemo(() => {
    const map = new Map<string, MapCluster>();
    for (const cluster of clusters) {
      for (const agency of cluster.agencies) {
        map.set(agency.agency_id, cluster);
      }
    }
    return map;
  }, [clusters]);

  const routeCoordinates = useMemo(() => {
    const coordinates: [number, number][] = [];
    for (const visit of plannedVisits) {
      const agency = agenciesById.get(visit.agency_id);
      if (!agency) {
        continue;
      }
      coordinates.push([agency.longitude, agency.latitude]);
    }
    return coordinates;
  }, [agenciesById, plannedVisits]);

  const visitedRouteCoordinates = useMemo(() => {
    const coordinates: [number, number][] = [];
    for (const visit of plannedVisits) {
      if (!visitedVisitIds.has(visit.id)) {
        continue;
      }
      const agency = agenciesById.get(visit.agency_id);
      if (!agency) {
        continue;
      }
      coordinates.push([agency.longitude, agency.latitude]);
    }
    return coordinates;
  }, [agenciesById, plannedVisits, visitedVisitIds]);

  const routeGeoJson = useMemo(() => {
    if (routeCoordinates.length < 2) {
      return null;
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      ],
    } as const;
  }, [routeCoordinates]);

  const visitedRouteGeoJson = useMemo(() => {
    if (visitedRouteCoordinates.length < 2) {
      return null;
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: visitedRouteCoordinates,
          },
        },
      ],
    } as const;
  }, [visitedRouteCoordinates]);

  const selectedAgency = selectedAgencyId ? agenciesById.get(selectedAgencyId) || null : null;
  const selectedVisit = selectedAgency ? plannedVisitByAgencyId.get(selectedAgency.agency_id) : undefined;
  const selectedVisitIsVisited = selectedVisit ? visitedVisitIds.has(selectedVisit.id) : false;

  const visitedCount = useMemo(
    () => plannedVisits.filter((visit) => visitedVisitIds.has(visit.id)).length,
    [plannedVisits, visitedVisitIds],
  );
  const pendingCount = Math.max(plannedVisits.length - visitedCount, 0);

  const handleCreateClusters = () => {
    const nextClusters = createAgencyClusters(mockAgencies, numClusters[0], weightByPriority);
    setClusters(nextClusters);
  };

  const addAgenciesToPlan = (agencyIds: string[]) => {
    let addedCount = 0;
    for (const agencyId of agencyIds) {
      if (addAgencyToPlan(agencyId)) {
        addedCount += 1;
      }
    }

    if (addedCount === 0) {
      toast.message(copy.agenciesAlreadyInPlan);
      return;
    }

    toast.success(copy.agenciesAddedToPlan(addedCount));
  };

  const handleSelectAgency = (agencyId: string) => {
    setSelectedAgencyId(agencyId);
    const linkedVisit = plannedVisitByAgencyId.get(agencyId);
    if (linkedVisit) {
      selectPlannerVisit(linkedVisit.id);
    }
  };

  const runMockRouteRecalculation = async () => {
    if (plannedVisits.length === 0) {
      toast.message(copy.routeRecalcBlocked);
      return;
    }

    setIsRecalculating(true);
    toast.message(copy.routeRecalcTriggered);

    try {
      await wait(650);
      recalculatePlannerRoute("manual");
      toast.success(copy.routeRecalcComplete);
    } finally {
      setIsRecalculating(false);
    }
  };

  const markVisitAsVisited = (agencyId: string) => {
    const visit = plannedVisitByAgencyId.get(agencyId);
    if (!visit) {
      toast.error(copy.markVisitFailed);
      return;
    }

    if (visitedVisitIds.has(visit.id)) {
      toast.message(copy.visitAlreadyMarked);
      return;
    }

    const updated = markPlannerVisitVisited(visit.id);
    if (!updated) {
      toast.error(copy.markVisitFailed);
      return;
    }

    const agencyName = agenciesById.get(agencyId)?.agency_name || agencyId;
    toast.success(copy.visitMarked(agencyName));
  };

  const selectedAgencyKpi = selectedAgency ? mockKPIs[selectedAgency.agency_id] : null;

  const routeLastReasonLabel =
    planner.route.lastRecalculationReason === "visit-completed"
      ? copy.reasonVisitCompleted
      : copy.reasonManual;

  const initialMapView = useMemo(() => getInitialMapView(), []);

  return (
    <div className="flex-1 min-w-0 min-h-0">
      <div className="flex min-h-full min-w-[1080px] bg-slate-100">
        <div className="flex-1 min-h-0 p-5">
          <div className="relative h-full rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden">
            <MapView
              mapLib={maplibregl}
              initialViewState={initialMapView}
              mapStyle={MAP_STYLE_URL}
              style={{ width: "100%", height: "100%" }}
              attributionControl={false}
              reuseMaps
            >
              <NavigationControl position="top-right" />

              {routeGeoJson && (
                <Source id="planned-route" type="geojson" data={routeGeoJson}>
                  <Layer
                    id="planned-route-line"
                    type="line"
                    layout={{
                      "line-cap": "round",
                      "line-join": "round",
                    }}
                    paint={{
                      "line-color": "#2563eb",
                      "line-width": 4,
                      "line-opacity": 0.85,
                    }}
                  />
                </Source>
              )}

              {visitedRouteGeoJson && (
                <Source id="visited-route" type="geojson" data={visitedRouteGeoJson}>
                  <Layer
                    id="visited-route-line"
                    type="line"
                    layout={{
                      "line-cap": "round",
                      "line-join": "round",
                    }}
                    paint={{
                      "line-color": "#059669",
                      "line-width": 5,
                      "line-opacity": 0.8,
                      "line-dasharray": [1, 1],
                    }}
                  />
                </Source>
              )}

              {mockAgencies.map((agency) => {
                const plannedVisit = plannedVisitByAgencyId.get(agency.agency_id);
                const isVisited = plannedVisit ? visitedVisitIds.has(plannedVisit.id) : false;
                const cluster = clustersByAgencyId.get(agency.agency_id);
                const clusterColor = cluster
                  ? CLUSTER_COLORS_HEX[(cluster.id - 1) % CLUSTER_COLORS_HEX.length]
                  : "#64748b";

                let pinColor = "#64748b";
                if (plannedVisit && isVisited) {
                  pinColor = "#059669";
                } else if (plannedVisit) {
                  pinColor = "#2563eb";
                } else if (cluster) {
                  pinColor = clusterColor;
                }

                const isSelected = selectedAgencyId === agency.agency_id;

                return (
                  <Marker
                    key={agency.agency_id}
                    longitude={agency.longitude}
                    latitude={agency.latitude}
                    anchor="center"
                  >
                    <button
                      type="button"
                      title={agency.agency_name}
                      className={`h-8 w-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-semibold transition-transform ${isSelected ? "scale-125 ring-2 ring-slate-900/25" : "hover:scale-110"}`}
                      style={{ backgroundColor: pinColor }}
                      onClick={() => handleSelectAgency(agency.agency_id)}
                    >
                      {plannedVisit ? plannedVisit.order : agency.priority_tier}
                    </button>
                  </Marker>
                );
              })}

              {clusters.map((cluster) => {
                const color = CLUSTER_COLORS_HEX[(cluster.id - 1) % CLUSTER_COLORS_HEX.length];
                return (
                  <Marker
                    key={`cluster-${cluster.id}`}
                    longitude={cluster.center[1]}
                    latitude={cluster.center[0]}
                    anchor="center"
                  >
                    <div
                      className="h-11 w-11 rounded-full border-4 border-white shadow-xl text-white font-bold text-sm flex items-center justify-center pointer-events-none"
                      style={{ backgroundColor: color }}
                    >
                      {cluster.id}
                    </div>
                  </Marker>
                );
              })}

              {selectedAgency && (
                <Popup
                  longitude={selectedAgency.longitude}
                  latitude={selectedAgency.latitude}
                  anchor="top"
                  offset={18}
                  closeButton={false}
                  closeOnClick={false}
                >
                  <div className="text-xs min-w-32">
                    <p className="font-semibold text-slate-900">{selectedAgency.agency_name}</p>
                    <p className="text-slate-600">{selectedAgency.city}</p>
                  </div>
                </Popup>
              )}
            </MapView>

            <div className="absolute left-4 bottom-4 rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-sm max-w-64 z-10">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">{copy.mapLegend}</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-blue-600" />
                  <span>{copy.legendPlanned}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-600" />
                  <span>{copy.legendVisited}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-slate-500" />
                  <span>{copy.legendUnplanned}</span>
                </div>
                {clusters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-700 bg-white" />
                    <span>{copy.legendClusterCenter}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-[360px] xl:w-[400px] shrink-0 min-h-0 border-l bg-white flex flex-col">
          <div className="border-b px-5 py-4">
            <h2 className="text-xl font-bold text-slate-900">{copy.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{copy.routeSummary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-md border p-2 text-center">
                      <p className="text-xs text-slate-500">{copy.agenciesTotal}</p>
                      <p className="text-lg font-semibold text-slate-900">{mockAgencies.length}</p>
                    </div>
                    <div className="rounded-md border p-2 text-center">
                      <p className="text-xs text-slate-500">{copy.plannedVisits}</p>
                      <p className="text-lg font-semibold text-blue-700">{plannedVisits.length}</p>
                    </div>
                    <div className="rounded-md border p-2 text-center">
                      <p className="text-xs text-slate-500">{copy.visitedVisits}</p>
                      <p className="text-lg font-semibold text-emerald-700">{visitedCount}</p>
                    </div>
                    <div className="rounded-md border p-2 text-center">
                      <p className="text-xs text-slate-500">{copy.pendingVisits}</p>
                      <p className="text-lg font-semibold text-amber-700">{pendingCount}</p>
                    </div>
                  </div>

                  <div className="rounded-md border bg-slate-50 p-3 space-y-1">
                    <p className="text-xs text-slate-600">
                      {copy.routeRevision}: <span className="font-medium text-slate-900">{planner.route.routeRevision}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      {copy.routeUpdatedAt}:{" "}
                      <span className="font-medium text-slate-900">
                        {formatRouteTimestamp(
                          planner.route.lastRecalculatedAt,
                          settings.language,
                          copy.routeNotCalculated,
                        )}
                      </span>
                    </p>
                    {planner.route.lastRecalculationReason && (
                      <p className="text-xs text-slate-600">
                        {copy.routeLastReason}: <span className="font-medium text-slate-900">{routeLastReasonLabel}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{copy.algorithmSettings}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm">
                      {copy.numberOfClusters}: {numClusters[0]}
                    </Label>
                    <Slider
                      className="mt-2"
                      min={2}
                      max={5}
                      step={1}
                      value={numClusters}
                      onValueChange={setNumClusters}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="weight-priority" className="text-sm">
                      {copy.weightByPriority}
                    </Label>
                    <Switch
                      id="weight-priority"
                      checked={weightByPriority}
                      onCheckedChange={setWeightByPriority}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={handleCreateClusters}>
                      <Navigation className="w-4 h-4 mr-2" />
                      {copy.createClusters}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={runMockRouteRecalculation}
                      disabled={isRecalculating}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRecalculating ? "animate-spin" : ""}`} />
                      {isRecalculating ? copy.recalculating : copy.recalculateRoute}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{copy.selectedAgency}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedAgency ? (
                    <p className="text-sm text-slate-600">{copy.clickAgencyHint}</p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">{selectedAgency.agency_name}</p>
                        <p className="text-xs text-slate-600">
                          {selectedAgency.city} - {selectedAgency.district}
                        </p>
                      </div>

                      {selectedAgencyKpi && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-md border p-2">
                            <p className="text-slate-500">{copy.healthScore}</p>
                            <p className="font-semibold text-slate-900">{selectedAgencyKpi.overall_health_score}</p>
                          </div>
                          <div className="rounded-md border p-2">
                            <p className="text-slate-500">{copy.totalValue}</p>
                            <p className="font-semibold text-slate-900">
                              {formatCompactCurrency(
                                selectedAgencyKpi.premiums_written_total,
                                settings.language,
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="rounded-md border p-2.5 space-y-1 text-xs">
                        <p className="text-slate-500">{copy.routeStatus}</p>
                        <div className="flex items-center gap-2">
                          {selectedVisit && selectedVisitIsVisited && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              {copy.routeStatusVisited}
                            </Badge>
                          )}
                          {selectedVisit && !selectedVisitIsVisited && (
                            <Badge className="bg-blue-100 text-blue-700 border-0">
                              {copy.routeStatusPlanned}
                            </Badge>
                          )}
                          {!selectedVisit && (
                            <Badge variant="secondary">{copy.routeStatusNotPlanned}</Badge>
                          )}
                        </div>
                        {selectedAgencyKpi && (
                          <p className="text-slate-600">
                            {copy.renewalRisk}: {selectedAgencyKpi.renewal_risk_flag ? copy.yes : copy.no}
                          </p>
                        )}
                      </div>

                      {selectedVisit && !selectedVisitIsVisited && (
                        <Button
                          className="w-full"
                          onClick={() => markVisitAsVisited(selectedAgency.agency_id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {copy.markVisited}
                        </Button>
                      )}

                      {selectedVisit && selectedVisitIsVisited && (
                        <Button className="w-full" variant="outline" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {copy.alreadyVisited}
                        </Button>
                      )}

                      {!selectedVisit && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => addAgenciesToPlan([selectedAgency.agency_id])}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {copy.addToPlan}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Route className="w-4 h-4" />
                    {copy.plannedRoute}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {plannedVisits.length === 0 ? (
                    <p className="text-sm text-slate-600">{copy.noPlannedVisits}</p>
                  ) : (
                    <div className="space-y-2">
                      {plannedVisits.map((visit) => {
                        const agency = agenciesById.get(visit.agency_id);
                        if (!agency) {
                          return null;
                        }

                        const isVisited = visitedVisitIds.has(visit.id);
                        return (
                          <div
                            key={visit.id}
                            className="rounded-md border p-2.5 cursor-pointer hover:bg-slate-50"
                            onClick={() => handleSelectAgency(agency.agency_id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {copy.stop} {visit.order}: {agency.agency_name}
                                </p>
                                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                                  <Clock3 className="w-3 h-3" />
                                  {visit.time_window}
                                </p>
                              </div>
                              <Badge
                                className={
                                  isVisited
                                    ? "bg-emerald-100 text-emerald-700 border-0"
                                    : "bg-blue-100 text-blue-700 border-0"
                                }
                              >
                                {isVisited ? copy.routeStatusVisited : copy.routeStatusPlanned}
                              </Badge>
                            </div>

                            {!isVisited && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-7 px-2 text-xs"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  markVisitAsVisited(agency.agency_id);
                                }}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                {copy.markVisited}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">{copy.clusterResults}</h3>

                {clusters.length === 0 && (
                  <Card>
                    <CardContent className="py-6">
                      <p className="text-sm text-slate-600">{copy.noClusters}</p>
                    </CardContent>
                  </Card>
                )}

                {clusters.map((cluster) => {
                  const totalPremiums = cluster.agencies.reduce(
                    (sum, agency) => sum + mockKPIs[agency.agency_id].premiums_written_total,
                    0,
                  );
                  const colorClass = CLUSTER_COLORS_CLASS[(cluster.id - 1) % CLUSTER_COLORS_CLASS.length];

                  return (
                    <Card key={cluster.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full text-white text-sm font-bold flex items-center justify-center ${colorClass}`}
                          >
                            {cluster.id}
                          </div>
                          <div>
                            <CardTitle className="text-sm">{copy.clusterTitle(cluster.id)}</CardTitle>
                            <p className="text-xs text-slate-600">
                              {copy.clusterAgencyCount(cluster.agencies.length)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="rounded-md border p-2 text-xs">
                          <p className="text-slate-500">{copy.totalValue}</p>
                          <p className="font-semibold text-slate-900 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {formatCompactCurrency(totalPremiums, settings.language)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-1.5">{copy.agenciesInCluster}</p>
                          <div className="space-y-1.5">
                            {cluster.agencies.map((agency) => {
                              const linkedVisit = plannedVisitByAgencyId.get(agency.agency_id);
                              const isVisited = linkedVisit ? visitedVisitIds.has(linkedVisit.id) : false;
                              return (
                                <button
                                  key={agency.agency_id}
                                  type="button"
                                  className="w-full text-left rounded-md border px-2 py-1.5 hover:bg-slate-50"
                                  onClick={() => handleSelectAgency(agency.agency_id)}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-medium text-slate-900 truncate">
                                      {agency.agency_name}
                                    </p>
                                    {linkedVisit ? (
                                      <Badge
                                        className={
                                          isVisited
                                            ? "bg-emerald-100 text-emerald-700 border-0"
                                            : "bg-blue-100 text-blue-700 border-0"
                                        }
                                      >
                                        {isVisited ? copy.routeStatusVisited : copy.routeStatusPlanned}
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">{copy.routeStatusNotPlanned}</Badge>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            addAgenciesToPlan(cluster.agencies.map((agency) => agency.agency_id))
                          }
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {copy.addClusterToPlan}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
