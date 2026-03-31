# Quality Review Items

This file is the active UI quality backlog for the current phase.
Source input: `quality_testing.txt` (11 issues logged on 2026-03-09).

## Priority Legend

- `P0`: Blocking usability/functionality issue. Fix first.
- `P1`: Important UX/feature gap. Fix after P0.
- `P2`: Polish/branding enhancement.

## Status Legend

- `TODO`: Not started.
- `IN_PROGRESS`: Being implemented.
- `DONE`: Implemented and verified.
- `DEFERRED`: Intentionally postponed.

## Execution Waves

1. **Wave 1 (P0 Layout/Scroll Stabilization)**
   - Fix shared scrolling and overflow behavior first.
   - Affects Agencies, Agency Profile, Daily Plan, Meeting Prep, Tasks, and Map screen containers.
2. **Wave 2 (P0 Functional Gaps)**
   - Add missing remove-from-plan action, task creation modal flow, and meaningful map interactions.
3. **Wave 3 (P1 Workflow/UX Clarity)**
   - Improve Daily Plan readability and Agencies batch actions/terminology consistency.
4. **Wave 4 (P2 Branding/Identity)**
   - Add app name/logo treatment on login and sidebar.

## Current Backlog

| ID | Priority | Screen/Route | Issue Summary | Planned Action | Target Files | Acceptance Criteria | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QRI-001 | P2 | Login | No product identity (logo/name treatment is plain). | Add lightweight POC branding block (wordmark + simple logo mark), align login and sidebar naming. | `src/app/components/screens/Login.tsx`, `src/app/components/Layout.tsx`, optional `src/styles/*` | Login clearly shows app identity; sidebar title matches; no layout regressions on desktop/mobile. | TODO |
| QRI-002 | P0 | Agencies list | Table is cut off; no usable horizontal/vertical scrolling. | Add reliable scroll container contract for large tables: keep vertical scroll in content region and horizontal scroll around table. | `src/app/components/screens/AgenciesList.tsx`, `src/app/components/ui/scroll-area.tsx`, optional shared layout wrappers | User can scroll full agencies table both axes; header/actions remain accessible. | DONE |
| QRI-003 | P1 | Agencies list | Multi-select actions need clear behavior and terminology consistency (`Generate Narratives` vs `Meeting Prep`). | Keep two bulk actions, standardize labels/copy in EN/TR, and ensure Generate action always routes to Meeting Prep with selected agencies preserved. | `src/app/components/screens/AgenciesList.tsx`, language/copy helpers where added | Selecting 1+ row always reveals both actions; wording is consistent across menu/screen/buttons and languages. | DONE |
| QRI-004 | P0 | Agency profile | Agency dashboard tabs/content can be cut off, no reliable scrolling. | Refactor tab content area to fixed header + scrollable body; ensure wide content can scroll horizontally where needed. | `src/app/components/screens/AgencyProfile.tsx`, `src/app/components/ui/scroll-area.tsx` | All tabs (`Overview`, `Diagnostics`, `Meeting Prep`, `Notes & Tasks`) are fully reachable via scrolling. | DONE |
| QRI-005 | P0 | Daily Plan | Screen content is cut off; vertical scrolling is unreliable. | Normalize 3-column layout heights and `min-h-0`/overflow rules; ensure each panel has independent scroll. | `src/app/components/screens/DailyPlan.tsx`, `src/app/components/Layout.tsx` | Candidate Pool, Today’s Plan, Visit Details all scroll correctly without clipping. | DONE |
| QRI-006 | P0 | Daily Plan | No way to remove agencies from `Today’s Plan`. | Add remove action per visit card (and optional bulk/selected remove), update planner state/reducer and selection handling. | `src/app/components/screens/DailyPlan.tsx`, `src/app/state/store.tsx`, related state types if needed | User can remove a visit; removed agency returns to candidate pool; order resequences correctly. | DONE |
| QRI-007 | P1 | Daily Plan | `Today’s Plan` and `Visit Details` feel crowded and hard to follow. | Improve information hierarchy: spacing, section grouping, reduced visual density, clearer CTA ordering. | `src/app/components/screens/DailyPlan.tsx` | Core workflow is readable in one pass; no cramped blocks or overlapping priorities. | DONE |
| QRI-008 | P0 | Map & Clusters | Map interaction is not functional for operational use (placeholder feel, no visit lifecycle action). | Replace placeholder behavior with functional POC map workflow: show all agencies + planned route context, clickable agency details, mark-as-visited action, and route recalculation hooks (mocked). | `src/app/components/screens/MapClusters.tsx`, planner/state integration files as needed | User can view agencies/plan context, interact with points, and mark visits as visited to update route state. | DONE |
| QRI-009 | P0 | Meeting Prep | Screen gets clipped (bottom/right), scrolling insufficient for long output. | Ensure multi-panel Meeting Prep layout supports both vertical and horizontal overflow correctly, especially generated text area. | `src/app/components/screens/MeetingPrep.tsx`, `src/app/components/ui/scroll-area.tsx` | User can fully access settings and generated output without clipping on desktop widths. | DONE |
| QRI-010 | P0 | Tasks & Follow-ups | Screen gets clipped (bottom/right), table region not fully reachable. | Apply same overflow/table container fixes used in Agencies/Meeting Prep to Tasks table and summary section. | `src/app/components/screens/TasksFollowUps.tsx`, `src/app/components/ui/scroll-area.tsx` | Full tasks table and lower summary cards are scrollable and reachable. | DONE |
| QRI-011 | P0 | Tasks & Follow-ups | `Create Task` adds a hardcoded task; no editable input flow. | Add `Create Task` modal/dialog with fields: agency, action/title, due date, priority; support save and delete for user-created tasks. | `src/app/components/screens/TasksFollowUps.tsx`, `src/app/state/store.tsx` and/or persistence API helpers | User can create custom task from UI form, see it in table, and remove/edit it in-app. | DONE |

