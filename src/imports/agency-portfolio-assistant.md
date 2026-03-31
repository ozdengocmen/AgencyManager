You are an expert product + UI/UX designer building a responsive web app (desktop-first, tablet-friendly) for insurance field sales who manage agency portfolios. Build an agentic AI–augmented “Agency Portfolio Assistant”.
0) App Goal
The app helps a salesperson:
Prepare meeting narratives per agency (talk track + risks + opportunities + next best actions).
Plan daily visits (which agencies, goals, agenda, follow-ups).
Optimize route + clustering using latitude/longitude.
1) Data Model (Simplified & Prepared)
Assume the app can query two clean tables plus benchmarks:
Table 1: AGENCIES
agency_id
agency_name
address_text (display only)
city
district
latitude
longitude
sales_owner (optional)
priority_tier (A/B/C)
target_visit_frequency (weekly/monthly/quarterly)
preferred_visit_time_window (morning/afternoon/any)
last_visit_date
next_recommended_visit_date
Table 2: AGENCY_KPIS_LATEST
(One row per agency, latest snapshot)
agency_id
premiums_written_total
total_revenue
claims_total
portfolio_concentration
renewal_rate (standardized scale, e.g. 0–100)
yoy_growth_motor (standardized, e.g. percent)
yoy_growth_home
yoy_growth_health
Derived KPIs already computed
claims_ratio (e.g., claims_total / premiums_written_total)
overall_health_score (0–100)
renewal_risk_flag (boolean)
growth_best_branch (motor/home/health)
growth_worst_branch (motor/home/health)
Table 3: PORTFOLIO_BENCHMARKS
(At least by sales_owner or region; can also be global)
benchmark_key (e.g., sales_owner or region)
avg_renewal_rate
avg_claims_ratio
avg_overall_health_score
avg_yoy_growth_motor
avg_yoy_growth_home
avg_yoy_growth_health
Optional percentiles: p25, p50, p75 for key metrics
Data rules
All rates/growth are consistent in units and scale.
Missing values are explicit (0 + is_missing_* flags if needed).
Lat/lon exist for all agencies.
2) Primary Users & Roles
Salesperson: manages own portfolio, daily plans, meeting prep, and follow-ups.
Manager (optional): sees team-level dashboards and plans.
3) Navigation (Left Sidebar)
Dashboard
Agencies
Daily Plan
Map & Clusters
Meeting Prep (AI)
Tasks & Follow-ups
Settings
4) Required Screens & UI Details
Screen A — Login / Role & Portfolio Selection
Login placeholder
Role: Salesperson / Manager
Portfolio filter: sales_owner / region
Screen B — Dashboard (Today & Portfolio Health)
Layout: top summary + two columns.
Top: Today
“Today’s plan” card:
visits planned
estimated travel time
first/last agency
CTA: Start my day plan
“Next visit” card:
next agency name + city/district
CTA: Generate meeting prep
Portfolio KPI tiles
Total premiums
Total revenue
Claims ratio (avg)
Avg renewal rate
Avg overall health score
Priority feed (AI-ranked)
Top 8 agencies with badges:
Renewal risk
High claims ratio
Concentration risk
Growth opportunity (best branch)
Each item has quick actions:
Add to today plan
Open agency
Generate narrative
Screen C — Agencies List (Portfolio Table + Smart Filters)
A table with strong filtering and bulk actions.
Filters
City / district
Priority tier (A/B/C)
Renewal risk flag (on/off)
Visit due: “Overdue / Due this week / Due this month”
Target frequency (weekly/monthly/quarterly)
Best branch (motor/home/health)
Overall health score range
Claims ratio range
Concentration range
Columns
Agency name
City / district
Priority tier
Overall health score
Renewal rate
Claims ratio
Concentration
Best branch + YoY best
Next recommended visit date
AI priority score (computed in-app from the prepared fields)
Row actions
Open agency
Add to today plan
Generate meeting narrative
Bulk actions
Select multiple → Create clusters & propose visit plan
Select multiple → Generate narratives pack
Screen D — Agency Profile (360 View)
Header includes:
Name + tier + address
Quick actions: Add to plan, Generate prep, Log meeting
Tabs:
Tab 1: Overview
KPI cards: premiums, revenue, renewal rate, claims ratio, concentration, overall health score
Benchmark comparison strip (vs portfolio averages):
Renewal rate: agency vs avg
Claims ratio: agency vs avg
Health score: agency vs avg
“Why this agency matters today” (AI) — 3–5 bullets using only prepared metrics
Visit planning block:
last visit date
next recommended visit date
target frequency
preferred time window
Tab 2: Diagnostics
Small charts (optional, simple):
branch YoY growth (motor/home/health)
health score gauge/trend (if you later add historical table)
AI explanation section:
Drivers (renewal, claims ratio, concentration, branch growth)
Risks and opportunities (linked to metrics)
Tab 3: Meeting Prep
Editable narrative builder with these sections:
Opening context (relationship & purpose)
Performance recap (include exact values + benchmark deltas)
Risks to address (renewal risk, claims ratio, concentration)
Opportunities (best branch, cross-sell angles)
Questions to ask (5–8)
Proposed commitments / next steps
Buttons:
Generate narrative (AI)
Generate 3 talk tracks (friendly / consultative / assertive)
Generate agenda (30-min / 45-min variants)
Create follow-up summary + tasks
Tab 4: Notes & Tasks
Notes timeline
Tasks list
“Create tasks from AI output”
Screen E — Daily Plan (Planner Workspace)
Three-panel layout:
Left: Candidate Pool
Filter presets:
“Due this week”
“Renewal risk”
“Near me today”
“High growth opportunity”
Search agencies
Quick add buttons
Middle: Planned Visits (Ordered)
Drag-and-drop ordering
Each visit card shows:
Agency name + city/district
Tier + risk badges
Visit goal tag (Renewal / Claims / Cross-sell / Relationship)
Suggested time window (from preferred_visit_time_window)
Quick button: Generate prep
Right: Visit Detail Panel
For selected visit:
Meeting objective (editable)
AI narrative preview (editable)
Checklist
Notes field (during/after meeting)
Outcome logging:
outcome (success/neutral/risk)
next steps
create follow-up tasks
Primary actions:
Optimize route
Generate narratives for all visits
Export plan (print/PDF style)
Screen F — Map & Clusters (K-means + Route Oriented)
Map with agency pins using lat/lon.
Clustering panel
Algorithm: K-means (default)
Choose k (slider)
Option: “Weight by priority” toggle (A-tier agencies more likely to be included first)
Button: Create clusters
Cluster results list
For each cluster:
Cluster label
Agencies count
Recommended visit sequence (basic nearest-neighbor ordering)
“Add cluster to today plan”
“Create 3-day plan from clusters” (optional)
Screen G — Meeting Prep (AI Studio)
AI workspace for single or bulk meeting prep.
Left: agency selector (single/multi-select)
Middle: template & controls
Right: editable generated output
Templates:
Standard review
Renewal improvement plan
Claims ratio discussion
Growth play (best branch)
Concentration risk mitigation
“Visit due / relationship maintenance” talk track
Controls:
Tone: friendly / consultative / assertive
Length: short / medium / long
Output format: bullets / script / agenda / call notes
Include benchmark comparisons (toggle)
Buttons:
Generate
Regenerate with constraints
Save to agency notes
Create tasks from output
Export narrative pack (for selected agencies)
Screen H — Tasks & Follow-ups
Task list table with filters:
due date, status, agency, tier, risk flags
Create/edit task
AI helper:
“Suggest my top 10 follow-ups today”
“Summarize outstanding risks across planned visits”
Screen I — Settings
Default start location (office/home/manual)
Working hours window
Route preferences (max visits/day, max travel time)
Template manager (admin)
Role permissions
5) AI Assistant Widget (All Screens)
A floating assistant chat (bottom-right) that can:
Explain agency performance in plain language
Draft meeting narratives using only prepared metrics + benchmarks
Suggest next best actions by branch
Recommend daily plan (priority + proximity)
Suggest clustering strategy and visit sequence
Hard constraints
Always include metric values and benchmark deltas when making claims (e.g., “Renewal 62 vs portfolio avg 71”).
Never invent missing data; if missing, say “Not available”.
Output is always editable draft, with “Save to notes / Create tasks” actions.