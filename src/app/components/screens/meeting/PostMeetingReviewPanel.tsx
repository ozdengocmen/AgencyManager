import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import type { I18nCopy } from "../../../i18n/copy";
import type { MeetingExpectedKpi, RecommendationConsistency } from "../../../state/types";
import { RecommendationCard } from "./RecommendationCard";
import { splitMultilineInput } from "./meetingUiUtils";
import type { PostMeetingReviewView } from "./types";

interface PostMeetingReviewPanelProps {
  copy: I18nCopy["meetingPrep"];
  view: PostMeetingReviewView | null;
  getKpiLabel: (expectedKpi: MeetingExpectedKpi) => string;
  onSaveReport: (payload: {
    reportId: string | null;
    discussionSummary: string;
    commitments: string[];
    deviations: string[];
    recommendationConsistency: Record<string, RecommendationConsistency>;
    aiCritique: string;
  }) => void;
}

export function PostMeetingReviewPanel({
  copy,
  view,
  getKpiLabel,
  onSaveReport,
}: PostMeetingReviewPanelProps) {
  const [discussionSummary, setDiscussionSummary] = useState("");
  const [commitmentsInput, setCommitmentsInput] = useState("");
  const [deviationsInput, setDeviationsInput] = useState("");
  const [aiCritique, setAiCritique] = useState("");
  const [consistencyByRecommendation, setConsistencyByRecommendation] = useState<
    Record<string, RecommendationConsistency>
  >({});

  useEffect(() => {
    if (!view) {
      setDiscussionSummary("");
      setCommitmentsInput("");
      setDeviationsInput("");
      setAiCritique("");
      setConsistencyByRecommendation({});
      return;
    }

    setDiscussionSummary(view.report?.discussion_summary || "");
    setCommitmentsInput((view.report?.commitments || []).join("\n"));
    setDeviationsInput((view.report?.deviations || []).join("\n"));
    setAiCritique(view.report?.ai_critique || "");

    setConsistencyByRecommendation(
      view.items.reduce<Record<string, RecommendationConsistency>>((accumulator, item) => {
        accumulator[item.recommendation.id] = item.consistency === "match" ? "match" : "mismatch";
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
          <CardTitle className="text-sm">{copy.postMeetingReviewPanel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-700">{copy.reportSummary}</p>
            <Textarea
              value={discussionSummary}
              onChange={(event) => setDiscussionSummary(event.target.value)}
              className="min-h-[84px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">{copy.commitments}</p>
              <Textarea
                value={commitmentsInput}
                onChange={(event) => setCommitmentsInput(event.target.value)}
                className="min-h-[92px]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">{copy.deviations}</p>
              <Textarea
                value={deviationsInput}
                onChange={(event) => setDeviationsInput(event.target.value)}
                className="min-h-[92px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-700">{copy.aiCritiqueSuggestion}</p>
            <Textarea
              value={aiCritique}
              onChange={(event) => setAiCritique(event.target.value)}
              className="min-h-[92px]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                onSaveReport({
                  reportId: view.report?.id || null,
                  discussionSummary,
                  commitments: splitMultilineInput(commitmentsInput),
                  deviations: splitMultilineInput(deviationsInput),
                  recommendationConsistency: consistencyByRecommendation,
                  aiCritique,
                })
              }
            >
              {copy.saveReport}
            </Button>
          </div>
        </CardContent>
      </Card>

      {view.items.map((item) => {
        const recommendationId = item.recommendation.id;
        const consistency = consistencyByRecommendation[recommendationId] || "mismatch";

        return (
          <RecommendationCard
            key={recommendationId}
            copy={copy}
            recommendation={item.recommendation}
            decisionStatus={item.decision?.decision || "proposed"}
            decisionReason={item.decision?.reason}
            decisionEditedText={item.decision?.edited_text}
            kpiLabel={getKpiLabel(item.recommendation.expected_kpi)}
          >
            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <p className="font-medium">{copy.meetingReportEvidence}</p>
                <p className="mt-1 rounded-md bg-slate-100 p-2 text-slate-700">
                  {discussionSummary || copy.consistencyUnknown}
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-medium">{copy.consistencyFlag}</p>
                <Select
                  value={consistency}
                  onValueChange={(value) =>
                    setConsistencyByRecommendation((current) => ({
                      ...current,
                      [recommendationId]: value as RecommendationConsistency,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">{copy.consistencyMatch}</SelectItem>
                    <SelectItem value="mismatch">{copy.consistencyMismatch}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="font-medium">{copy.aiCritiqueSuggestion}</p>
                <p className="mt-1 rounded-md bg-slate-100 p-2 text-slate-700">
                  {aiCritique || item.ai_suggestion || copy.consistencyUnknown}
                </p>
              </div>
            </div>
          </RecommendationCard>
        );
      })}
    </div>
  );
}
