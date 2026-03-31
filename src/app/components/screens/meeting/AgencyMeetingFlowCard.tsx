import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { mockAgencies } from "../../../data/mockData";
import { useI18n } from "../../../i18n";
import { useAppState } from "../../../state";
import type {
  MeetingExpectedKpi,
  RecommendationConsistency,
  RecommendationDecisionStatus,
  RecommendationEffectiveness,
  ValidationReason,
} from "../../../state/types";
import { OutcomeTrackingPanel } from "./OutcomeTrackingPanel";
import { PostMeetingReviewPanel } from "./PostMeetingReviewPanel";
import { PreMeetingBriefPanel } from "./PreMeetingBriefPanel";
import {
  selectOutcomeTrackingView,
  selectPostMeetingReviewView,
  selectPreMeetingBriefView,
} from "./meetingSelectors";
import { getExpectedKpiLabel, getMeetingObjectiveLabel } from "./meetingUiUtils";

interface AgencyMeetingFlowCardProps {
  agencyId: string;
}

export function AgencyMeetingFlowCard({ agencyId }: AgencyMeetingFlowCardProps) {
  const { copy: i18nCopy } = useI18n();
  const {
    state: { meetingFlow, session },
    selectMeetingFlowMeeting,
    setRecommendationDecision,
    upsertPostMeetingReport,
    upsertRecommendationOutcome,
    upsertValidationFlag,
  } = useAppState();
  const copy = i18nCopy.meetingPrep;
  const [flowTab, setFlowTab] = useState<"pre-brief" | "post-review" | "outcomes">("pre-brief");

  const scopedMeetingFlow = useMemo(() => {
    const meetings = meetingFlow.meetings.filter((meeting) => meeting.agency_id === agencyId);
    const meetingIds = new Set(meetings.map((meeting) => meeting.id));
    const recommendations = meetingFlow.recommendations.filter(
      (recommendation) => recommendation.agency_id === agencyId && meetingIds.has(recommendation.meeting_id),
    );
    const recommendationIds = new Set(recommendations.map((recommendation) => recommendation.id));

    return {
      ...meetingFlow,
      meetings,
      pre_meeting_briefs: meetingFlow.pre_meeting_briefs.filter(
        (brief) => brief.agency_id === agencyId && meetingIds.has(brief.meeting_id),
      ),
      recommendations,
      recommendation_decisions: meetingFlow.recommendation_decisions.filter(
        (decision) =>
          decision.agency_id === agencyId &&
          meetingIds.has(decision.meeting_id) &&
          recommendationIds.has(decision.recommendation_id),
      ),
      post_meeting_reports: meetingFlow.post_meeting_reports.filter(
        (report) => report.agency_id === agencyId && meetingIds.has(report.meeting_id),
      ),
      recommendation_outcomes: meetingFlow.recommendation_outcomes.filter(
        (outcome) =>
          outcome.agency_id === agencyId &&
          meetingIds.has(outcome.meeting_id) &&
          recommendationIds.has(outcome.recommendation_id),
      ),
      validation_flags: meetingFlow.validation_flags.filter(
        (flag) =>
          flag.agency_id === agencyId &&
          meetingIds.has(flag.meeting_id) &&
          recommendationIds.has(flag.recommendation_id),
      ),
      selected_meeting_id:
        meetingFlow.selected_meeting_id && meetingIds.has(meetingFlow.selected_meeting_id)
          ? meetingFlow.selected_meeting_id
          : null,
    };
  }, [agencyId, meetingFlow]);

  const meetingFlowMeetings = useMemo(
    () =>
      [...scopedMeetingFlow.meetings].sort(
        (left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id),
      ),
    [scopedMeetingFlow.meetings],
  );

  useEffect(() => {
    if (meetingFlowMeetings.length === 0) {
      if (meetingFlow.selected_meeting_id !== null) {
        selectMeetingFlowMeeting(null);
      }
      return;
    }

    const selectedMeetingId = meetingFlow.selected_meeting_id;
    const hasValidSelection =
      selectedMeetingId && meetingFlowMeetings.some((meeting) => meeting.id === selectedMeetingId);
    if (!hasValidSelection) {
      selectMeetingFlowMeeting(meetingFlowMeetings[0].id);
    }
  }, [meetingFlow.selected_meeting_id, meetingFlowMeetings, selectMeetingFlowMeeting]);

  const selectedMeeting = useMemo(() => {
    if (!scopedMeetingFlow.selected_meeting_id) {
      return null;
    }
    return (
      scopedMeetingFlow.meetings.find((meeting) => meeting.id === scopedMeetingFlow.selected_meeting_id) || null
    );
  }, [scopedMeetingFlow.meetings, scopedMeetingFlow.selected_meeting_id]);

  const preMeetingBriefView = useMemo(
    () => selectPreMeetingBriefView(scopedMeetingFlow, scopedMeetingFlow.selected_meeting_id),
    [scopedMeetingFlow],
  );
  const postMeetingReviewView = useMemo(
    () => selectPostMeetingReviewView(scopedMeetingFlow, scopedMeetingFlow.selected_meeting_id),
    [scopedMeetingFlow],
  );
  const outcomeTrackingView = useMemo(
    () => selectOutcomeTrackingView(scopedMeetingFlow, scopedMeetingFlow.selected_meeting_id),
    [scopedMeetingFlow],
  );

  const actorRole = session.user?.role === "manager" ? "manager" : "salesperson";
  const getKpiLabel = (expectedKpi: MeetingExpectedKpi): string => getExpectedKpiLabel(i18nCopy, expectedKpi);

  const handleSaveRecommendationDecision = (payload: {
    recommendationId: string;
    decision: RecommendationDecisionStatus;
    reason: string;
    editedText: string;
  }) => {
    if (!preMeetingBriefView) {
      return;
    }
    setRecommendationDecision({
      recommendation_id: payload.recommendationId,
      meeting_id: preMeetingBriefView.meeting.id,
      agency_id: preMeetingBriefView.meeting.agency_id,
      decision: payload.decision,
      reason: payload.reason,
      edited_text: payload.decision === "modified" ? payload.editedText : undefined,
      decided_by: actorRole,
    });
  };

  const handleSavePostMeetingReport = (payload: {
    reportId: string | null;
    discussionSummary: string;
    commitments: string[];
    deviations: string[];
    recommendationConsistency: Record<string, RecommendationConsistency>;
    aiCritique: string;
  }) => {
    if (!postMeetingReviewView) {
      return;
    }

    const reportId = payload.reportId || `RPT_${postMeetingReviewView.meeting.id}`;
    upsertPostMeetingReport({
      id: reportId,
      meeting_id: postMeetingReviewView.meeting.id,
      agency_id: postMeetingReviewView.meeting.agency_id,
      discussion_summary: payload.discussionSummary.trim(),
      commitments: payload.commitments,
      deviations: payload.deviations,
      recommendation_consistency: payload.recommendationConsistency,
      ai_critique: payload.aiCritique.trim(),
      linked_outcome_ids: postMeetingReviewView.report?.linked_outcome_ids || [],
      created_by: actorRole,
      created_at: new Date().toISOString(),
    });
  };

  const handleSaveOutcome = (payload: {
    outcomeId: string | null;
    recommendationId: string;
    baselineValue: number;
    tPlus7Delta: number;
    tPlus30Delta: number;
    effectiveness: RecommendationEffectiveness;
    assessedAt: string;
    linkedReportId: string | null;
  }) => {
    if (!outcomeTrackingView) {
      return;
    }

    upsertRecommendationOutcome({
      id: payload.outcomeId || `OUT_${payload.recommendationId}`,
      recommendation_id: payload.recommendationId,
      meeting_id: outcomeTrackingView.meeting.id,
      agency_id: outcomeTrackingView.meeting.agency_id,
      baseline_value: payload.baselineValue,
      t_plus_7_delta: payload.tPlus7Delta,
      t_plus_30_delta: payload.tPlus30Delta,
      effectiveness: payload.effectiveness,
      assessed_at: payload.assessedAt,
      linked_report_id: payload.linkedReportId,
    });
  };

  const handleAddValidationFlag = (payload: {
    recommendationId: string;
    reason: ValidationReason;
    notes: string;
  }) => {
    if (!outcomeTrackingView) {
      return;
    }
    const notes = payload.notes.trim();
    if (!notes) {
      return;
    }

    upsertValidationFlag({
      id: `VAL_${payload.recommendationId}_${Date.now()}`,
      recommendation_id: payload.recommendationId,
      meeting_id: outcomeTrackingView.meeting.id,
      agency_id: outcomeTrackingView.meeting.agency_id,
      reason: payload.reason,
      reviewer_id: actorRole,
      notes,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{copy.flowTitle}</CardTitle>
            {selectedMeeting ? (
              <p className="text-xs text-slate-600">
                {new Date(selectedMeeting.date).toLocaleDateString(i18nCopy.locale)} ·{" "}
                {getMeetingObjectiveLabel(i18nCopy, selectedMeeting.objective)}
              </p>
            ) : (
              <p className="text-xs text-slate-600">{copy.flowEmptyState}</p>
            )}
          </div>

          {meetingFlowMeetings.length > 0 ? (
            <div className="w-full lg:max-w-sm space-y-1">
              <p className="text-xs font-medium text-slate-700">{copy.selectMeeting}</p>
              <Select
                value={scopedMeetingFlow.selected_meeting_id || meetingFlowMeetings[0].id}
                onValueChange={(value) => selectMeetingFlowMeeting(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meetingFlowMeetings.map((meeting) => {
                    const agencyName =
                      mockAgencies.find((agency) => agency.agency_id === meeting.agency_id)?.agency_name ||
                      meeting.agency_id;
                    return (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        {agencyName} - {new Date(meeting.date).toLocaleDateString(i18nCopy.locale)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={flowTab} onValueChange={(value) => setFlowTab(value as typeof flowTab)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="pre-brief">{copy.preMeetingBriefPanel}</TabsTrigger>
            <TabsTrigger value="post-review">{copy.postMeetingReviewPanel}</TabsTrigger>
            <TabsTrigger value="outcomes">{copy.outcomeTrackingPanel}</TabsTrigger>
          </TabsList>

          <TabsContent value="pre-brief" className="mt-4">
            <PreMeetingBriefPanel
              copy={copy}
              view={preMeetingBriefView}
              getKpiLabel={getKpiLabel}
              onSaveDecision={handleSaveRecommendationDecision}
            />
          </TabsContent>

          <TabsContent value="post-review" className="mt-4">
            <PostMeetingReviewPanel
              copy={copy}
              view={postMeetingReviewView}
              getKpiLabel={getKpiLabel}
              onSaveReport={handleSavePostMeetingReport}
            />
          </TabsContent>

          <TabsContent value="outcomes" className="mt-4">
            <OutcomeTrackingPanel
              copy={copy}
              locale={i18nCopy.locale}
              view={outcomeTrackingView}
              getKpiLabel={getKpiLabel}
              onSaveOutcome={handleSaveOutcome}
              onAddValidationFlag={handleAddValidationFlag}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
