"""Phase 6+7 agent routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.app.agents.daily_plan_orchestrator import DailyPlanOrchestrator
from backend.app.agents.meeting_prep_orchestrator import MeetingPrepOrchestrator
from backend.app.agents.post_meeting_orchestrator import PostMeetingOrchestrator
from backend.app.services.agent_trace import AgentPolicyError
from backend.app.repositories import get_repository_gateway
from backend.app.schemas.agent_api import (
    DailyPlanRequest,
    DailyPlanResponse,
    AgentRunTraceResponse,
    MeetingPrepRequest,
    MeetingPrepResponse,
    PostMeetingReviewRequest,
    PostMeetingReviewResponse,
)
from backend.app.schemas.persistence import (
    DailyPlanSaveRequest,
    MeetingPrepSaveRequest,
    PostMeetingReportSaveRequest,
    RecommendationDecisionSaveRequest,
    RecommendationOutcomeSaveRequest,
)
from backend.app.services.workflow_store import get_workflow_store

router = APIRouter()


@router.post("/meeting-prep", response_model=MeetingPrepResponse)
def meeting_prep(payload: MeetingPrepRequest) -> MeetingPrepResponse:
    orchestrator = MeetingPrepOrchestrator()
    try:
        result = orchestrator.generate(payload)
    except AgentPolicyError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": exc.code, "message": exc.message},
        ) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    saved_prep_id: str | None = None
    saved_recommendation_decision_ids: list[str] = []
    if payload.save_result:
        workflow_store = get_workflow_store()
        stored = workflow_store.save_meeting_prep(
            MeetingPrepSaveRequest(
                user_id=payload.user_id,
                agency_id=payload.agency_id,
                narrative_json=result.narrative.model_dump(mode="json"),
            )
        )
        saved_prep_id = stored.prep_id
        meeting_id = payload.meeting_id or f"MEET-{payload.agency_id}"
        decisions = workflow_store.save_recommendation_decisions(
            [
                RecommendationDecisionSaveRequest(
                    recommendation_id=recommendation.recommendation_id,
                    meeting_id=meeting_id,
                    agency_id=payload.agency_id,
                    decision="proposed",
                    reason="Initial AI proposal generated from pre-meeting brief.",
                    edited_text=None,
                    decided_by=payload.user_id,
                    decided_at=result.narrative.generated_at,
                )
                for recommendation in result.narrative.recommendations
            ]
        )
        saved_recommendation_decision_ids = [item.decision_id for item in decisions]

    return MeetingPrepResponse(
        narrative=result.narrative,
        provider=result.provider,
        model=result.model,
        tools_used=result.tools_used,
        run_id=result.run_id,
        trace_summary=result.trace_summary,
        evidence_map=result.evidence_map,
        saved_prep_id=saved_prep_id,
        saved_recommendation_decision_ids=saved_recommendation_decision_ids,
        warnings=result.warnings,
    )


@router.post("/post-meeting-review", response_model=PostMeetingReviewResponse)
def post_meeting_review(payload: PostMeetingReviewRequest) -> PostMeetingReviewResponse:
    orchestrator = PostMeetingOrchestrator()
    try:
        result = orchestrator.generate(payload)
    except AgentPolicyError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": exc.code, "message": exc.message},
        ) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    saved_report_id: str | None = None
    saved_outcome_ids: list[str] = []
    saved_recommendation_decision_ids: list[str] = []
    if payload.save_result:
        workflow_store = get_workflow_store()
        consistency_map = {
            item.recommendation_id: item.consistency
            for item in result.analysis.comparisons
        }
        saved_report = workflow_store.save_post_meeting_report(
            PostMeetingReportSaveRequest(
                report_id=result.analysis.report_id,
                meeting_id=result.analysis.meeting_id,
                agency_id=result.analysis.agency_id,
                discussion_summary=result.analysis.report_summary,
                commitments=result.analysis.commitments,
                deviations=result.analysis.deviations,
                recommendation_consistency=consistency_map,
                ai_critique=result.analysis.consistency_summary,
                created_by=payload.user_id,
                created_at=result.analysis.generated_at,
            )
        )
        saved_report_id = saved_report.report_id

        decision_timestamp = result.analysis.generated_at
        decisions = workflow_store.save_recommendation_decisions(
            [
                RecommendationDecisionSaveRequest(
                    recommendation_id=item.recommendation_id,
                    meeting_id=result.analysis.meeting_id,
                    agency_id=result.analysis.agency_id,
                    decision=item.decision,
                    reason=item.consistency_note,
                    edited_text=None,
                    decided_by=payload.user_id,
                    decided_at=decision_timestamp,
                )
                for item in result.analysis.comparisons
            ]
        )
        saved_recommendation_decision_ids = [item.decision_id for item in decisions]

        outcomes = workflow_store.save_recommendation_outcomes(
            [
                RecommendationOutcomeSaveRequest(
                    outcome_id=item.outcome_id,
                    recommendation_id=item.recommendation_id,
                    meeting_id=result.analysis.meeting_id,
                    agency_id=result.analysis.agency_id,
                    baseline_value=item.baseline_value,
                    t_plus_7_delta=item.t_plus_7_delta,
                    t_plus_30_delta=item.t_plus_30_delta,
                    effectiveness=item.effectiveness,
                    assessed_at=decision_timestamp.date(),
                    linked_report_id=saved_report.report_id,
                )
                for item in result.analysis.outcomes
            ]
        )
        saved_outcome_ids = [item.outcome_id for item in outcomes]

    return PostMeetingReviewResponse(
        analysis=result.analysis,
        provider=result.provider,
        model=result.model,
        tools_used=result.tools_used,
        run_id=result.run_id,
        trace_summary=result.trace_summary,
        evidence_map=result.evidence_map,
        saved_report_id=saved_report_id,
        saved_outcome_ids=saved_outcome_ids,
        saved_recommendation_decision_ids=saved_recommendation_decision_ids,
        warnings=result.warnings,
    )


@router.post("/daily-plan", response_model=DailyPlanResponse)
def daily_plan(payload: DailyPlanRequest) -> DailyPlanResponse:
    orchestrator = DailyPlanOrchestrator()
    try:
        result = orchestrator.generate(payload)
    except AgentPolicyError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": exc.code, "message": exc.message},
        ) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    saved_plan_id: str | None = None
    if payload.save_result:
        stored = get_workflow_store().save_daily_plan(
            DailyPlanSaveRequest(
                user_id=payload.user_id,
                date=payload.plan_date,
                plan_json=result.plan.model_dump(mode="json"),
            )
        )
        saved_plan_id = stored.plan_id

    return DailyPlanResponse(
        plan=result.plan,
        provider=result.provider,
        model=result.model,
        tools_used=result.tools_used,
        run_id=result.run_id,
        trace_summary=result.trace_summary,
        evidence_map=result.evidence_map,
        saved_plan_id=saved_plan_id,
        warnings=result.warnings,
    )


@router.get("/runs/{run_id}", response_model=AgentRunTraceResponse)
def get_agent_run(run_id: str) -> AgentRunTraceResponse:
    repository = get_repository_gateway()
    run = repository.get_agent_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Agent run '{run_id}' not found")
    tool_calls = repository.list_agent_tool_calls(run_id)
    return AgentRunTraceResponse(run=run, tool_calls=tool_calls)
