1) Recommended architecture for your app
A. Keep agents “thin”, tools “strong”
Your agent should not “think in free text and hope it works”. Instead:
the agent decides what to do
tools fetch data / compute / enforce schemas
the agent returns structured outputs to the UI
Use Structured Outputs so your UI receives reliable JSON (e.g., DailyPlan, MeetingNarrative, ClusterPlan, FollowUpTasks).
B. A simple multi-agent setup (3–4 agents)
You can do this with one agent, but splitting makes it more robust:
Portfolio Analyst Agent
Explains agency metrics, benchmarks, drivers, risks/opportunities.
Meeting Coach Agent
Produces talk tracks, agenda, questions, commitments (per your templates).
Field Planner Agent
Chooses which agencies to visit today, clusters them, orders visits, estimates travel.
Follow-up Agent
Converts meeting notes/outcomes into tasks, reminders, and follow-up summaries.
Use Agents SDK to orchestrate handoffs among these agents when needed.
2) What tools you should implement (minimal, high leverage)
Your app already has clean tables (AGENCIES, AGENCY_KPIS_LATEST, PORTFOLIO_BENCHMARKS). Great. Your “tools” should expose these safely.
Tool group 1 — Data access (must-have)
get_agency_profile(agency_id) → returns agency + latest KPIs + benchmark slice
list_agencies(filters, limit, sort) → used for search/filters and candidate pools
get_portfolio_summary(owner/region) → aggregates KPIs and returns portfolio stats
These are just your own APIs (or DB queries) called through function calling.
Tool group 2 — Planning (must-have)
cluster_agencies(agency_ids, k, method="kmeans") → returns cluster assignment
order_visits_by_route(start_latlon, agency_latlons, constraints) → returns ordered sequence + distance/time estimates
You can implement clustering locally (scikit-learn) and routing either:
simple heuristic (nearest-neighbor) first
later integrate a proper routing API (Google/Mapbox/OSRM)
Tool group 3 — Persistence & workflow
save_daily_plan(user_id, date, plan_json)
save_meeting_prep(agency_id, narrative_json)
log_meeting_outcome(agency_id, outcome, notes, next_steps)
create_tasks(tasks_json) / list_tasks(...)
3) The “contract” between UI and agents: define JSON schemas first
Before writing any agent prompts, define a few schemas that your UI will consume. Then force the model to comply with Structured Outputs.
Suggested schemas:
MeetingNarrative
DailyVisitPlan
ClusterPlan
TaskList
Structured Outputs ensures the model returns JSON that matches your schema (no missing keys, no random formats).
Example: MeetingNarrative fields
agency_id
talk_track (bullets)
agenda (timed list)
questions_to_ask
risks (each with metrics quoted)
opportunities (by branch)
commitments_next_steps
metric_quotes (explicit numbers used + benchmark deltas)
4) Build sequence (fastest path)
Step 1 — Start with a single-agent “orchestrator”
Use Responses API with:
your tool definitions (function calling)
structured output schema for one feature at a time
The Responses API is the core endpoint for tool-using apps.
Start with: Generate Meeting Prep
Why? It’s easiest to validate correctness (you can inspect the narrative vs. metrics).
Step 2 — Add the planner tools (cluster + route)
Then implement Daily Plan:
agent calls list_agencies(...) (pull candidates)
agent calls cluster_agencies(...)
agent calls order_visits_by_route(...)
agent returns DailyVisitPlan JSON
Step 3 — Split into multiple agents (optional but recommended)
Once flows work, move orchestration into Agents SDK so you can:
hand off from Planner → Meeting Coach for each planned visit
capture traces for debugging
keep logic modular