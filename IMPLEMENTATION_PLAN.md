# AgencyManager Implementation Plan

Last updated: March 23, 2026

## Project Intent
- Build an Insurance Agency Management PoC with generated React UI + mock data.
- Add an agentic backend using Python, FastAPI, `pydantic-ai`, and OpenAI Responses API.
- Keep architecture simple, modular, and demo-safe (no real DB/external data source).

## Guardrails (from AGENTS.md)
- Keep PoC complexity (2 users: manager + salesperson).
- Agency table stays base case (8 rows) and treated as DB-backed mock.
- Prefer targeted UI edits; avoid large generated-UI rewrites.
- Tailwind pipeline must be healthy before UI changes.
- Keep files small; split helpers/components.

## Progress Snapshot
- Phase 1: Completed
- Phase 2: Completed
- Phase 3: Completed
- Phase 4: Completed
- Phase 5: Completed
- Phase 6: Completed
- Phase 7: Completed
- Phase 8: Completed
- Phase 9: Completed
- Phase 10: Completed
- Phase 11: Completed
- Phase 12: In Progress (split into 12A + 12B)
- Phase 13: In Progress
- Phase 14: Pending
- Phase 15: Pending

## Phase Plan and Status

### Phase 1: Baseline and Environment Stabilization (Completed)
Status: Completed on March 7, 2026

What was done:
- Aligned Python version to installed runtime:
  - `.python-version` -> `3.11.7`
  - `pyproject.toml` -> `requires-python = ">=3.11,<3.13"`
- Hardened `.gitignore` for Python/Node/env/editor artifacts.
- Installed frontend dependencies and generated lockfile.
- Verified baseline:
  - `npm install` success
  - `npm run build` success
  - `npm run dev` start success

Key files touched:
- `.python-version`
- `pyproject.toml`
- `.gitignore`
- `package-lock.json`

### Phase 2: Frontend Dependency + Tailwind/Vite Hardening (Completed)
Status: Completed on March 7, 2026

What was done:
- Upgraded React to latest stable:
  - `react` -> `19.2.4`
  - `react-dom` -> `19.2.4`
- Upgraded Tailwind tooling:
  - `tailwindcss` -> `4.2.1`
  - `@tailwindcss/vite` -> `4.2.1`
- Upgraded Vite to patched secure version:
  - `vite` -> `6.4.1`
- Updated compatibility package:
  - `react-day-picker` -> `9.14.0`
- Removed unused/incompatible dependency:
  - removed `react-popper`
  - removed direct `@popperjs/core`
- Revalidated:
  - `npm run build` success
  - `npm run dev` success
  - `npm audit` -> `0 vulnerabilities`

Key files touched:
- `package.json`
- `package-lock.json`

### Phase 3: Backend Scaffold (Completed)
Status: Completed on March 7, 2026

What was done:
- Added backend structure:
  - `backend/app/api`
  - `backend/app/agents`
  - `backend/app/tools`
  - `backend/app/schemas`
  - `backend/app/services`
  - `backend/app/core`
  - `backend/app/data`
- Added FastAPI bootstrap app with:
  - settings loader (`pydantic-settings`)
  - CORS middleware
  - API router mounting
- Added health endpoint:
  - `GET /api/health`
- Added backend env template:
  - `.env.example`
- Added Python dependencies with `uv` and generated lockfile:
  - `uv.lock`

Acceptance checks completed:
- App import and in-process route test succeeded (`/api/health` returned 200).
- Uvicorn server startup verified on `127.0.0.1:8000`.
- Env-backed config loading verified through runtime response.

