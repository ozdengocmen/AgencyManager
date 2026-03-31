import type {
  MeetingRecord,
  PostMeetingReport,
  RecommendationDecision,
  RecommendationOutcome,
  ValidationFlag,
} from "../../../state/types";
import type {
  MeetingFlowData,
  OutcomeTrackingView,
  PostMeetingReviewView,
  PreMeetingBriefView,
} from "./types";

function byId<T extends { id: string }>(a: T, b: T): number {
  return a.id.localeCompare(b.id);
}

function byIsoDateThenId<T extends { id: string; date: string }>(a: T, b: T): number {
  const dateCmp = a.date.localeCompare(b.date);
  return dateCmp !== 0 ? dateCmp : byId(a, b);
}

function byIsoTimeDescThenId<T extends { id: string }>(
  getTimestamp: (value: T) => string,
): (a: T, b: T) => number {
  return (a, b) => {
    const timeCmp = getTimestamp(b).localeCompare(getTimestamp(a));
    return timeCmp !== 0 ? timeCmp : byId(a, b);
  };
}

function selectLatestBy<T extends { id: string }>(items: T[], byDesc: (a: T, b: T) => number): T | null {
  if (items.length === 0) {
    return null;
  }
  return [...items].sort(byDesc)[0] || null;
}

function getMeetingOrNull(data: MeetingFlowData, meetingId: string | null | undefined): MeetingRecord | null {
  const sortedMeetings = [...data.meetings].sort(byIsoDateThenId);
  if (sortedMeetings.length === 0) {
    return null;
  }
  if (!meetingId) {
    return sortedMeetings[0];
  }
  return sortedMeetings.find((meeting) => meeting.id === meetingId) || null;
}

function getLatestDecision(
  decisions: RecommendationDecision[],
  recommendationId: string,
): RecommendationDecision | null {
  return selectLatestBy(
    decisions.filter((decision) => decision.recommendation_id === recommendationId),
    byIsoTimeDescThenId((entry) => entry.decided_at),
  );
}

function getLatestReport(reports: PostMeetingReport[], meetingId: string): PostMeetingReport | null {
  return selectLatestBy(
    reports.filter((report) => report.meeting_id === meetingId),
    byIsoTimeDescThenId((entry) => entry.created_at),
  );
}

function getLatestOutcome(
  outcomes: RecommendationOutcome[],
  recommendationId: string,
): RecommendationOutcome | null {
  return selectLatestBy(
    outcomes.filter((outcome) => outcome.recommendation_id === recommendationId),
    byIsoTimeDescThenId((entry) => entry.assessed_at),
  );
}

function getRecommendationFlags(
  flags: ValidationFlag[],
  recommendationId: string,
): ValidationFlag[] {
  return flags
    .filter((flag) => flag.recommendation_id === recommendationId)
    .sort(byIsoTimeDescThenId((entry) => entry.created_at));
}

export function selectPreMeetingBriefView(
  data: MeetingFlowData,
  meetingId: string | null | undefined,
): PreMeetingBriefView | null {
  const meeting = getMeetingOrNull(data, meetingId);
  if (!meeting) {
    return null;
  }

  const brief =
    selectLatestBy(
      data.pre_meeting_briefs.filter((entry) => entry.meeting_id === meeting.id),
      byIsoTimeDescThenId((entry) => entry.generated_at),
    ) || null;

  const recommendations = data.recommendations
    .filter((recommendation) => recommendation.meeting_id === meeting.id)
    .sort(byId);

  return {
    meeting,
    brief,
    items: recommendations.map((recommendation) => ({
      recommendation,
      decision: getLatestDecision(data.recommendation_decisions, recommendation.id),
    })),
  };
}

export function selectPostMeetingReviewView(
  data: MeetingFlowData,
  meetingId: string | null | undefined,
): PostMeetingReviewView | null {
  const meeting = getMeetingOrNull(data, meetingId);
  if (!meeting) {
    return null;
  }

  const report = getLatestReport(data.post_meeting_reports, meeting.id);
  const recommendations = data.recommendations
    .filter((recommendation) => recommendation.meeting_id === meeting.id)
    .sort(byId);

  return {
    meeting,
    report,
    items: recommendations.map((recommendation) => ({
      recommendation,
      decision: getLatestDecision(data.recommendation_decisions, recommendation.id),
      report_evidence: report ? report.discussion_summary : "",
      consistency: report?.recommendation_consistency[recommendation.id] || "unknown",
      ai_suggestion: report?.ai_critique || "",
    })),
  };
}

export function selectOutcomeTrackingView(
  data: MeetingFlowData,
  meetingId: string | null | undefined,
): OutcomeTrackingView | null {
  const meeting = getMeetingOrNull(data, meetingId);
  if (!meeting) {
    return null;
  }

  const reports = data.post_meeting_reports.filter((report) => report.meeting_id === meeting.id);
  const reportById = new Map(reports.map((report) => [report.id, report]));
  const fallbackReport = getLatestReport(reports, meeting.id);
  const recommendations = data.recommendations
    .filter((recommendation) => recommendation.meeting_id === meeting.id)
    .sort(byId);

  return {
    meeting,
    items: recommendations.map((recommendation) => {
      const outcome = getLatestOutcome(data.recommendation_outcomes, recommendation.id);
      const linkedReport =
        outcome?.linked_report_id ? reportById.get(outcome.linked_report_id) || null : null;
      return {
        recommendation,
        outcome,
        report: linkedReport || fallbackReport || null,
        flags: getRecommendationFlags(data.validation_flags, recommendation.id),
      };
    }),
  };
}

export function selectPreMeetingBriefViews(data: MeetingFlowData): PreMeetingBriefView[] {
  return [...data.meetings]
    .sort(byIsoDateThenId)
    .map((meeting) => selectPreMeetingBriefView(data, meeting.id))
    .filter((entry): entry is PreMeetingBriefView => entry !== null);
}

export function selectPostMeetingReviewViews(data: MeetingFlowData): PostMeetingReviewView[] {
  return [...data.meetings]
    .sort(byIsoDateThenId)
    .map((meeting) => selectPostMeetingReviewView(data, meeting.id))
    .filter((entry): entry is PostMeetingReviewView => entry !== null);
}

export function selectOutcomeTrackingViews(data: MeetingFlowData): OutcomeTrackingView[] {
  return [...data.meetings]
    .sort(byIsoDateThenId)
    .map((meeting) => selectOutcomeTrackingView(data, meeting.id))
    .filter((entry): entry is OutcomeTrackingView => entry !== null);
}
