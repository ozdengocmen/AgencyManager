import { useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, GripVertical, Sparkles, MapPin, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { generateDailyPlan, generateMeetingPrep } from "../../api/agent";
import { logMeetingOutcome } from "../../api/persistence";
import { createWorkflowDailyPlan, updateWorkflowDailyPlan } from "../../api/workflows";
import type { DailyPlanResponse, MeetingNarrative } from "../../api/types";
import { mockAgencies, mockKPIs, type DailyPlanVisit } from "../../data/mockData";
import { getMutationStatus, resolveMutationError, useAppState } from "../../state";
import { useI18n, type I18nCopy } from "../../i18n";
import { AIInteractionShell, type AIInteractionTrace } from "../ai/AIInteractionShell";

const MUTATION_OPTIMIZE_ROUTE = "dailyPlan.optimizeRoute";
type DailyPlanCopy = I18nCopy["dailyPlan"];

interface VisitCardProps {
  visit: DailyPlanVisit;
  index: number;
  moveVisit: (dragIndex: number, hoverIndex: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  onGeneratePrep: () => void;
  isGeneratingPrep: boolean;
  onRemove: () => void;
  copy: DailyPlanCopy;
}

function VisitCard({
  visit,
  index,
  moveVisit,
  onSelect,
  isSelected,
  onGeneratePrep,
  isGeneratingPrep,
  onRemove,
  copy,
}: VisitCardProps) {
  const agency = mockAgencies.find((item) => item.agency_id === visit.agency_id);
  const kpis = mockKPIs[visit.agency_id];

  const [{ isDragging }, drag] = useDrag({
    type: "visit",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "visit",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveVisit(item.index, index);
        item.index = index;
      }
    },
  });

  if (!agency) {
    return null;
  }

  const goalColors = {
    renewal: "bg-red-100 text-red-700",
    claims: "bg-amber-100 text-amber-700",
    "cross-sell": "bg-green-100 text-green-700",
    relationship: "bg-blue-100 text-blue-700",
  };
  const goalLabels = {
    renewal: copy.goalRenewal,
    claims: copy.goalClaims,
    "cross-sell": copy.goalCrossSell,
    relationship: copy.goalRelationship,
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`cursor-move ${isDragging ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <Card className={`mb-3 hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{agency.agency_name}</h4>
                  <p className="text-sm text-slate-600">
                    {agency.city} · {agency.district}
                  </p>
                </div>
                <Badge variant={agency.priority_tier === "A" ? "default" : "secondary"} className="text-xs">
                  {agency.priority_tier}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={`text-xs ${goalColors[visit.goal]}`}>{goalLabels[visit.goal]}</Badge>
                {kpis.renewal_risk_flag && (
                  <Badge variant="destructive" className="text-xs">
                    {copy.risk}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {visit.time_window}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {agency.preferred_visit_time_window}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={(event) => {
                  event.stopPropagation();
                  onGeneratePrep();
                }}
                disabled={isGeneratingPrep}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGeneratingPrep ? copy.generating : copy.generatePrep}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full text-rose-600 border-rose-200 hover:text-rose-700 hover:border-rose-300"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {copy.removeVisit}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DailyPlanContent() {
  const { copy: i18nCopy } = useI18n();
  const {
    state,
    addAgencyToPlan,
    removePlannerVisit,
    movePlannerVisit,
    replacePlannerVisits,
    selectPlannerVisit,
    setPlannerFilters,
    updatePlannerVisit,
    setPlannerAutosave,
    setVisitChecklist,
    setVisitOutcome,
    setMutationStatus,
    setMutationError,
  } = useAppState();

  const { planner, settings, session } = state;
  const copy = i18nCopy.dailyPlan;
  const [generatingVisitId, setGeneratingVisitId] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiTrace, setAiTrace] = useState<AIInteractionTrace | null>(null);
  const [aiEvidenceMap, setAiEvidenceMap] = useState<Record<string, string[]>>({});
  const lastRetryRef = useRef<(() => Promise<void>) | null>(null);

  const isOptimizing = getMutationStatus(state, MUTATION_OPTIMIZE_ROUTE) === "loading";

  const selectedVisitData = planner.visits.find((visit) => visit.id === planner.selectedVisitId);
  const selectedAgency = selectedVisitData
    ? mockAgencies.find((agency) => agency.agency_id === selectedVisitData.agency_id)
    : null;

  const plannedAgencyIds = useMemo(
    () => new Set(planner.visits.map((visit) => visit.agency_id)),
    [planner.visits],
  );

  const candidateAgencies = useMemo(
    () => mockAgencies.filter((agency) => !plannedAgencyIds.has(agency.agency_id)),
    [plannedAgencyIds],
  );

  const filteredCandidates = useMemo(() => {
    return candidateAgencies.filter((agency) => {
      const kpis = mockKPIs[agency.agency_id];

      if (
        planner.searchQuery &&
        !agency.agency_name.toLowerCase().includes(planner.searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (planner.filterPreset === "renewal-risk" && !kpis.renewal_risk_flag) {
        return false;
      }

      if (planner.filterPreset === "high-growth" && kpis.overall_health_score < 80) {
        return false;
      }

      if (planner.filterPreset === "due-this-week") {
        const dueTime = new Date(agency.next_recommended_visit_date).getTime();
        const oneWeekAhead = Date.now() + 7 * 24 * 60 * 60 * 1000;
        if (dueTime > oneWeekAhead) {
          return false;
        }
      }

      return true;
    });
  }, [candidateAgencies, planner.filterPreset, planner.searchQuery]);

  useEffect(() => {
    if (session.status !== "authenticated" || !session.user) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setPlannerAutosave({ status: "loading", error: null });
      try {
        const planPayload = {
          visits: planner.visits,
          checklist_by_visit: planner.checklistByVisit,
          outcomes_by_visit: planner.outcomesByVisit,
        };
        const today = new Date().toISOString().slice(0, 10);

        let saved;
        if (planner.autosave.lastPlanId) {
          try {
            saved = await updateWorkflowDailyPlan({
              plan_id: planner.autosave.lastPlanId,
              plan_json: planPayload,
            });
          } catch (error) {
            const message = resolveMutationError(error, "");
            if (!message.toLowerCase().includes("not found")) {
              throw error;
            }
            saved = await createWorkflowDailyPlan({
              plan_date: today,
              plan_json: planPayload,
            });
          }
        } else {
          saved = await createWorkflowDailyPlan({
            plan_date: today,
            plan_json: planPayload,
          });
        }

        setPlannerAutosave({
          status: "success",
          error: null,
          lastSavedAt: saved.updated_at,
          lastPlanId: saved.plan_id,
        });
      } catch (error) {
        setPlannerAutosave({
          status: "error",
          error: resolveMutationError(error, "Autosave failed."),
        });
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    planner.autosave.lastPlanId,
    planner.checklistByVisit,
    planner.outcomesByVisit,
    planner.visits,
    session.status,
    session.user,
    setPlannerAutosave,
  ]);

  const addToVisits = (agencyId: string) => {
    const added = addAgencyToPlan(agencyId);
    if (!added) {
      toast.message(copy.agencyAlreadyInPlan);
      return;
    }
    toast.success(copy.addedAgencyToPlan(agencyId));
  };

  const removeFromVisits = (visitId: string) => {
    const targetVisit = planner.visits.find((visit) => visit.id === visitId);
    if (!targetVisit) {
      toast.error(copy.removeFailed);
      return;
    }

    const removed = removePlannerVisit(visitId);
    if (!removed) {
      toast.error(copy.removeFailed);
      return;
    }

    if (generatingVisitId === visitId) {
      setGeneratingVisitId(null);
    }

    const agencyName =
      mockAgencies.find((agency) => agency.agency_id === targetVisit.agency_id)?.agency_name ||
      targetVisit.agency_id;
    toast.success(copy.removed(agencyName));
  };

  const optimizeRoute = async () => {
    lastRetryRef.current = optimizeRoute;
    setMutationStatus(MUTATION_OPTIMIZE_ROUTE, "loading", null);
    setAiStatus("loading");
    setAiError(null);
    try {
      const result = await generateDailyPlan({
        user_id: session.user?.role,
        language: settings.language,
        max_visits: Math.max(1, Math.min(settings.maxVisitsPerDay, planner.visits.length || 4)),
        save_result: false,
      });
      const nextVisits = mapDailyPlanResponseToVisits(result);
      replacePlannerVisits(nextVisits);
      setAiTrace({
        runId: result.run_id,
        provider: result.provider,
        model: result.model,
        toolsUsed: result.tools_used,
        warnings: result.warnings,
      });
      setAiEvidenceMap(result.evidence_map);
      setAiStatus("success");
      toast.success(copy.routeOptimized(result.plan.summary.total_distance_km, result.plan.summary.total_travel_minutes));
      setMutationStatus(MUTATION_OPTIMIZE_ROUTE, "success", null);
    } catch (error) {
      const message = resolveMutationError(error, copy.routeOptimizationFailed);
      setMutationError(MUTATION_OPTIMIZE_ROUTE, error, copy.routeOptimizationFailed);
      setAiStatus("error");
      setAiError(message);
      toast.error(message);
    }
  };

  const generateVisitPrep = async (visitId: string) => {
    lastRetryRef.current = () => generateVisitPrep(visitId);
    const target = planner.visits.find((visit) => visit.id === visitId);
    if (!target) {
      return;
    }

    setGeneratingVisitId(visitId);
    setAiStatus("loading");
    setAiError(null);
    try {
      const response = await generateMeetingPrep({
        agency_id: target.agency_id,
        tone: settings.defaultTone,
        language: settings.language,
        additional_context: target.notes,
        save_result: false,
      });
      const generatedNote = summarizeNarrativeForVisit(response.narrative);
      updatePlannerVisit(visitId, {
        notes: generatedNote,
      });
      setAiTrace({
        runId: response.run_id,
        provider: response.provider,
        model: response.model,
        toolsUsed: response.tools_used,
        warnings: response.warnings,
      });
      setAiEvidenceMap(response.evidence_map);
      setAiStatus("success");
      toast.success(copy.meetingPrepGenerated(target.agency_id));
    } catch (error) {
      const message = resolveMutationError(error, copy.meetingPrepGenerationFailed);
      setAiStatus("error");
      setAiError(message);
      toast.error(message);
    } finally {
      setGeneratingVisitId(null);
    }
  };

  const handleOutcomeChange = async (visitId: string, outcome: "success" | "neutral" | "risk") => {
    setVisitOutcome(visitId, outcome);
    const visit = planner.visits.find((item) => item.id === visitId);
    if (!visit) {
      return;
    }

    try {
      await logMeetingOutcome({
        agency_id: visit.agency_id,
        outcome,
        notes: visit.notes,
        next_steps: [],
      });
      toast.success(copy.outcomeSaved(visit.agency_id));
    } catch (error) {
      toast.error(resolveMutationError(error, copy.outcomeSaveFailed));
    }
  };

  return (
    <div className="flex-1 min-w-0 min-h-0">
      <div className="flex min-h-full min-w-[1100px] bg-slate-50">
        <div className="w-72 xl:w-80 shrink-0 min-h-0 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900 mb-3">{copy.candidatePool}</h3>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={copy.searchAgencies}
              value={planner.searchQuery}
              onChange={(event) => setPlannerFilters({ searchQuery: event.target.value })}
              className="pl-9"
            />
          </div>

          <Select
            value={planner.filterPreset}
            onValueChange={(value) => setPlannerFilters({ filterPreset: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.allAgencies}</SelectItem>
              <SelectItem value="due-this-week">{copy.dueThisWeek}</SelectItem>
              <SelectItem value="renewal-risk">{copy.renewalRisk}</SelectItem>
              <SelectItem value="high-growth">{copy.highGrowth}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-2">
            {filteredCandidates.map((agency) => {
              const kpis = mockKPIs[agency.agency_id];
              return (
                <Card key={agency.agency_id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 truncate">{agency.agency_name}</h4>
                        <p className="text-xs text-slate-600">{agency.city}</p>
                      </div>
                      <Badge variant={agency.priority_tier === "A" ? "default" : "secondary"} className="text-xs">
                        {agency.priority_tier}
                      </Badge>
                    </div>
                    {kpis.renewal_risk_flag && (
                      <Badge variant="destructive" className="text-xs mb-2">
                        {copy.risk}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" className="w-full" onClick={() => addToVisits(agency.agency_id)}>
                      {copy.addToPlan}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

        <div className="min-w-[360px] flex-[0.86] min-h-0 flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{copy.todaysPlan}</h2>
                <p className="text-sm text-slate-600">{copy.visitsPlanned(planner.visits.length)}</p>
              </div>
              <div className="text-xs text-slate-500 text-right whitespace-nowrap pt-1">
                {copy.autosave}: {planner.autosave.status}
                {planner.autosave.lastSavedAt
                  ? ` · ${new Date(planner.autosave.lastSavedAt).toLocaleTimeString(i18nCopy.locale)}`
                  : ""}
              </div>
            </div>
            <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
              <Button
                variant="outline"
                onClick={() => {
                  if (!planner.selectedVisitId) {
                    return;
                  }
                  removeFromVisits(planner.selectedVisitId);
                }}
                disabled={!planner.selectedVisitId}
                className="w-full h-auto py-2 whitespace-normal leading-tight text-rose-600 border-rose-200 hover:text-rose-700 hover:border-rose-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {copy.removeSelected}
              </Button>
              <Button
                variant="outline"
                onClick={optimizeRoute}
                disabled={isOptimizing}
                className="w-full h-auto py-2 whitespace-normal leading-tight"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {isOptimizing ? copy.optimizing : copy.optimizeRoute}
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {planner.visits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">{copy.noVisitsPlanned}</p>
              </div>
            ) : (
              <div>
                {planner.visits.map((visit, index) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    index={index}
                    moveVisit={movePlannerVisit}
                    onSelect={() => selectPlannerVisit(visit.id)}
                    isSelected={planner.selectedVisitId === visit.id}
                    onGeneratePrep={() => generateVisitPrep(visit.id)}
                    isGeneratingPrep={generatingVisitId === visit.id}
                    onRemove={() => removeFromVisits(visit.id)}
                    copy={copy}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

        <div className="w-[26rem] xl:w-[29rem] shrink-0 min-h-0 border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900">{copy.visitDetails}</h3>
        </div>

        {selectedVisitData && selectedAgency ? (
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-4">
              <section className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{selectedAgency.agency_name}</h4>
                  <p className="text-sm text-slate-600">
                    {selectedAgency.city} · {selectedAgency.district}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{copy.meetingObjective}</label>
                  <Select
                    value={selectedVisitData.goal}
                    onValueChange={(value) =>
                      updatePlannerVisit(selectedVisitData.id, {
                        goal: value as DailyPlanVisit["goal"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renewal">{copy.objectiveRenewal}</SelectItem>
                      <SelectItem value="claims">{copy.objectiveClaims}</SelectItem>
                      <SelectItem value="cross-sell">{copy.objectiveCrossSell}</SelectItem>
                      <SelectItem value="relationship">{copy.objectiveRelationship}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{copy.timeWindow}</label>
                  <Input value={selectedVisitData.time_window} readOnly />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">{copy.meetingPrep}</h4>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{copy.notes}</label>
                  <Textarea
                    placeholder={copy.notesPlaceholder}
                    value={selectedVisitData.notes}
                    onChange={(event) => {
                      updatePlannerVisit(selectedVisitData.id, {
                        notes: event.target.value,
                      });
                    }}
                    rows={4}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => generateVisitPrep(selectedVisitData.id)}
                  disabled={generatingVisitId === selectedVisitData.id}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generatingVisitId === selectedVisitData.id ? copy.generating : copy.generateMeetingPrep}
                </Button>
                <AIInteractionShell
                  language={settings.language}
                  status={aiStatus}
                  error={aiError}
                  trace={aiTrace}
                  evidenceMap={aiEvidenceMap}
                  onRetry={
                    lastRetryRef.current
                      ? () => {
                          if (lastRetryRef.current) {
                            void lastRetryRef.current();
                          }
                        }
                      : null
                  }
                  loadingText={copy.generating}
                />
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-2">{copy.checklist}</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={planner.checklistByVisit[selectedVisitData.id]?.reviewKpis || false}
                      onChange={(event) =>
                        setVisitChecklist(selectedVisitData.id, {
                          reviewKpis: event.target.checked,
                        })
                      }
                    />
                    {copy.checklistReviewKpis}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={planner.checklistByVisit[selectedVisitData.id]?.prepareTalkingPoints || false}
                      onChange={(event) =>
                        setVisitChecklist(selectedVisitData.id, {
                          prepareTalkingPoints: event.target.checked,
                        })
                      }
                    />
                    {copy.checklistPrepareTalkingPoints}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={planner.checklistByVisit[selectedVisitData.id]?.reviewLastNotes || false}
                      onChange={(event) =>
                        setVisitChecklist(selectedVisitData.id, {
                          reviewLastNotes: event.target.checked,
                        })
                      }
                    />
                    {copy.checklistReviewLastNotes}
                  </label>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">{copy.afterVisit}</h4>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{copy.outcome}</label>
                  <Select
                    value={planner.outcomesByVisit[selectedVisitData.id] || "unknown"}
                    onValueChange={(value) => {
                      if (value === "unknown") {
                        return;
                      }
                      handleOutcomeChange(selectedVisitData.id, value as "success" | "neutral" | "risk");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={copy.selectOutcome} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">{copy.outcomeNotSet}</SelectItem>
                      <SelectItem value="success">{copy.outcomeSuccess}</SelectItem>
                      <SelectItem value="neutral">{copy.outcomeNeutral}</SelectItem>
                      <SelectItem value="risk">{copy.outcomeRisk}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-rose-600 border-rose-200 hover:text-rose-700 hover:border-rose-300"
                  onClick={() => removeFromVisits(selectedVisitData.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {copy.removeVisit}
                </Button>
              </section>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-slate-600 text-center">{copy.selectVisitHint}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export function DailyPlan() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DailyPlanContent />
    </DndProvider>
  );
}

function mapDailyPlanResponseToVisits(result: DailyPlanResponse): DailyPlanVisit[] {
  return result.plan.visits.map((visit) => ({
    id: `V${String(visit.order).padStart(3, "0")}-${visit.agency_id}`,
    agency_id: visit.agency_id,
    goal: visit.goal,
    time_window: visit.time_window,
    notes: visit.rationale.join(" "),
    order: visit.order,
  }));
}

function summarizeNarrativeForVisit(narrative: MeetingNarrative): string {
  const commitments = narrative.commitments_next_steps.slice(0, 2).join(" ");
  const question = narrative.questions_to_ask[0];
  return question ? `${commitments} Ask: ${question}` : commitments;
}
