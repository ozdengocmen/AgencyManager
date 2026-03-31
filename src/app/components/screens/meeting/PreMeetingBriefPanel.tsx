import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import type { I18nCopy } from "../../../i18n/copy";
import type { MeetingExpectedKpi, RecommendationDecisionStatus } from "../../../state/types";
import type { PreMeetingBriefView } from "./types";
import { RecommendationCard } from "./RecommendationCard";
import { getDecisionLabel } from "./meetingUiUtils";

interface DecisionDraft {
  decision: RecommendationDecisionStatus;
  reason: string;
  editedText: string;
}

interface PreMeetingBriefPanelProps {
  copy: I18nCopy["meetingPrep"];
  view: PreMeetingBriefView | null;
  getKpiLabel: (expectedKpi: MeetingExpectedKpi) => string;
  onSaveDecision: (payload: {
    recommendationId: string;
    decision: RecommendationDecisionStatus;
    reason: string;
    editedText: string;
  }) => void;
}

export function PreMeetingBriefPanel({
  copy,
  view,
  getKpiLabel,
  onSaveDecision,
}: PreMeetingBriefPanelProps) {
  const [drafts, setDrafts] = useState<Record<string, DecisionDraft>>({});

  useEffect(() => {
    if (!view) {
      setDrafts({});
      return;
    }

    setDrafts(
      view.items.reduce<Record<string, DecisionDraft>>((accumulator, item) => {
        accumulator[item.recommendation.id] = {
          decision: item.decision?.decision || "proposed",
          reason: item.decision?.reason || "",
          editedText: item.decision?.edited_text || "",
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
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{copy.keyPoints}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {view.brief?.key_points.length ? (
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {view.brief.key_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">{copy.noBriefAvailable}</p>
          )}
        </CardContent>
      </Card>

      {view.items.length === 0 ? <p className="text-sm text-slate-600">{copy.noRecommendations}</p> : null}

      {view.items.map((item) => {
        const recommendationId = item.recommendation.id;
        const draft = drafts[recommendationId] || {
          decision: "proposed" as const,
          reason: "",
          editedText: "",
        };

        return (
          <RecommendationCard
            key={recommendationId}
            copy={copy}
            recommendation={item.recommendation}
            decisionStatus={draft.decision}
            decisionReason={draft.reason}
            decisionEditedText={draft.decision === "modified" ? draft.editedText : ""}
            kpiLabel={getKpiLabel(item.recommendation.expected_kpi)}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.recommendationDecision}</p>
                  <Select
                    value={draft.decision}
                    onValueChange={(value) => {
                      setDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          decision: value as RecommendationDecisionStatus,
                        },
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["proposed", "accepted", "modified", "rejected"] as const).map((status) => (
                        <SelectItem key={status} value={status}>
                          {getDecisionLabel(copy, status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.decisionReason}</p>
                  <Textarea
                    value={draft.reason}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          reason: nextValue,
                        },
                      }));
                    }}
                    className="min-h-[92px]"
                  />
                </div>
              </div>

              {draft.decision === "modified" ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">{copy.editedRecommendation}</p>
                  <Textarea
                    value={draft.editedText}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setDrafts((current) => ({
                        ...current,
                        [recommendationId]: {
                          ...draft,
                          editedText: nextValue,
                        },
                      }));
                    }}
                    className="min-h-[92px]"
                  />
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() =>
                    onSaveDecision({
                      recommendationId,
                      decision: draft.decision,
                      reason: draft.reason,
                      editedText: draft.editedText,
                    })
                  }
                >
                  {copy.saveDecision}
                </Button>
              </div>
            </div>
          </RecommendationCard>
        );
      })}
    </div>
  );
}
