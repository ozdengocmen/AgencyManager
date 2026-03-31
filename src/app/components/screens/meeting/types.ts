import type {
  MeetingFlowDraftState,
  MeetingRecord,
  PostMeetingReport,
  PreMeetingBrief,
  Recommendation,
  RecommendationDecision,
  RecommendationOutcome,
  ValidationFlag,
} from "../../../state/types";

export type MeetingFlowData = Pick<
  MeetingFlowDraftState,
  | "meetings"
  | "pre_meeting_briefs"
  | "recommendations"
  | "recommendation_decisions"
  | "post_meeting_reports"
  | "recommendation_outcomes"
  | "validation_flags"
>;

export interface PreMeetingRecommendationView {
  recommendation: Recommendation;
  decision: RecommendationDecision | null;
}

export interface PreMeetingBriefView {
  meeting: MeetingRecord;
  brief: PreMeetingBrief | null;
  items: PreMeetingRecommendationView[];
}

export interface PostMeetingRecommendationReviewView {
  recommendation: Recommendation;
  decision: RecommendationDecision | null;
  report_evidence: string;
  consistency: "match" | "mismatch" | "unknown";
  ai_suggestion: string;
}

export interface PostMeetingReviewView {
  meeting: MeetingRecord;
  report: PostMeetingReport | null;
  items: PostMeetingRecommendationReviewView[];
}

export interface OutcomeTrackingRecommendationView {
  recommendation: Recommendation;
  outcome: RecommendationOutcome | null;
  report: PostMeetingReport | null;
  flags: ValidationFlag[];
}

export interface OutcomeTrackingView {
  meeting: MeetingRecord;
  items: OutcomeTrackingRecommendationView[];
}