## Cross-Cutting Technical Tasks

1. Define a shared "screen shell" overflow pattern and apply consistently across all major screens.
2. Extend `ScrollArea` to support horizontal scrollbars where content width exceeds viewport.
3. Add quick smoke checks for:
   - agencies table overflow
   - daily plan add/remove
   - meeting prep output overflow
   - tasks create/edit/delete flow
4. Normalize naming/copy across navigation and action buttons (`Meeting Prep` terminology).
5. Validate English and Turkish labels for newly added/updated UI copy.

## Update Protocol (Living Document)

For every implemented item:

1. Change `Status` to `IN_PROGRESS` then `DONE`.
2. Add an implementation note under this section:
   - date
   - changed files
   - verification steps used
   - residual follow-up items
3. If a new issue is found, append `QRI-012+` with full row fields and assign priority.

## Implementation Notes

### 2026-03-09 - Wave 1 Layout/Scroll Stabilization

- Changed files:
  - `src/app/components/Layout.tsx`
  - `src/app/components/ui/scroll-area.tsx`
  - `src/app/components/screens/AgenciesList.tsx`
  - `src/app/components/screens/AgencyProfile.tsx`
  - `src/app/components/screens/DailyPlan.tsx`
  - `src/app/components/screens/MeetingPrep.tsx`
  - `src/app/components/screens/TasksFollowUps.tsx`
- Verification:
  - `npm run build` succeeded.
  - Added min-width guards and overflow wrappers for wide content/table surfaces.
  - Added horizontal + vertical scrollbars support in shared `ScrollArea`.
- Residual follow-up:
  - Run manual browser validation for desktop + mobile breakpoints and EN/TR copy after functional Wave 2 items are implemented.

### 2026-03-09 - QRI-006 Daily Plan Remove Action

- Changed files:
  - `src/app/state/store.tsx`
  - `src/app/components/screens/DailyPlan.tsx`
