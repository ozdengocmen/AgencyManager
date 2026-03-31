# Meeting Flow Implementation Plan (POC)

## 0) Implementation Status Snapshot (Updated: March 25, 2026)
- Completed:
  - Phase 1 foundation (data + contracts).
  - Phase 2 frontend state mutations + deterministic selectors.
  - Phase 3 backend meeting assistance stubs (orchestrators + routes + persistence updates).
- Implemented artifacts:
  - Frontend contracts and state:
    - `src/app/state/types.ts`
    - `src/app/state/mutations.ts`
    - `src/app/state/store.tsx` (new `meetingFlow` state slice + localStorage key `agencymanager.meeting-flow.v1`)
  - Frontend data and language:
    - `src/app/data/mockData.ts` (meeting/brief/recommendation/decision/report/outcome/validation records)
    - `src/app/i18n/copy.ts` (EN/TR labels for new statuses/panels/reasons)
  - Frontend selector layer:
    - `src/app/components/screens/meeting/types.ts`
    - `src/app/components/screens/meeting/meetingSelectors.ts`
  - Frontend Phase 4 UI integration:
    - `src/app/components/screens/meeting/PreMeetingBriefPanel.tsx`
    - `src/app/components/screens/meeting/PostMeetingReviewPanel.tsx`
    - `src/app/components/screens/meeting/OutcomeTrackingPanel.tsx`
    - `src/app/components/screens/meeting/RecommendationCard.tsx`
    - `src/app/components/screens/meeting/meetingUiUtils.ts`
    - `src/app/components/screens/MeetingPrep.tsx` (tabbed flow wiring + mutation actions)
  - Backend schema contracts:
    - `backend/app/schemas/meeting_flow.py`
    - `backend/app/schemas/__init__.py`
  - Backend meeting assistance stubs:
    - `backend/app/agents/post_meeting_orchestrator.py`
    - `backend/app/agents/post_meeting_fallback.py`
    - `backend/app/api/routes/agent.py` (`/api/agent/post-meeting-review`)
    - `backend/app/schemas/agent_outputs.py` (`MeetingNarrative.recommendations`, `PostMeetingAnalysis`)
    - `backend/app/services/workflow_store.py` (recommendation decision/report/outcome linkage persistence)
    - `backend/tests/test_phase13.py`
- Pending next:
  - Phase 5 scoring, ranking bias, and meeting-focused tests.
  - Recommendation ranking bias in pre-brief based on historical effectiveness.

### Immediate Next Session Goal (Phase 5)
1. Implement scoring logic in `meetingScoring.ts` (adoption, KPI delta, consistency, weighted total).
2. Bias pre-meeting recommendation ordering using historical effectiveness outputs.
3. Add manager validation UX refinements and deterministic rule tests.
4. Add focused meeting-flow test coverage for scoring and ranking behavior.

## 1) Scope and POC Guardrails
- Keep existing screens and generated UI structure; make focused flow additions only.
- Keep POC constraints: two users (`manager`, `salesperson`), mock/hardcoded auth.
- Use current agency table/data shape and row count as DB-like baseline.
- All new UI labels and recommendation metadata must support Turkish and English.

## 2) End-to-End Meeting Assistance Flow
1. Pre-meeting brief is generated and reviewed.
2. Meeting is executed and the salesperson logs what actually happened.
3. Post-meeting AI review compares brief vs report and suggests corrections.
4. Outcomes are tracked by linking recommendations to KPI movement over time.
5. Continuous learning prioritizes recommendation patterns that proved effective.

## 3) AI Assistance Definition by Stage

| Stage | AI Inputs | AI Outputs | Human Decision |
|---|---|---|---|
| Pre-meeting | Agency KPIs, prior meetings, similar agency outcomes | Priority talking points, ranked recommendations, rationale, expected KPI impact | Accept, modify, or reject each recommendation |
| Post-meeting | Pre-brief, meeting report, commitments | Match/mismatch analysis, missing actions, report quality notes | Confirm final report and recommendation adoption status |
| Continuous improvement | Historical recommendation outcomes | Ranked recommendation playbooks by agency profile | Manager feedback and validation overrides |

## 4) Pre-Meeting Requirements
- Generate a structured brief with:
  - key points to raise,
  - recommendations,
  - KPI-based rationale,
  - expected impact window.
- Add peer-enrichment:
  - leverage previous meeting records from other salespeople/agencies,
  - include outcome evidence and confidence level.
- Track recommendation decision status at creation:
  - `proposed`, `accepted`, `modified`, `rejected`.

## 5) Post-Meeting Requirements
- Add report sections aligned to pre-brief items.
- AI must provide:
  - recommendation consistency check,
  - quality critique of report and recommendation logic,
  - suggestions for missing or weak points.
- Link outcomes to recommendations:
  - store baseline KPI snapshot before meeting,
  - compare KPI changes at `T+7` and `T+30` days,
  - classify each recommendation as `effective`, `ineffective`, or `inconclusive`.

## 6) Continuous Improvement Requirements
- Build a recommendation effectiveness score using:
  - adoption score,
  - KPI delta score,
  - consistency score (plan vs report).
- Use score to bias future AI suggestions toward effective patterns.
- Add a manager validation loop for incorrect recommendations with reason tags:
  - `data_issue`,
  - `context_mismatch`,
  - `execution_failure`.

## 7) Additional Data to Store
- `meetings`: `date`, `agency_id`, `salesperson_id`, `objective`, `baseline_kpis`.
- `recommendations`: `text`, `source`, `rationale`, `expected_kpi`, `expected_window_days`, `confidence`.
- `recommendation_decisions`: decision state and reason.
- `post_meeting_reports`: discussion summary, commitments, deviations.
- `recommendation_outcomes`: observed KPI deltas, effectiveness label, assessment date.
- `validation_flags`: accuracy concerns, data quality issues, reviewer notes.

## 8) Validation and Accuracy Strategy
- Run offline replay tests on historical/mock meeting data.
- Track quality metrics:
  - accepted recommendations later marked effective,
  - manager rejection rate,
  - inconclusive rate due to insufficient evidence.
- Enforce recommendation guardrails:
  - each AI recommendation must include rationale and KPI linkage,
  - confidence must be reduced when evidence is weak.
- Keep human approval in the loop for final recommendation set.

## 9) Delivery Overview
1. Iteration 1: structured pre-meeting brief and decision capture. (Data/contracts + state/selectors complete; UI panel integration pending)
2. Iteration 2: post-meeting AI comparison, report quality checks, outcome linkage. (Data linkage contracts and selectors complete; backend stub endpoint + UI integration pending)
3. Iteration 3: effectiveness scoring, recommendation ranking, validation dashboard. (Pending)

## 10) Definition of Done
- Each meeting has linked pre-brief, report, recommendations, and outcomes.
- AI outputs are explainable via rationale + KPI intent.
- Effective recommendations are prioritized in later meeting briefs.
- Turkish/English support is complete for all new flow artifacts.
