# Delivery Plan (Code Development)

This file is an execution runbook for AI coding agents. It translates the product plan into concrete coding tasks, ownership boundaries, and acceptance checks.

## Status Snapshot (Updated: March 25, 2026)
- Current phase state:
  - Phase 1: Completed
  - Phase 2: Completed
  - Phase 3: Completed
  - Phase 4: Completed
  - Phase 5: Next
- Implemented so far:
  - Frontend meeting-flow contracts added in `src/app/state/types.ts`.
  - Meeting-flow mock dataset added in `src/app/data/mockData.ts` (meetings, briefs, recommendations, decisions, reports, outcomes, validation flags; agency baseline row count unchanged).
  - TR/EN meeting-flow copy keys added in `src/app/i18n/copy.ts`.
  - Backend meeting-flow schema module added in `backend/app/schemas/meeting_flow.py` and exported from `backend/app/schemas/__init__.py`.
  - Deterministic meeting-flow mutation helpers added in `src/app/state/mutations.ts`.
  - Deterministic selectors and view models added in:
    - `src/app/components/screens/meeting/meetingSelectors.ts`
    - `src/app/components/screens/meeting/types.ts`
  - Meeting-flow app-state slice + localStorage persistence wired in `src/app/state/store.tsx` (`agencymanager.meeting-flow.v1`).
  - Backend meeting assistance stubs added:
    - `backend/app/agents/post_meeting_orchestrator.py`
    - `backend/app/agents/post_meeting_fallback.py`
    - `backend/app/api/routes/agent.py` (`/api/agent/post-meeting-review`)
    - `backend/app/services/workflow_store.py` (recommendation decisions, post-meeting reports, linked outcomes)
    - `backend/app/schemas/agent_outputs.py` (`MeetingNarrative.recommendations`, `PostMeetingAnalysis`)
    - `backend/tests/test_phase13.py` (contract + linkage + deterministic fallback coverage)
  - Phase 4 UI integration completed:
    - `src/app/components/screens/meeting/PreMeetingBriefPanel.tsx`
    - `src/app/components/screens/meeting/PostMeetingReviewPanel.tsx`
    - `src/app/components/screens/meeting/OutcomeTrackingPanel.tsx`
    - `src/app/components/screens/meeting/RecommendationCard.tsx`
    - `src/app/components/screens/MeetingPrep.tsx` (full flow journey wiring)
    - `src/app/components/screens/meeting/meetingUiUtils.ts` (shared labels/format helpers)
- Validation completed:
  - `npm run build` passed.
  - `uv run python -m compileall backend/app` passed.
  - `uv run python -m unittest discover -s backend/tests -p 'test_*.py'` passed.

## 1) Objectives
- Implement a tight end-to-end meeting flow: pre-meeting brief, post-meeting review, and continuous recommendation learning.
- Keep current screens and generated structure; apply focused changes only.
- Preserve POC constraints: mock data, two users, no real external integrations.

## 2) Implementation Principles
- Keep files small and split helpers/components into dedicated files.
- Reuse existing architecture in `src/app/*` and `backend/app/*`; avoid sweeping refactors.
- Keep all new user-facing labels bilingual (Turkish/English) via `src/app/i18n/copy.ts`.
- Prefer deterministic, testable helper functions for scoring and validation logic.

## 3) Suggested File-Level Architecture Changes

### Frontend
- `src/app/data/mockData.ts`
  - Extend mock dataset with meeting records, recommendation records, decisions, outcomes, and validation flags.
- `src/app/state/types.ts`
  - Add TypeScript interfaces for new entities:
  - `MeetingRecord`, `Recommendation`, `RecommendationDecision`, `PostMeetingReport`, `RecommendationOutcome`, `ValidationFlag`.
- `src/app/state/mutations.ts`
  - Add create/update functions for pre-meeting brief, report, recommendation decisions, and outcome assessments.
- `src/app/components/screens/MeetingPrep.tsx`
  - Keep screen shell; split new logic into subcomponents/services.
