import type { I18nCopy } from "../../../i18n/copy";
import type {
  MeetingExpectedKpi,
  MeetingObjective,
  RecommendationConsistency,
  RecommendationDecisionStatus,
  RecommendationEffectiveness,
  ValidationReason,
} from "../../../state/types";

export function getDecisionLabel(
  copy: I18nCopy["meetingPrep"],
  status: RecommendationDecisionStatus,
): string {
  const labels: Record<RecommendationDecisionStatus, string> = {
    proposed: copy.decisionProposed,
    accepted: copy.decisionAccepted,
    modified: copy.decisionModified,
    rejected: copy.decisionRejected,
  };
  return labels[status];
}

export function getConsistencyLabel(
  copy: I18nCopy["meetingPrep"],
  status: RecommendationConsistency | "unknown",
): string {
  if (status === "match") {
    return copy.consistencyMatch;
  }
  if (status === "mismatch") {
    return copy.consistencyMismatch;
  }
  return copy.consistencyUnknown;
}

export function getEffectivenessLabel(
  copy: I18nCopy["meetingPrep"],
  effectiveness: RecommendationEffectiveness,
): string {
  const labels: Record<RecommendationEffectiveness, string> = {
    effective: copy.effectivenessEffective,
    ineffective: copy.effectivenessIneffective,
    inconclusive: copy.effectivenessInconclusive,
  };
  return labels[effectiveness];
}

export function getValidationReasonLabel(
  copy: I18nCopy["meetingPrep"],
  reason: ValidationReason,
): string {
  const labels: Record<ValidationReason, string> = {
    data_issue: copy.validationReasonDataIssue,
    context_mismatch: copy.validationReasonContextMismatch,
    execution_failure: copy.validationReasonExecutionFailure,
  };
  return labels[reason];
}

export function getMeetingObjectiveLabel(i18nCopy: I18nCopy, objective: MeetingObjective): string {
  const labels: Record<MeetingObjective, string> = {
    renewal: i18nCopy.dailyPlan.goalRenewal,
    claims: i18nCopy.dailyPlan.goalClaims,
    "cross-sell": i18nCopy.dailyPlan.goalCrossSell,
    relationship: i18nCopy.dailyPlan.goalRelationship,
  };
  return labels[objective];
}

export function getExpectedKpiLabel(i18nCopy: I18nCopy, expectedKpi: MeetingExpectedKpi): string {
  const labels: Record<MeetingExpectedKpi, string> = {
    renewal_rate: i18nCopy.agencyProfile.renewalRate,
    claims_ratio: i18nCopy.agencyProfile.claimsRatio,
    yoy_growth_motor: `${i18nCopy.agencyProfile.branchLabel("motor")} ${i18nCopy.agencyProfile.branchGrowthPercent}`,
    yoy_growth_home: `${i18nCopy.agencyProfile.branchLabel("home")} ${i18nCopy.agencyProfile.branchGrowthPercent}`,
    yoy_growth_health: `${i18nCopy.agencyProfile.branchLabel("health")} ${i18nCopy.agencyProfile.branchGrowthPercent}`,
    overall_health_score: i18nCopy.agencyProfile.healthScore,
  };
  return labels[expectedKpi];
}

export function splitMultilineInput(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function joinMultilineValues(values: string[]): string {
  return values.join("\n");
}
