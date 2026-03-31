import { useEffect, useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import type { I18nCopy } from "../../../i18n/copy";
import type {
  MeetingExpectedKpi,
  RecommendationEffectiveness,
  ValidationReason,
} from "../../../state/types";
import { RecommendationCard } from "./RecommendationCard";
import {
  getEffectivenessLabel,
  getValidationReasonLabel,
} from "./meetingUiUtils";
import type { OutcomeTrackingView } from "./types";

interface OutcomeDraft {
  baselineValue: string;
  tPlus7Delta: string;
  tPlus30Delta: string;
  effectiveness: RecommendationEffectiveness;
  assessedAt: string;
  linkedReportId: string | null;
}

interface ValidationDraft {
  reason: ValidationReason;
  notes: string;
}

interface OutcomeTrackingPanelProps {
  copy: I18nCopy["meetingPrep"];
  locale: string;
  view: OutcomeTrackingView | null;
  getKpiLabel: (expectedKpi: MeetingExpectedKpi) => string;
  onSaveOutcome: (payload: {
    outcomeId: string | null;
    recommendationId: string;
    baselineValue: number;
    tPlus7Delta: number;
    tPlus30Delta: number;
    effectiveness: RecommendationEffectiveness;
    assessedAt: string;
    linkedReportId: string | null;
  }) => void;
  onAddValidationFlag: (payload: {
    recommendationId: string;
    reason: ValidationReason;
    notes: string;
  }) => void;
}

function parseNumericInput(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDefaultAssessedAt(): string {
  return new Date().toISOString().slice(0, 10);
}

export function OutcomeTrackingPanel({
  copy,
  locale,
  view,
  getKpiLabel,
  onSaveOutcome,
  onAddValidationFlag,
}: OutcomeTrackingPanelProps) {
  const [outcomeDrafts, setOutcomeDrafts] = useState<Record<string, OutcomeDraft>>({});
  const [validationDrafts, setValidationDrafts] = useState<Record<string, ValidationDraft>>({});

  useEffect(() => {
    if (!view) {
      setOutcomeDrafts({});
      setValidationDrafts({});
      return;
    }

    setOutcomeDrafts(
      view.items.reduce<Record<string, OutcomeDraft>>((accumulator, item) => {
        const recommendationId = item.recommendation.id;
        const baselineFallback = view.meeting.baseline_kpis[item.recommendation.expected_kpi];
        accumulator[recommendationId] = {
          baselineValue: String(item.outcome?.baseline_value ?? baselineFallback),
          tPlus7Delta: String(item.outcome?.t_plus_7_delta ?? 0),
          tPlus30Delta: String(item.outcome?.t_plus_30_delta ?? 0),
          effectiveness: item.outcome?.effectiveness || "inconclusive",
          assessedAt: item.outcome?.assessed_at || getDefaultAssessedAt(),
          linkedReportId: item.outcome?.linked_report_id || item.report?.id || null,
        };
        return accumulator;
      }, {}),
    );

    setValidationDrafts(
      view.items.reduce<Record<string, ValidationDraft>>((accumulator, item) => {
        accumulator[item.recommendation.id] = {
          reason: "data_issue",
          notes: "",
        };
        return accumulator;
      }, {}),
    );
  }, [view]);

  if (!view) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-slate-600">{copy.flowEmptyState}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {view.items.map((item) => {
        const recommendationId = item.recommendation.id;
        const draft = outcomeDrafts[recommendationId];
        const validationDraft = validationDrafts[recommendationId] || {
          reason: "data_issue" as const,
          notes: "",
        };

        if (!draft) {
          return null;
        }

        return (
          <RecommendationCard
            key={recommendationId}
            copy={copy}
            recommendation={item.recommendation}
            kpiLabel={getKpiLabel(item.recommendation.expected_kpi)}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.baselineKpi}</p>
                  <Input
                    type="number"
                    value={draft.baselineValue}
                    onChange={(event) =>
                      setOutcomeDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          baselineValue: event.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.kpiDeltaTPlus7}</p>
                  <Input
                    type="number"
                    value={draft.tPlus7Delta}
                    onChange={(event) =>
                      setOutcomeDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          tPlus7Delta: event.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.kpiDeltaTPlus30}</p>
                  <Input
                    type="number"
                    value={draft.tPlus30Delta}
                    onChange={(event) =>
                      setOutcomeDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          tPlus30Delta: event.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.effectivenessLabel}</p>
                  <Select
                    value={draft.effectiveness}
                    onValueChange={(value) =>
                      setOutcomeDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          effectiveness: value as RecommendationEffectiveness,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["effective", "ineffective", "inconclusive"] as const).map((effectiveness) => (
                        <SelectItem key={effectiveness} value={effectiveness}>
                          {getEffectivenessLabel(copy, effectiveness)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.assessedAt}</p>
                  <Input
                    type="date"
                    value={draft.assessedAt}
                    onChange={(event) =>
                      setOutcomeDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          assessedAt: event.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.linkedReport}</p>
                  <p className="h-9 rounded-md border bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {draft.linkedReportId || copy.noReportLinked}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {copy.effectivenessLabel}: {getEffectivenessLabel(copy, draft.effectiveness)}
                </Badge>
                <Button
                  size="sm"
                  onClick={() =>
                    onSaveOutcome({
                      outcomeId: item.outcome?.id || null,
                      recommendationId,
                      baselineValue: parseNumericInput(draft.baselineValue),
                      tPlus7Delta: parseNumericInput(draft.tPlus7Delta),
                      tPlus30Delta: parseNumericInput(draft.tPlus30Delta),
                      effectiveness: draft.effectiveness,
                      assessedAt: draft.assessedAt,
                      linkedReportId: draft.linkedReportId,
                    })
                  }
                >
                  {copy.saveOutcome}
                </Button>
              </div>

              <div className="rounded-md border border-slate-200 p-3 space-y-3">
                <p className="text-xs font-medium text-slate-700">{copy.validationFlags}</p>

                {item.flags.length > 0 ? (
                  <div className="space-y-2">
                    {item.flags.map((flag) => (
                      <div
                        key={flag.id}
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-700 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="text-[11px]">
                            {getValidationReasonLabel(copy, flag.reason)}
                          </Badge>
                          <span>{new Date(flag.created_at).toLocaleDateString(locale)}</span>
                        </div>
                        <p>{flag.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">{copy.noValidationFlags}</p>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-end">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700">{copy.addValidationFlag}</p>
                    <Select
                      value={validationDraft.reason}
                      onValueChange={(value) =>
                        setValidationDrafts((current) => ({
                          ...current,
                          [recommendationId]: {
                            ...validationDraft,
                            reason: value as ValidationReason,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["data_issue", "context_mismatch", "execution_failure"] as const).map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {getValidationReasonLabel(copy, reason)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700">{copy.validationNotes}</p>
                    <Textarea
                      value={validationDraft.notes}
                      onChange={(event) =>
                        setValidationDrafts((current) => ({
                          ...current,
                          [recommendationId]: {
                            ...validationDraft,
                            notes: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[76px]"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      onAddValidationFlag({
                        recommendationId,
                        reason: validationDraft.reason,
                        notes: validationDraft.notes,
                      });
                      setValidationDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...validationDraft,
                          notes: "",
                        },
                      }));
                    }}
                  >
                    {copy.addFlag}
                  </Button>
                </div>
              </div>
            </div>
          </RecommendationCard>
        );
      })}
    </div>
  );
}