- New files to add:
  - `src/app/components/screens/meeting/PreMeetingBriefPanel.tsx`
  - `src/app/components/screens/meeting/PostMeetingReviewPanel.tsx`
  - `src/app/components/screens/meeting/OutcomeTrackingPanel.tsx`
  - `src/app/components/screens/meeting/RecommendationCard.tsx`
  - `src/app/components/screens/meeting/meetingScoring.ts`
  - `src/app/components/screens/meeting/meetingSelectors.ts`
  - `src/app/components/screens/meeting/types.ts`
- `src/app/i18n/copy.ts`
  - Add TR/EN keys for all new sections, statuses, score labels, and validation reasons.

### Backend (stubbed/mocked)
- `backend/app/schemas/`:
  - Add or extend schemas for pre-brief, report comparison, recommendation outcome, validation tagging.
- `backend/app/agents/meeting_prep_orchestrator.py`
  - Add explicit structured output for recommendations with rationale, expected KPI, confidence.
- New file to add:
  - `backend/app/agents/post_meeting_orchestrator.py`
- `backend/app/api/routes/agent.py` and/or `backend/app/api/routes/workflows.py`
  - Expose stub endpoints for pre-meeting generation and post-meeting analysis.
- `backend/app/services/workflow_store.py`
  - Persist mock workflow artifacts and outcome links in runtime store.
- `backend/tests/`
  - Add unit tests for scoring, mapping, and structured output schema validation.

## 4) Delivery Iterations (Development-Focused)

## Iteration 1: Pre-Meeting Structured Brief

### Goal
Generate and capture clear pre-meeting recommendations with explicit salesperson decisions.

### Tasks
1. Add shared entity types in frontend state and backend schemas.
2. Extend mock data with historical meeting/recommendation examples (same agency row count unchanged).
3. Implement `PreMeetingBriefPanel` with sections:
   - key points,
   - recommendation list,
   - rationale/KPI link,
   - expected impact window,
   - decision controls (`accepted`, `modified`, `rejected`).
4. Wire state mutations to save decisions and edited recommendation text.
5. Add i18n keys and status badges.

### Acceptance
- Pre-meeting brief renders from mock data.
- User can accept/modify/reject each recommendation and save.
- All labels are available in both Turkish and English.

## Iteration 2: Post-Meeting Comparison and Linkage

### Goal
Compare what was planned vs what happened and produce structured AI follow-up suggestions.

### Tasks
1. Implement `PostMeetingReviewPanel` with aligned sections:
   - planned recommendation,
   - meeting report evidence,
   - consistency flag,
   - AI critique/suggestion.
2. Add backend stub endpoint for post-meeting analysis response.
3. Store pre-meeting KPI baseline and post-meeting KPI snapshots (`T+7`, `T+30`).
4. Implement linkage logic from recommendation to outcome record.
5. Add tests for mapping logic and status transitions to `effective`, `ineffective`, `inconclusive`.

### Acceptance
- Post-meeting report can be entered and compared to pre-meeting recommendations.
- System stores linkage between each recommendation and KPI movement windows.
- Effectiveness label assignment works with deterministic rules.

## Iteration 3: Continuous Improvement and Validation

### Goal
Use outcomes to bias recommendation quality and expose validation controls.

### Tasks
1. Implement `meetingScoring.ts`:
   - adoption score,
   - KPI delta score,
   - consistency score,
   - weighted total score.
2. Implement `OutcomeTrackingPanel`:
   - per-recommendation score,
   - effective/ineffective trend,
   - top reusable recommendation patterns.
3. Add manager validation controls and reason tagging (`data_issue`, `context_mismatch`, `execution_failure`).
4. Bias recommendation ranking in pre-meeting view using historical effectiveness score.
5. Add tests for scoring function and ranking behavior.

### Acceptance
- Recommendation ranking reflects historical effectiveness.
- Validation tags are captured and persisted.
- Score calculations are covered by unit tests.

## 5) Sequential Single-Agent Phase Flow

Use one implementation agent only. Complete phases in order; do not start the next phase until the current phase exit criteria pass.

1. Phase 1: Data and Contracts Foundation (Completed on March 25, 2026)
- Files:
  - `src/app/state/types.ts`
  - `src/app/data/mockData.ts`
  - `src/app/i18n/copy.ts`
  - `backend/app/schemas/meeting_flow.py`
  - `backend/app/schemas/__init__.py`
