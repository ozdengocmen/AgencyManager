# Insurance Agency Manager - Presentation Notes

## 1. Executive Summary
- This is a Proof of Concept (POC) for insurance agency portfolio management.
- It is designed for two roles: `manager` and `salesperson`.
- The product combines operational workflow screens (planning, meetings, tasks, map) with an agentic assistant layer.
- Current data is realistic mock data (8 agencies), with backend contracts already shaped for real data integration.

## 2. Demo Access and Scope
- Login roles:
  - Salesperson: `john.smith@company.com` / `password`
  - Manager: `ayse.demir@company.com` / `manager123`
- Language support: English and Turkish across UI labels and generated content.
- POC scope:
  - Agency portfolio visibility
  - Daily visit planning
  - Meeting preparation
  - Follow-up task operations
  - AI-assisted recommendations with trace metadata

## 3. Screen-by-Screen Walkthrough

### A. Login
- Role-based login, language selection, and portfolio scope selection.
- Session-based authentication with protected routes.

### B. Dashboard
- Portfolio KPI summary cards (premiums, revenue, claims ratio, renewal rate, health score).
- "Today's Plan" and "Next Visit" panels.
- Priority feed of agencies with risk/growth tags.
- Quick actions:
  - Open agency
  - Add to day plan
  - Open in AI assistant

### C. Agencies List
- Search and filter by city, tier, and renewal risk.
- Bulk selection and bulk actions.
- KPI table with benchmark comparisons and drill-down links.
- Multi-agency AI prompt generation for meeting preparation.

### D. Agency Profile
- Four tabs:
  - Overview (KPIs, benchmark deltas, visit planning data)
  - Diagnostics (branch growth chart and AI analysis text)
  - Meeting Prep (generate narrative, save notes, create tasks)
  - Notes/Tasks placeholder panel
- Direct actions to add agency to daily plan and invoke assistant.

### E. Daily Plan
- Candidate agency pool with filters.
- Drag-and-drop visit ordering.
- Route optimization via agent endpoint.
- Per-visit detail panel:
  - Objective, notes, checklist, outcome logging
  - One-click meeting prep generation
- Autosave to workflow persistence endpoints.

### F. Map Clusters
- Interactive map with agency markers and route overlays.
- Cluster simulation with adjustable cluster count and weighting.
- Route recalculation trigger and visit completion marking.
- Cluster-level and route-level operational summary cards.

### G. Meeting Prep Workspace
- Multi-agency selection.
- Configurable generation settings (template, tone, length, benchmark inclusion).
- Generated narrative panel with edit/save/export/task-creation actions.
- AI interaction panel shows run metadata and evidence mapping when available.

### H. Tasks & Follow-ups
- Task list with status/priority filters, bulk selection, and completion actions.
- Create/edit user-created tasks.
- Task analytics summary cards.
- AI assistant shortcut for prioritization and follow-up suggestions.

### I. Settings
- Language, route, scheduling, notification, and AI preference controls.
- User profile display for current signed-in role.

### J. Global AI Assistant
- Available from all app screens (context-aware hints included).
- Supports:
  - Query mode (portfolio/agency questions)
  - Action mode with confirmation (daily plan and meeting prep generation)
- Displays trace context when run metadata is returned.

## 4. Agentic Backend Modularity

### A. Layered Architecture
- `Frontend`: React + TypeScript screens call typed API clients.
- `API`: FastAPI route groups isolate concerns:
  - `/api/auth`
  - `/api/tools`
  - `/api/workflows`
  - `/api/agent`
  - `/api/agent/contracts`
- `Orchestrators`: dedicated modules for:
  - `meeting-prep`
  - `daily-plan`
- `Tools`: reusable deterministic tool layer:
  - Data access tools (`get_agency_profile`, `list_agencies`, `get_portfolio_summary`)
  - Planning tools (`cluster_agencies`, `order_visits_by_route`)
- `Repository Gateway`: clear abstraction for storage backend (currently SQLite).

### B. Why This Is Modular
- UI does not call database directly, only API contracts.
- Agent orchestration is separate from tool logic.
- Tool logic is separate from persistence.
- Repository interface allows swapping data source without changing screen logic.

## 5. Traceability and Auditability

### A. Per-run Traceability
- Every agent response returns a `run_id`.
- Responses include:
  - `tools_used`
  - `warnings`
  - `trace_summary` (events like model start/end, tool calls, validation, fallback)
  - `evidence_map` (which tool fields support output metrics)

### B. Persisted Execution Logs
- Backend stores run-level metadata in `agent_runs`.
- Tool execution steps are stored in `agent_tool_calls` with:
  - Step number
  - Arguments/output preview
  - Status
  - Error (if any)
  - Duration
- Full trace retrieval available at `GET /api/agent/runs/{run_id}`.

### C. Contract and Policy Controls
- Structured output contracts are enforced via Pydantic schemas (`MeetingNarrative`, `DailyVisitPlan`, etc.).
- Contract schema discovery and validation endpoints:
  - `GET /api/agent/contracts`
  - `GET /api/agent/contracts/{contract}/schema`
  - `POST /api/agent/contracts/{contract}/validate`
- Tool policy checks ensure required tools are called (and in order where required).

## 6. Company Data Integration Plan (Low-Risk)

### A. Why Integration Is Straightforward
- Current mock data already matches stable domain shape:
  - `agencies`
  - `agency_kpis_latest`
  - `portfolio_benchmarks`
- The same shape is used end-to-end:
  - frontend mock models
  - backend schemas
  - SQLite tables
  - tool outputs

### B. Integration Options
- Option 1: Replace seeded mock rows with company extracts (fastest pilot path).
- Option 2: Implement a new repository adapter (PostgreSQL/API/data warehouse) behind `RepositoryGateway`.
- Option 3: Hybrid approach:
  - Keep workflow writes local first
  - Read agency/KPI reference data from company source

### C. Recommended Rollout Steps
1. Field mapping: map company columns to existing agency/KPI/benchmark schema.
2. Data ingestion: load into backend tables or repository adapter.
3. Parallel validation: compare agent outputs between mock and real snapshots.
4. Access control hardening: map real users/roles to existing manager/salesperson flow.
5. Progressive cutover: switch read endpoints first, then workflow persistence.

### D. Expected UI Impact
- Minimal UI rewrite expected.
- Most changes are backend-side data adapter and ETL.
- Existing screen behavior and AI interaction patterns can remain unchanged.

## 7. Suggested Demo Narrative (10-15 Minutes)
1. Login as salesperson and show bilingual toggle.
2. Dashboard overview and risk-based agency prioritization.
3. Agencies table filtering and drill-down to agency profile.
4. Meeting prep generation and task creation from narrative.
5. Daily plan optimization and map cluster/routing visualization.
6. Task follow-up workspace and completion loop.
7. Close with traceability (`run_id`, tools used, evidence map) and integration plan.
