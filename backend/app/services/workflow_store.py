"""Repository-backed persistence adapter used by existing Phase 4 routes."""

from __future__ import annotations

from collections import defaultdict
from functools import lru_cache

from backend.app.repositories import RepositoryGateway, get_repository_gateway
from backend.app.schemas.persistence import (
    DailyPlanRecord,
    DailyPlanSaveRequest,
    MeetingOutcomeLogRequest,
    MeetingOutcomeRecord,
    MeetingPrepRecord,
    MeetingPrepSaveRequest,
    PostMeetingReportRecord,
    PostMeetingReportSaveRequest,
    RecommendationDecisionRecord,
    RecommendationDecisionSaveRequest,
    RecommendationOutcomeRecord,
    RecommendationOutcomeSaveRequest,
    TaskCreateInput,
    TaskRecord,
)


class WorkflowStore:
    def __init__(self, repository: RepositoryGateway | None = None) -> None:
        self._repository = repository or get_repository_gateway()
        self._recommendation_decisions: list[RecommendationDecisionRecord] = []
        self._post_meeting_reports: list[PostMeetingReportRecord] = []
        self._recommendation_outcomes: list[RecommendationOutcomeRecord] = []
        self._id_counters: dict[str, int] = defaultdict(int)

    def save_daily_plan(self, payload: DailyPlanSaveRequest) -> DailyPlanRecord:
        detail = self._repository.create_daily_plan(
            user_id=payload.user_id,
            plan_date=payload.date,
            plan_json=payload.plan_json,
            status="draft",
        )
        return DailyPlanRecord(
            plan_id=detail.plan_id,
            user_id=detail.user_id,
            date=detail.plan_date,
            plan_json=detail.plan_json,
            created_at=detail.created_at,
        )

    def save_meeting_prep(self, payload: MeetingPrepSaveRequest) -> MeetingPrepRecord:
        return self._repository.create_meeting_prep(payload)

    def log_meeting_outcome(self, payload: MeetingOutcomeLogRequest) -> MeetingOutcomeRecord:
        return self._repository.log_meeting_outcome(payload)

    def save_recommendation_decisions(
        self,
        payloads: list[RecommendationDecisionSaveRequest],
    ) -> list[RecommendationDecisionRecord]:
        if not payloads:
            return []

        saved: list[RecommendationDecisionRecord] = []
        for payload in payloads:
            decision_id = self._next_id("DEC")
            record = RecommendationDecisionRecord(
                decision_id=decision_id,
                recommendation_id=payload.recommendation_id,
                meeting_id=payload.meeting_id,
                agency_id=payload.agency_id,
                decision=payload.decision,
                reason=payload.reason,
                edited_text=payload.edited_text,
                decided_by=payload.decided_by,
                decided_at=payload.decided_at,
            )
            self._recommendation_decisions.append(record)
            saved.append(record)
        return saved

    def save_post_meeting_report(self, payload: PostMeetingReportSaveRequest) -> PostMeetingReportRecord:
        report_id = payload.report_id or self._next_id("RPT")
        record = PostMeetingReportRecord(
            report_id=report_id,
            meeting_id=payload.meeting_id,
            agency_id=payload.agency_id,
            discussion_summary=payload.discussion_summary,
            commitments=list(payload.commitments),
            deviations=list(payload.deviations),
            recommendation_consistency=dict(payload.recommendation_consistency),
            ai_critique=payload.ai_critique,
            created_by=payload.created_by,
            created_at=payload.created_at,
            linked_outcome_ids=[],
        )
        self._post_meeting_reports.append(record)
        return record

    def save_recommendation_outcomes(
        self,
        payloads: list[RecommendationOutcomeSaveRequest],
    ) -> list[RecommendationOutcomeRecord]:
        if not payloads:
            return []

        saved: list[RecommendationOutcomeRecord] = []
        for payload in payloads:
            outcome_id = payload.outcome_id or self._next_id("ROUT")
            record = RecommendationOutcomeRecord(
                outcome_id=outcome_id,
                recommendation_id=payload.recommendation_id,
                meeting_id=payload.meeting_id,
                agency_id=payload.agency_id,
                baseline_value=payload.baseline_value,
                t_plus_7_delta=payload.t_plus_7_delta,
                t_plus_30_delta=payload.t_plus_30_delta,
                effectiveness=payload.effectiveness,
                assessed_at=payload.assessed_at,
                linked_report_id=payload.linked_report_id,
            )
            self._recommendation_outcomes.append(record)
            saved.append(record)

        self._link_outcomes_to_report(saved)
        return saved

    def create_tasks(self, tasks: list[TaskCreateInput]) -> list[TaskRecord]:
        if not tasks:
            return []

        created: list[TaskRecord] = []
        by_assignee: dict[str, list[TaskCreateInput]] = {}
        for item in tasks:
            by_assignee.setdefault(item.assignee, []).append(item)

        for assignee, grouped in by_assignee.items():
            created.extend(self._repository.create_tasks(user_id=assignee, tasks=grouped))
        return created

    def list_tasks(
        self,
        *,
        assignee: str | None = None,
        status: str | None = None,
        agency_id: str | None = None,
    ) -> list[TaskRecord]:
        # Manager scope when assignee is omitted keeps backward-compatible behavior.
        scoped_user = assignee or "manager"
        return self._repository.list_tasks(
            user_id=scoped_user,
            assignee=assignee,
            status=status,
            agency_id=agency_id,
        )

    def list_recommendation_decisions(
        self,
        *,
        meeting_id: str | None = None,
        agency_id: str | None = None,
    ) -> list[RecommendationDecisionRecord]:
        return [
            item
            for item in self._recommendation_decisions
            if (meeting_id is None or item.meeting_id == meeting_id)
            and (agency_id is None or item.agency_id == agency_id)
        ]

    def list_post_meeting_reports(
        self,
        *,
        meeting_id: str | None = None,
        agency_id: str | None = None,
    ) -> list[PostMeetingReportRecord]:
        return [
            item
            for item in self._post_meeting_reports
            if (meeting_id is None or item.meeting_id == meeting_id)
            and (agency_id is None or item.agency_id == agency_id)
        ]

    def list_recommendation_outcomes(
        self,
        *,
        meeting_id: str | None = None,
        agency_id: str | None = None,
    ) -> list[RecommendationOutcomeRecord]:
        return [
            item
            for item in self._recommendation_outcomes
            if (meeting_id is None or item.meeting_id == meeting_id)
            and (agency_id is None or item.agency_id == agency_id)
        ]

    def _next_id(self, prefix: str) -> str:
        self._id_counters[prefix] += 1
        return f"{prefix}-{self._id_counters[prefix]:04d}"

    def _link_outcomes_to_report(self, outcomes: list[RecommendationOutcomeRecord]) -> None:
        report_by_id = {report.report_id: report for report in self._post_meeting_reports}
        for outcome in outcomes:
            if not outcome.linked_report_id:
                continue
            report = report_by_id.get(outcome.linked_report_id)
            if not report:
                continue
            if outcome.outcome_id in report.linked_outcome_ids:
                continue
            report.linked_outcome_ids.append(outcome.outcome_id)


@lru_cache
def get_workflow_store() -> WorkflowStore:
    return WorkflowStore()
