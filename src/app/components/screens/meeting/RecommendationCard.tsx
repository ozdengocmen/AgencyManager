import type { ReactNode } from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import type { I18nCopy } from "../../../i18n/copy";
import type { Recommendation, RecommendationDecisionStatus } from "../../../state/types";
import { getDecisionLabel } from "./meetingUiUtils";

interface RecommendationCardProps {
  copy: I18nCopy["meetingPrep"];
  recommendation: Recommendation;
  kpiLabel: string;
  decisionStatus?: RecommendationDecisionStatus;
  decisionReason?: string;
  decisionEditedText?: string;
  children?: ReactNode;
}

function getDecisionBadgeVariant(decision: RecommendationDecisionStatus) {
  if (decision === "accepted") {
    return "default";
  }
  if (decision === "rejected") {
    return "destructive";
  }
  return "secondary";
}

export function RecommendationCard({
  copy,
  recommendation,
  kpiLabel,
  decisionStatus = "proposed",
  decisionReason,
  decisionEditedText,
  children,
}: RecommendationCardProps) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{recommendation.text}</p>
          <Badge variant={getDecisionBadgeVariant(decisionStatus)}>
            {getDecisionLabel(copy, decisionStatus)}
          </Badge>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p>
            <span className="font-medium text-slate-700">{copy.recommendationRationale}: </span>
            {recommendation.rationale}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <p>
              <span className="font-medium text-slate-700">{copy.expectedKpi}: </span>
              {kpiLabel}
            </p>
            <p>
              <span className="font-medium text-slate-700">{copy.expectedImpactWindow}: </span>
              {recommendation.expected_window_days}d
            </p>
            <p>
              <span className="font-medium text-slate-700">{copy.recommendationConfidence}: </span>
              {Math.round(recommendation.confidence * 100)}%
            </p>
          </div>

          {decisionReason ? (
            <p>
              <span className="font-medium text-slate-700">{copy.decisionReason}: </span>
              {decisionReason}
            </p>
          ) : null}

          {decisionEditedText ? (
            <p>
              <span className="font-medium text-slate-700">{copy.editedRecommendation}: </span>
              {decisionEditedText}
            </p>
          ) : null}
        </div>

        {children ? <div className="border-t pt-3">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