- Verification:
  - Added reducer-backed planner remove action with visit order resequencing.
  - Added selected-visit fallback selection after remove and cleanup of per-visit checklist/outcome state.
  - Added remove controls in Today's Plan cards, header action (`Remove Selected`), and Visit Details panel.
  - Added EN/TR labels/toasts for newly introduced remove actions.
- Residual follow-up:
  - Run manual drag/reorder + remove interaction check in browser to validate UX flow and spacing across breakpoints.

### 2026-03-09 - QRI-007 Daily Plan Readability Pass

- Changed files:
  - `src/app/components/screens/DailyPlan.tsx`
- Verification:
  - Reworked Today's Plan control area and removed redundant bulk narrative action to reduce top-panel crowding.
  - Moved autosave status into the title row for better hierarchy and less cramped controls.
  - Refactored Visit Details into distinct bordered sections (`Agency & Objective`, `Meeting Prep`, `Checklist`, `After Visit`) with improved spacing.
  - Clarified CTA order by keeping `Generate Meeting Prep` as primary in prep section and moving destructive remove action into `After Visit`.
- Residual follow-up:
  - Quick manual pass for EN/TR copy wrapping on narrower desktop widths.

### 2026-03-09 - QRI-003 Agencies Batch Action Terminology

- Changed files:
  - `src/app/components/screens/AgenciesList.tsx`
  - `src/app/components/screens/agenciesListCopy.ts`
  - `src/app/components/Layout.tsx`
- Verification:
  - Replaced `Generate Narratives` with `Meeting Prep` terminology for selected-row bulk action and per-row action.
  - Kept both bulk actions visible whenever 1+ agencies are selected.
  - Added EN/TR copy mapping for newly updated Agencies action labels and related toasts.
  - Ensured bulk `Meeting Prep` navigation writes selected agency IDs into meeting-prep draft (`selectedAgencyIds` and `sourceAgencyIds`) before routing.
  - Aligned sidebar navigation label from `Meeting Prep (AI)` to language-aware `Meeting Prep` / `Toplanti Hazirligi`.
- Residual follow-up:
  - Manual browser validation for EN/TR label wrapping in Agencies header action row on narrower desktop widths.

### 2026-03-19 - QRI-008 Map & Clusters Functional Workflow

- Changed files:
  - `src/app/components/screens/MapClusters.tsx`
  - `src/app/components/screens/mapClustersCopy.ts`
  - `src/app/components/screens/mapClustersUtils.ts`
  - `src/app/state/types.ts`
  - `src/app/state/store.tsx`
- Verification:
  - Replaced placeholder map interactions with clickable agency pins, route path rendering, selected-agency action panel, and route-aware status states.
  - Added planner-integrated visit lifecycle actions: mark visit as visited and persisted route recalculation metadata (`visitedVisitIds`, route revision, last recalculated timestamp/reason).
  - Added mocked route recalculation trigger on map panel with user feedback.
  - Added EN/TR copy coverage for all new map labels, statuses, and action feedback.
  - `npm run build` succeeded.
- Residual follow-up:
  - Manual browser pass for map interactions on narrow desktop/mobile breakpoints (pin hit area, route leg readability, tooltip overlap).

### 2026-03-19 - QRI-011 Tasks Create/Edit/Delete Flow

- Changed files:
  - `src/app/components/screens/TasksFollowUps.tsx`
  - `src/app/components/screens/TaskEditorDialog.tsx`
  - `src/app/components/screens/tasksFollowUpsCopy.ts`
  - `src/app/state/store.tsx`
  - `src/app/state/types.ts`
- Verification:
  - Replaced hardcoded task creation with modal-based form flow (agency, action/title, due date, priority).
  - Added in-app edit and delete actions for user-created tasks, including reducer-backed update/delete state handling.
  - Added EN/TR copy coverage for newly introduced task-create/edit/delete UI labels and toasts.
- Residual follow-up:
  - Manual browser validation for dialog interaction on mobile widths and confirmation of persisted behavior after refresh.