Key files touched:
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/api/router.py`
- `backend/app/api/routes/health.py`
- `backend/app/schemas/health.py`
- `.env.example`
- `pyproject.toml`
- `uv.lock`

### Phase 4: Mock Data and Tool Layer
Status: Completed on March 7, 2026

What was done:
- Added backend mock dataset module aligned with existing frontend table shape:
  - `backend/app/data/mock_data.py`
- Implemented data access tool adapters:
  - `get_agency_profile`
  - `list_agencies` (filter/sort/limit)
  - `get_portfolio_summary` (aggregates + benchmark deltas)
- Implemented planning helpers:
  - `cluster_agencies` (`kmeans-lite` local clustering)
  - `order_visits_by_route` (nearest-neighbor over haversine distance)
- Implemented persistence layer with in-memory cache + JSON storage:
  - `save_daily_plan`
  - `save_meeting_prep`
  - `log_meeting_outcome`
  - `create_tasks`
  - `list_tasks`
- Exposed tool layer over FastAPI under:
  - `/api/tools/agencies`
  - `/api/tools/agencies/{agency_id}/profile`
  - `/api/tools/portfolio/summary`
  - `/api/tools/planning/cluster`
  - `/api/tools/planning/route`
  - `/api/tools/persistence/*`

Acceptance checks completed:
- Python compile check:
  - `UV_CACHE_DIR=.uv-cache uv run python -m compileall backend/app`
- In-process FastAPI smoke validation for all new Phase 4 endpoints:
  - `GET /api/tools/agencies`
  - `GET /api/tools/agencies/AG001/profile`
  - `GET /api/tools/portfolio/summary`
  - `POST /api/tools/planning/cluster`
  - `POST /api/tools/planning/route`
  - `POST /api/tools/persistence/daily-plan`
  - `POST /api/tools/persistence/meeting-prep`
  - `POST /api/tools/persistence/meeting-outcome`
  - `POST /api/tools/persistence/tasks`
  - `GET /api/tools/persistence/tasks`

Key files touched:
- `backend/app/data/mock_data.py`
- `backend/app/tools/data_access.py`
- `backend/app/tools/planning.py`
- `backend/app/services/workflow_store.py`
- `backend/app/api/routes/tools.py`
- `backend/app/api/router.py`
- `backend/app/schemas/agency.py`
- `backend/app/schemas/planning.py`
- `backend/app/schemas/persistence.py`
- `backend/app/data/runtime_store.json`

### Phase 5: Structured Output Schemas
Status: Completed on March 7, 2026

What was done:
- Added strict structured output schema module with `extra="forbid"` contract enforcement:
  - `MeetingNarrative`
  - `DailyVisitPlan`
  - `ClusterPlan`
  - `TaskList`
- Added contract service layer for schema registry and validation:
  - list contracts
  - return JSON Schema for each contract
  - validate parsed JSON payloads against contract models
  - provide Responses API `json_schema` format block helper for Phase 6
- Added API endpoints for contract discovery and validation:
  - `GET /api/agent/contracts`
  - `GET /api/agent/contracts/{contract}/schema`
  - `POST /api/agent/contracts/{contract}/validate`
- Updated runtime helper to report contracts-ready state and expose available contracts.

Acceptance checks completed:
- Python compile check:
  - `UV_CACHE_DIR=.uv-cache uv run python -m compileall backend/app`
- In-process FastAPI contract validation checks:
  - validated all 4 contracts via `/validate`
  - fetched schemas for all contracts via `/schema`
  - negative test confirmed extra/unknown field is rejected with 422

Key files touched:
- `backend/app/schemas/agent_outputs.py`
- `backend/app/schemas/contracts.py`
- `backend/app/services/structured_outputs.py`
- `backend/app/api/routes/contracts.py`
- `backend/app/api/router.py`
- `backend/app/services/agent_runtime.py`
- `backend/app/services/__init__.py`

### Phase 6: Single Orchestrator Agent (Responses API)
Status: Completed on March 7, 2026

What was done:
- Implemented first production agent flow:
  - `POST /api/agent/meeting-prep`
- Added single-orchestrator service with Responses API path and local fallback path:
  - OpenAI path:
    - uses function tools (`get_agency_profile`, `get_portfolio_summary`)
    - handles iterative function-call loop
    - enforces `MeetingNarrative` structured output contract
  - Local fallback path:
    - deterministic draft generation from tool outputs
    - still validates against `MeetingNarrative` contract
- Added request/response schemas for agent endpoint.
- Added optional persistence integration:
  - saves generated meeting prep via workflow store when `save_result=true`
- Updated runtime metadata to `meeting-prep-ready`.

Acceptance checks completed:
- Python compile check:
  - `UV_CACHE_DIR=.uv-cache uv run python -m compileall backend/app`
- In-process FastAPI smoke validation:
  - `POST /api/agent/meeting-prep` with default payload (200)
  - Turkish + tone variant payload (200)
  - invalid `agency_id` returns 404
  - extra request field returns 422
  - `save_result=false` confirmed no persistence side effect

Key files touched:
- `backend/app/agents/meeting_prep_orchestrator.py`
- `backend/app/agents/meeting_prep_fallback.py`
- `backend/app/api/routes/agent.py`
- `backend/app/api/router.py`
- `backend/app/schemas/agent_api.py`
- `backend/app/services/agent_runtime.py`
- `backend/app/agents/__init__.py`

### Phase 7: Planner Agent Flow
Status: Completed on March 7, 2026

What was done:
- Implemented second production agent flow:
  - `POST /api/agent/daily-plan`
- Added planner orchestrator service with Responses API path and local fallback path:
  - OpenAI path:
    - uses function tools (`list_agencies`, `cluster_agencies`, `order_visits_by_route`)
    - handles iterative function-call loop
    - enforces `DailyVisitPlan` structured output contract
  - Local fallback path:
    - deterministic planner pipeline (`list agencies -> cluster -> route`)
    - assigns visit goals/objectives/rationales and computes summary notes
    - validates output against `DailyVisitPlan`
- Added request/response schemas for daily plan endpoint.
- Added optional persistence integration:
  - saves generated daily plan via workflow store when `save_result=true`
- Updated runtime metadata to indicate both agent flows are ready.

Acceptance checks completed:
- Python compile check:
  - `UV_CACHE_DIR=.uv-cache uv run python -m compileall backend/app`
- In-process FastAPI smoke validation:
  - `POST /api/agent/daily-plan` default payload (200)
  - Turkish payload with persistence (200, `saved_plan_id` returned)
  - city filter with no candidates returns 400
  - invalid `max_visits` returns 422
  - extra request field returns 422

Key files touched:
- `backend/app/agents/daily_plan_orchestrator.py`
- `backend/app/agents/daily_plan_fallback.py`
- `backend/app/api/routes/agent.py`
- `backend/app/schemas/agent_api.py`
- `backend/app/services/agent_runtime.py`
- `backend/app/agents/__init__.py`

### Phase 8: Frontend Integration (Targeted)
Status: Completed on March 7, 2026

What was done:
- Added frontend API client layer:
  - centralized fetch client + query helper
  - typed agent/tool request-response models
  - dedicated API modules for `/api/agent/*` and `/api/tools/*`
- Replaced hardcoded AI simulation in assistant widget:
  - wired to backend endpoints with intent routing for:
    - meeting prep generation
    - daily plan generation
    - portfolio and agency lookups
  - added loading/error handling in chat flow
- Replaced local meeting-prep string generation:
  - `Meeting Prep (AI)` screen now calls `POST /api/agent/meeting-prep`
  - preserves existing controls and formats structured output into editable text area
- Wired daily planning actions to backend:
  - `Optimize Route` now calls `POST /api/agent/daily-plan` and replaces visit sequence
  - `Generate Prep` per visit now calls `POST /api/agent/meeting-prep`
  - `Generate All Narratives` now batch-generates meeting prep for all visits
- Kept generated UI layout intact; edits were wiring-focused only.

Acceptance checks completed:
- Frontend production build:
  - `npm run build` success

Key files touched:
- `src/app/api/client.ts`
- `src/app/api/types.ts`
- `src/app/api/agent.ts`
- `src/app/api/tools.ts`
- `src/app/api/formatters.ts`
- `src/app/components/AIAssistant.tsx`
- `src/app/components/screens/MeetingPrep.tsx`
- `src/app/components/screens/DailyPlan.tsx`

### Screen + Button Audit (Planning Baseline: March 7, 2026)
Status: Completed (analysis only)

Findings by screen:
- Login:
  - `Sign In` only navigates to `/app`; no auth/session token management yet.
- Dashboard:
  - Navigation CTAs work (`View Day Plan`, `Generate Meeting Prep`, `View All Agencies`, `Open` agency).
  - `Add to Plan` and sparkles quick-action buttons are currently UI-only placeholders.
- Agencies:
  - Search/tier/city/risk filters and row selection are local component state.
  - Bulk actions (`Generate Narratives`, `Create Visit Plan`) and row quick actions are placeholders.
- Agency Profile:
  - Local `Generate Narrative` writes to textarea only.
  - Top-right actions and output actions (`Save to Notes`, `Create Tasks`, `Export`) are placeholders.
- Daily Plan:
  - Backend wired: `Optimize Route`, per-visit `Generate Prep`, `Generate All Narratives`.
  - Drag/drop ordering, notes edits, checklist, and outcome controls are local only and not persisted.
- Map & Clusters:
  - `Create Clusters` works locally with mock data.
  - `Add to Plan`, `View Route`, `Create 3-Day Plan` are placeholders.
- Meeting Prep (AI):
  - `Generate` and `Regenerate with Constraints` call backend.
  - `Save to Notes`, `Create Tasks`, `Export` are placeholders.
- Tasks & Follow-ups:
  - Filters are local; create/edit/complete and AI helper buttons are placeholders.
- Settings:
  - Inputs/switches are uncontrolled defaults; `Save Changes`/`Cancel` are placeholders.
- Global AI Assistant widget:
  - Prompt send is backend-wired for meeting prep, daily plan, portfolio summary, and agency lookup.

Post-baseline updates (March 8, 2026):
- Login/logout/session bootstrap are now backend-auth backed via `/api/auth/login`, `/api/auth/logout`, and `/api/auth/me`.
- Daily plan draft restore is now backend-backed via `/api/workflows/daily-plans/current` during authenticated session bootstrap.

### Phase 9: Application State Management and Session Lifecycle
Status: Completed on March 7, 2026

What was done:
- Added centralized frontend state architecture under `src/app/state/*`:
  - app store with slices for `session`, `settings`, `planner`, `meetingPrep`, `tasks`, `mutations`
  - local storage helpers and canonical state contract (`contracts.ts`)
  - lightweight API cache provider (`serverCache.tsx`)
- Implemented explicit login-to-exit lifecycle for PoC users:
  - initial hardcoded credential checks for `salesperson` and `manager` (later replaced by backend auth wiring in Phase 10)
  - session bootstrap from persisted storage
  - public/protected route guards for `/` and `/app/*`
  - logout cleanup for volatile slices and cache invalidation while keeping durable preferences
- Added durable settings slice and connected Settings screen:
  - language, tone, route constraints, notification toggles now controlled and persistable
  - `Save Changes` and `Cancel` now have concrete behavior
- Added planner draft slice and backend autosave:
  - centralized visit ordering/notes/checklist/outcome state
  - debounced autosave to `/api/tools/persistence/daily-plan` (later switched to protected workflow endpoints in Phase 10)
  - outcome logging wired to `/api/tools/persistence/meeting-outcome`
- Added meeting-prep draft slice:
  - selected agencies, generation params, editable output persisted in store
  - wired `Save to Notes` to `/api/tools/persistence/meeting-prep`
  - wired `Create Tasks` to `/api/tools/persistence/tasks`
- Added task workspace slice and action wiring:
  - persisted/local task filters + bulk selection state
  - load/create task flows integrated with backend persistence endpoints
  - `Complete` action now updates task state with optimistic local completion behavior
- Wired placeholder actions to real intents:
  - `Add to Plan` actions now connect to planner draft from Dashboard/Agencies/Profile/Map screens
  - meeting-prep/profile note/task actions now trigger real persistence calls
  - settings save/cancel flow now functional

Acceptance checks completed:
- Frontend production build:
  - `npm run build` success

Key files touched:
- `src/app/state/store.tsx`
- `src/app/state/serverCache.tsx`
- `src/app/state/contracts.ts`
- `src/app/state/mutations.ts`
- `src/app/state/storage.ts`
- `src/app/components/routing/ProtectedRoute.tsx`
- `src/app/components/routing/PublicOnlyRoute.tsx`
- `src/app/routes.ts`
- `src/main.tsx`
- `src/app/components/screens/Login.tsx`
- `src/app/components/Layout.tsx`
- `src/app/components/screens/Dashboard.tsx`
- `src/app/components/screens/AgenciesList.tsx`
- `src/app/components/screens/AgencyProfile.tsx`
- `src/app/components/screens/DailyPlan.tsx`
- `src/app/components/screens/MeetingPrep.tsx`
- `src/app/components/screens/TasksFollowUps.tsx`
- `src/app/components/screens/Settings.tsx`
- `src/app/components/screens/MapClusters.tsx`
- `src/app/api/persistence.ts`
- `src/app/api/types.ts`
- `src/app/api/client.ts`

### Phase 10: Data Backend and Mock Database Layer (Login-to-Exit Persistence)
Status: Completed on March 8, 2026

What was done:
- Added a local SQLite PoC database layer with startup bootstrap:
  - schema initialization + deterministic seed loading
  - keeps existing 8-row agency base case and KPI/benchmark shape
- Added repository contracts + SQLite implementation for domain modules:
  - `auth`, `sessions`, `agencies`, `daily_plans`, `meeting_preps`, `meeting_outcomes`, `tasks`, `settings`
- Added auth/session API:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Added bearer-session dependency for protected routes:
  - auth context resolver + role-scoped user resolution
- Added protected workflow CRUD APIs:
  - daily plans: create, update, current, publish
  - meeting preps: create draft, update, list
  - meeting outcomes: create
  - tasks: create, list, update, complete, bulk-from-narrative
  - settings: read/update by user scope
- Refactored legacy persistence layer:
  - `workflow_store` now repository-backed (SQLite) instead of JSON-only
  - existing `/api/tools/persistence/*` and `/api/agent/*` flows kept compatible
- Refactored data access tools to read from seeded SQLite agencies/KPI/benchmarks.
- Added DB admin commands for repeatable demos:
  - `uv run python -m backend.app.db.admin init`
  - `uv run python -m backend.app.db.admin reset`
- Added backend tests for Phase 10:
  - auth/session lifecycle
  - repository CRUD
  - route-level authorization + validation
  - seed consistency (8 agencies + expected base shape)
- Added frontend auth/session wiring to backend auth endpoints:
  - login now calls `POST /api/auth/login`
  - logout now calls `POST /api/auth/logout`
  - bootstrapped stored session is validated via `GET /api/auth/me`
- Added frontend daily-plan persistence/restore over protected workflows:
  - autosave now uses `POST/PATCH /api/workflows/daily-plans`
  - session bootstrap now restores current-day plan via `GET /api/workflows/daily-plans/current`
  - demonstration scenario validated: login -> plan visits -> logout -> login -> plan restored

Acceptance checks completed:
- Python compile check:
  - `UV_CACHE_DIR=.uv-cache uv run python -m compileall backend/app`
- In-process FastAPI smoke validation:
  - auth login/me/logout lifecycle (including post-logout 401)
  - protected daily-plan create/current/publish
  - protected task create/complete
  - legacy `/api/tools/persistence/*` compatibility
- Backend tests:
  - `UV_CACHE_DIR=.uv-cache uv run python -m unittest discover -s backend/tests -p 'test_*.py'`
- Frontend build:
  - `npm run build`
- End-to-end session scenario (in-process API smoke):
  - `login -> create workflow daily plan -> logout -> login -> fetch current plan` verified with persisted visit payload

Key files touched:
- `backend/app/core/config.py`
- `backend/app/main.py`
- `backend/app/db/sqlite.py`
- `backend/app/db/schema.py`
- `backend/app/db/seed.py`
- `backend/app/db/bootstrap.py`
- `backend/app/db/admin.py`
- `backend/app/repositories/contracts.py`
- `backend/app/repositories/sqlite_gateway.py`
- `backend/app/repositories/__init__.py`
- `backend/app/api/dependencies.py`
- `backend/app/api/routes/auth.py`
- `backend/app/api/routes/workflows.py`
- `backend/app/api/router.py`
- `backend/app/tools/data_access.py`
- `backend/app/services/workflow_store.py`
- `backend/app/schemas/auth.py`
- `backend/app/schemas/workflows.py`
- `backend/app/schemas/persistence.py`
- `backend/tests/test_phase10.py`
- `.env.example`
- `backend/README.md`
- `src/app/api/auth.ts`
- `src/app/api/workflows.ts`
- `src/app/state/store.tsx`
- `src/app/components/screens/DailyPlan.tsx`
- `src/app/state/contracts.ts`

### Phase 11: Turkish/English Support
Status: Completed on March 23, 2026

What was done:
- Added lightweight frontend i18n layer:
  - centralized bilingual dictionary (`en` / `tr`)
  - app-level i18n context/provider driven by persisted `settings.language`
- Kept settings language toggle as the control point and wired UI copy to read from the shared i18n context.
- Localized key copy and labels across core surfaces:
  - shell/navigation (`Layout`)
  - login flow (`Login`)
  - dashboard overview and key actions (`Dashboard`)
  - daily planning workflow labels/toasts (`DailyPlan`)
  - meeting prep workflow labels/toasts (`MeetingPrep`)
  - settings screen labels/help text/actions (`Settings`)
  - assistant widget shell copy and bilingual intent parsing (`AIAssistant`)
- Updated assistant backend request language to follow current app language.

Acceptance checks completed:
- Frontend production build:
  - `npm run build` success

Key files touched:
- `src/app/i18n/copy.ts`
- `src/app/i18n/context.tsx`
- `src/app/i18n/index.ts`
- `src/main.tsx`
- `src/app/components/Layout.tsx`
- `src/app/components/AIAssistant.tsx`
- `src/app/components/screens/Login.tsx`
- `src/app/components/screens/Dashboard.tsx`
- `src/app/components/screens/DailyPlan.tsx`
- `src/app/components/screens/MeetingPrep.tsx`
- `src/app/components/screens/Settings.tsx`

### Phase 12A: Agentic Backend Traceability
Status: In Progress (started March 23, 2026)

Objective:
- Keep current two-agent structure (`meeting-prep`, `daily-plan`) while making each run auditable with persisted traces and explicit tool-policy enforcement.

Implemented in this session:
- Added run-level trace persistence:
  - `agent_runs` table with run metadata (`provider`, `model`, `status`, fallback and warnings, response id, timestamps).
  - `agent_tool_calls` table with per-step tool trace payloads and duration.
- Extended repository contracts + SQLite gateway:
  - create/update run records
  - persist/list tool-call records
  - fetch run metadata by `run_id`
- Updated orchestrators (`meeting-prep`, `daily-plan`) to emit structured trace events:
  - model call start/end
  - per-tool call status
  - contract validation outcome
  - fallback reason category
- Enforced tool policy in code:
  - meeting prep requires `get_agency_profile` + `get_portfolio_summary`
  - daily plan requires ordered tool chain `list_agencies -> cluster_agencies -> order_visits_by_route`
- Added evidence maps to agent responses and included `run_id` + `trace_summary` in API responses.
- Added run lookup endpoint:
  - `GET /api/agent/runs/{run_id}`
- Added backend coverage:
  - `backend/tests/test_phase12.py` validates trace persistence, explicit policy error codes, evidence map presence, and run metadata lookup.

Acceptance checks completed in this session:
- Backend tests:
  - `UV_CACHE_DIR=.uv-cache uv run python -m unittest discover -s backend/tests -p 'test_*.py'`
- API behavior:
  - `/api/agent/meeting-prep` and `/api/agent/daily-plan` now return `run_id`
  - `/api/agent/runs/{run_id}` returns stored run metadata

### Phase 12B: AI Interaction + UI Tightening
Status: In Progress (started March 23, 2026)

Objective:
- Make AI interactions consistent in the frontend and reduce duplicated/ambiguous AI actions.

Implemented in this session:
- Added shared AI interaction shell component:
  - standardized loading/error/retry panel
  - clear "AI generated" indicator
  - run metadata (`provider`, `model`, `tools`, `warnings`, `run_id`)
  - "Why this output?" evidence block
- Wired shell into main AI surfaces:
  - `MeetingPrep`
  - `DailyPlan`
  - global `AIAssistant`
- Consolidated non-core AI entry points:
  - replaced scattered AI buttons in dashboard/agencies/tasks/agency profile with `Open in AI Assistant` behavior using pre-filled context prompts.
- Added assistant deep-link handling via route query params:
  - opens assistant and pre-fills prompt context from any screen.

Acceptance checks completed in this session:
- Frontend build:
  - `npm run build`
- Scope alignment:
  - direct generation calls now remain on `Meeting Prep`, `Daily Plan`, and global `AI Assistant`
  - other screens now route to assistant context flow.

Key files changed for 12A + 12B:
- `backend/app/db/schema.py`
- `backend/app/db/seed.py`
- `backend/app/repositories/contracts.py`
- `backend/app/repositories/sqlite_gateway.py`
- `backend/app/services/agent_trace.py`
- `backend/app/schemas/agent_api.py`
- `backend/app/agents/meeting_prep_orchestrator.py`
- `backend/app/agents/daily_plan_orchestrator.py`
- `backend/app/api/routes/agent.py`
- `backend/tests/test_phase12.py`
- `src/app/components/ai/AIInteractionShell.tsx`
- `src/app/components/ai/assistantUtils.ts`
- `src/app/components/AIAssistant.tsx`
- `src/app/components/Layout.tsx`
- `src/app/components/screens/MeetingPrep.tsx`
- `src/app/components/screens/DailyPlan.tsx`
- `src/app/components/screens/Dashboard.tsx`
- `src/app/components/screens/AgenciesList.tsx`
- `src/app/components/screens/AgencyProfile.tsx`
- `src/app/components/screens/TasksFollowUps.tsx`
- `src/app/api/agent.ts`
- `src/app/api/types.ts`
- `src/app/api/client.ts`

### Phase 13: Persistent Right-Dock AI Assistant (VS Code-Style)
Status: In Progress (started March 23, 2026)

Objective:
- Keep the AI assistant visible on the right side of the app at all times (desktop-first), so users can interact continuously while navigating screens.
- Support assistant workflows for:
  - questions about app data (agencies, portfolio, plans, tasks)
  - guided actions that trigger existing agent/backend flows
- Preserve PoC guardrails: no real external data sources, role scope remains manager/salesperson only, bilingual UX stays intact.

Implemented in this session:
- Layout architecture upgrade:
  - replaced floating assistant widget/toggle behavior with a persistent right-side dock on desktop (`xl` breakpoint and above).
  - kept app shell as 3 regions: left nav, center content, right assistant.
  - added responsive fallback to right `Sheet` assistant on smaller screens with floating launcher.
- Assistant state persistence across navigation:
  - added `assistant` slice to app state and persisted storage:
    - messages
    - draft input
    - last prompt
    - last trace/evidence/error
    - pending action confirmation state
    - mobile sheet open state
  - deep-link (`assistant=open&assistant_prompt=...`) now fills assistant draft in state and opens mobile sheet when applicable.
- Data query + action execution model:
  - formalized intent routing in shared assistant utils:
    - query intents: portfolio summary, agency search
    - action intents: meeting prep generation, daily plan generation
  - added explicit confirmation step before executing action intents.
  - action execution is routed to existing agent/tool APIs only.
- Context awareness and trust UX:
  - assistant header now shows active route context and relevant hints (selected agency/visit/task count).
  - retained Phase 12 trace/evidence panel and run-id detail toggle in the dock.
  - added explicit action preview text before confirmation.
- i18n + copy alignment:
  - localized new assistant dock labels, confirmation copy, context labels, and action previews in `en`/`tr`.
- extracted intent heuristics into `assistantUtils` to centralize bilingual keyword parsing.

Acceptance checks completed in this session:
- Frontend build:
  - `npm run build`

Key files changed in this session:
- `src/app/components/Layout.tsx`
- `src/app/components/AIAssistant.tsx`
- `src/app/components/ai/assistantUtils.ts`
- `src/app/state/index.ts`
- `src/app/state/contracts.ts`
- `src/app/state/types.ts`
- `src/app/state/store.tsx`
- `src/app/i18n/copy.ts`

### Phase 14: Commercial Data Security for Cloud Agentic Backend
Status: Pending

Planned deliverables:
- Add preprocessing/masking before cloud model calls.
- Mask or genericize agency names before sending payloads.
- Mask or genericize commercial figures/amount fields before sending payloads.
- Align redaction behavior with Phase 12 trace model (store redacted-safe traces only).


## HOLD HERE FOR UPDATED PRIORITIES AS PER "MEETING_FLOW_IMPLEMENTATION_PLAN.md" - MAY CONTINUE LATER
### Phase 15: Docs, Env, and QA
Status: Pending

Planned deliverables:
- Finalize `.env.example` for frontend/backend.
- Update README runbook for split frontend/backend.
- Add regression test checklist and smoke runbook for agent traces + AI UX flows.

## Session Handoff Notes
- Current app remains mock-data-first, with targeted backend integration now active for core AI actions.
- React/Tailwind/Vite baseline is now modernized and secure.
- Backend scaffold plus Phase 4, 5, 6, and 7 layers are implemented and verified.
- Frontend session lifecycle now uses backend auth/session endpoints and validates stored sessions via `/api/auth/me`.
- Daily plan state now persists/restores through protected workflow endpoints, enabling login -> plan -> logout -> login continuity.
- Next session should close residual Phase 12A/12B and Phase 13 UX/agent-action edge cases, then move to Phase 14 (Commercial Data Security), then Phase 15 (Docs, Env, and QA).

## Demo Credentials (PoC Only)
- Salesperson:
  - Email: `john.smith@company.com`
  - Password: `password`
  - Role: `salesperson`
- Manager:
  - Email: `ayse.demir@company.com`
  - Password: `manager123`
  - Role: `manager`
- Notes:
  - These credentials are seeded in the local PoC database and are for demo/dev use only.
  - Backend auth endpoints validate these users (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`).

## Quick Resume Commands
- Frontend:
  - `npm install`
  - `npm run dev`
- Frontend build check:
  - `npm run build`
- Security check:
  - `npm audit`
- Backend:
  - `UV_CACHE_DIR=.uv-cache uv sync`
  - `UV_CACHE_DIR=.uv-cache uv run python -m backend.app.db.admin init`
  - `UV_CACHE_DIR=.uv-cache uv run python -m backend.app.db.admin reset`
  - `UV_CACHE_DIR=.uv-cache uv run uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000`
