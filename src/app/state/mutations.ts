export type MutationStatus = "idle" | "loading" | "success" | "error";

import type {
  MeetingFlowDraftState,
  PostMeetingReport,
  RecommendationDecision,
  RecommendationDecisionStatus,
  RecommendationOutcome,
  SalespersonId,
  ValidationFlag,
} from "./types";

export interface MutationRecord {
  status: MutationStatus;
  error: string | null;
  updatedAt: string | null;
}

export type MutationMap = Record<string, MutationRecord>;

export const IDLE_MUTATION: MutationRecord = {
  status: "idle",
  error: null,
  updatedAt: null,
};

export function toMutationRecord(
  status: MutationStatus,
  error: string | null = null,
): MutationRecord {
  return {
    status,
    error,
    updatedAt: new Date().toISOString(),
  };
}

export function resolveMutationError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  return fallback;
}

function nowIso(): string {
  return new Date().toISOString();
}

function uniqueStringList(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.length > 0)));
}

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return [...items, next];
  }
  const updated = [...items];
  updated[index] = next;
  return updated;
}

function sortById<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function touchMeetingFlow(state: MeetingFlowDraftState): MeetingFlowDraftState {
  return {
    ...state,
    updated_at: nowIso(),
  };
}

function syncReportOutcomeLinkage(state: MeetingFlowDraftState): MeetingFlowDraftState {
  const reportById = new Map(state.post_meeting_reports.map((report) => [report.id, report]));
  const linkedOutcomeIdsByReport = new Map<string, string[]>();

  for (const outcome of state.recommendation_outcomes) {
    if (!outcome.linked_report_id) {
      continue;
    }
    const bucket = linkedOutcomeIdsByReport.get(outcome.linked_report_id) || [];
    bucket.push(outcome.id);
    linkedOutcomeIdsByReport.set(outcome.linked_report_id, bucket);
  }

  const nextReports = state.post_meeting_reports.map((report) => {
    const currentLinks = Array.isArray(report.linked_outcome_ids) ? report.linked_outcome_ids : [];
    const mergedIds = uniqueStringList([
      ...currentLinks,
      ...(linkedOutcomeIdsByReport.get(report.id) || []),
    ]);
    return {
      ...report,
      linked_outcome_ids: mergedIds,
    };
  });

  // Remove link references pointing to non-existent reports.
  const nextOutcomes = state.recommendation_outcomes.map((outcome) => ({
    ...outcome,
    linked_report_id:
      outcome.linked_report_id && reportById.has(outcome.linked_report_id)
        ? outcome.linked_report_id
        : null,
  }));

  return {
    ...state,
    post_meeting_reports: nextReports,
    recommendation_outcomes: nextOutcomes,
  };
}

export interface RecommendationDecisionInput {
  id?: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  decision: RecommendationDecisionStatus;
  reason: string;
  edited_text?: string;
  decided_by: SalespersonId;
  decided_at?: string;
}

export function applyRecommendationDecision(
  state: MeetingFlowDraftState,
  input: RecommendationDecisionInput,
): MeetingFlowDraftState {
  const existing =
    (input.id ? state.recommendation_decisions.find((entry) => entry.id === input.id) : null) ||
    state.recommendation_decisions.find(
      (entry) =>
        entry.recommendation_id === input.recommendation_id &&
        entry.meeting_id === input.meeting_id &&
        entry.agency_id === input.agency_id,
    );

  const nextDecision: RecommendationDecision = {
    id: existing?.id || input.id || `DEC_${input.recommendation_id}`,
    recommendation_id: input.recommendation_id,
    meeting_id: input.meeting_id,
    agency_id: input.agency_id,
    decision: input.decision,
    reason: input.reason.trim(),
    edited_text: input.edited_text?.trim() || undefined,
    decided_by: input.decided_by,
    decided_at: input.decided_at || nowIso(),
  };

  return touchMeetingFlow({
    ...state,
    recommendation_decisions: sortById(upsertById(state.recommendation_decisions, nextDecision)),
  });
}

export function upsertPostMeetingReportEntry(
  state: MeetingFlowDraftState,
  report: PostMeetingReport,
): MeetingFlowDraftState {
  const nextReport: PostMeetingReport = {
    ...report,
    linked_outcome_ids: uniqueStringList(report.linked_outcome_ids || []),
  };

  const withReport = {
    ...state,
    post_meeting_reports: sortById(upsertById(state.post_meeting_reports, nextReport)),
  };

  return touchMeetingFlow(syncReportOutcomeLinkage(withReport));
}

export function upsertRecommendationOutcomeEntry(
  state: MeetingFlowDraftState,
  outcome: RecommendationOutcome,
): MeetingFlowDraftState {
  const nextOutcome: RecommendationOutcome = {
    ...outcome,
    linked_report_id: outcome.linked_report_id || null,
  };

  const withOutcome = {
    ...state,
    recommendation_outcomes: sortById(upsertById(state.recommendation_outcomes, nextOutcome)),
  };

  return touchMeetingFlow(syncReportOutcomeLinkage(withOutcome));
}

export function upsertValidationFlagEntry(
  state: MeetingFlowDraftState,
  flag: ValidationFlag,
): MeetingFlowDraftState {
  return touchMeetingFlow({
    ...state,
    validation_flags: sortById(upsertById(state.validation_flags, flag)),
  });
}

export function setSelectedMeetingId(
  state: MeetingFlowDraftState,
  meetingId: string | null,
): MeetingFlowDraftState {
  if (meetingId && !state.meetings.some((meeting) => meeting.id === meetingId)) {
    return state;
  }
  return {
    ...state,
    selected_meeting_id: meetingId,
  };
}

export function mergeMeetingFlowDraftState(
  defaults: MeetingFlowDraftState,
  payload: Partial<MeetingFlowDraftState>,
): MeetingFlowDraftState {
  const meetings = Array.isArray(payload.meetings) ? payload.meetings : defaults.meetings;
  const selectedMeetingIdRaw =
    typeof payload.selected_meeting_id === "string" || payload.selected_meeting_id === null
      ? payload.selected_meeting_id
      : defaults.selected_meeting_id;
  const selectedMeetingId =
    selectedMeetingIdRaw && meetings.some((meeting) => meeting.id === selectedMeetingIdRaw)
      ? selectedMeetingIdRaw
      : meetings[0]?.id || null;

  return syncReportOutcomeLinkage({
    ...defaults,
    ...payload,
    meetings,
    pre_meeting_briefs: Array.isArray(payload.pre_meeting_briefs)
      ? payload.pre_meeting_briefs
      : defaults.pre_meeting_briefs,
    recommendations: Array.isArray(payload.recommendations)
      ? payload.recommendations
      : defaults.recommendations,
    recommendation_decisions: Array.isArray(payload.recommendation_decisions)
      ? payload.recommendation_decisions
      : defaults.recommendation_decisions,
    post_meeting_reports: Array.isArray(payload.post_meeting_reports)
      ? payload.post_meeting_reports
      : defaults.post_meeting_reports,
    recommendation_outcomes: Array.isArray(payload.recommendation_outcomes)
      ? payload.recommendation_outcomes
      : defaults.recommendation_outcomes,
    validation_flags: Array.isArray(payload.validation_flags)
      ? payload.validation_flags
      : defaults.validation_flags,
    selected_meeting_id: selectedMeetingId,
    updated_at: typeof payload.updated_at === "string" ? payload.updated_at : defaults.updated_at,
  });
}