- Exit criteria:
  - New meeting/recommendation entities compile in frontend and backend schemas.
  - Mock records include pre-brief, decisions, report, outcomes, and validation flags.
  - TR/EN keys exist for all new statuses and panels.

2. Phase 2: Frontend State Mutations and Selectors (Completed on March 25, 2026)
- Files:
  - `src/app/state/mutations.ts`
  - `src/app/state/store.tsx`
  - `src/app/components/screens/meeting/meetingSelectors.ts`
  - `src/app/components/screens/meeting/types.ts`
- Exit criteria:
  - Recommendation decision updates and report/outcome linkage persist in app state.
  - Selectors return deterministic data for pre-meeting, post-meeting, and tracking views.

3. Phase 3: Backend Meeting Assistance Stubs (Completed on March 25, 2026)
- Files:
  - `backend/app/agents/meeting_prep_orchestrator.py`
  - `backend/app/agents/post_meeting_orchestrator.py`
  - `backend/app/api/routes/agent.py`
  - `backend/app/api/routes/workflows.py`
  - `backend/app/services/workflow_store.py`
- Exit criteria:
  - Pre-meeting and post-meeting endpoints return structured mock outputs.
  - Outputs include rationale, KPI intent, confidence, and consistency notes.

### Phase 3 Kickoff Checklist (For New Session)
1. Add `backend/app/agents/post_meeting_orchestrator.py` with deterministic mock output path first, then optional OpenAI path parity.
2. Extend `backend/app/agents/meeting_prep_orchestrator.py` output to include recommendation-level:
   - `rationale`
   - `expected_kpi`
   - `expected_window_days`
   - `confidence`
3. Add/extend request-response schemas in `backend/app/schemas/agent_api.py` as needed for post-meeting analysis contracts.
4. Expose endpoints in `backend/app/api/routes/agent.py` (and/or `workflows.py`) for:
   - pre-meeting structured recommendation output
   - post-meeting comparison output
5. Extend `backend/app/services/workflow_store.py` persistence for:
   - recommendation decisions
   - post-meeting reports
   - recommendation outcomes and report linkage
6. Add backend tests under `backend/tests/` for:
   - structured response contract validity
   - linkage fields (`linked_report_id`, outcome/report consistency)
   - deterministic fallback behavior.

4. Phase 4: Meeting UI Integration
- Files:
  - `src/app/components/screens/meeting/PreMeetingBriefPanel.tsx`
  - `src/app/components/screens/meeting/PostMeetingReviewPanel.tsx`
  - `src/app/components/screens/meeting/OutcomeTrackingPanel.tsx`
  - `src/app/components/screens/meeting/RecommendationCard.tsx`
  - `src/app/components/screens/MeetingPrep.tsx`
- Exit criteria:
  - Users can complete full flow: pre-brief -> report -> outcome tracking in one screen journey.
  - Decision statuses and recommendation rationale are visible and editable where required.

5. Phase 5: Scoring, Validation, and Tests
- Files:
  - `src/app/components/screens/meeting/meetingScoring.ts`
  - `backend/tests/*meeting*`
  - frontend tests for meeting flow modules (if present in project)
- Exit criteria:
  - Scoring reflects adoption, KPI delta, and consistency.
  - Validation tagging (`data_issue`, `context_mismatch`, `execution_failure`) is saved and displayed.
  - Required test suite passes.

## 6) Quality Gates Per PR
1. Type check passes (`npm run build` or project type-check command).
2. Frontend lint/tests pass (if configured).
3. Backend tests pass (`pytest backend/tests`).
4. No existing screen regressions in `AgenciesList`, `AgencyProfile`, `MeetingPrep`, `TasksFollowUps`.
5. New logic has tests for:
   - recommendation decision transitions,
   - effectiveness classification,
   - scoring and ranking.

## 7) Data and Validation Checklist
- Every recommendation includes rationale and KPI target.
- Confidence is reduced when evidence is weak/incomplete.
- Recommendations can be traced from proposal -> decision -> outcome -> validation flag.
- Each effectiveness label is explainable by stored evidence and rule output.

## 8) Final Definition of Done
- Pre-meeting, post-meeting, and continuous-improvement flow is complete in UI and stub backend.
- Records are fully linked across all stages.
- Effective recommendations are reused preferentially in future briefs.
- TR/EN support is complete for all newly introduced strings.
