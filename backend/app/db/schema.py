"""Schema management for the local SQLite PoC database."""

from __future__ import annotations

import sqlite3

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  portfolio_scope TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  language TEXT NOT NULL,
  portfolio_scope TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS agencies (
  agency_id TEXT PRIMARY KEY,
  agency_name TEXT NOT NULL,
  address_text TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  sales_owner TEXT NOT NULL,
  priority_tier TEXT NOT NULL,
  target_visit_frequency TEXT NOT NULL,
  preferred_visit_time_window TEXT NOT NULL,
  last_visit_date TEXT NOT NULL,
  next_recommended_visit_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agency_kpis_latest (
  agency_id TEXT PRIMARY KEY,
  premiums_written_total REAL NOT NULL,
  total_revenue REAL NOT NULL,
  claims_total REAL NOT NULL,
  portfolio_concentration REAL NOT NULL,
  renewal_rate REAL NOT NULL,
  yoy_growth_motor REAL NOT NULL,
  yoy_growth_home REAL NOT NULL,
  yoy_growth_health REAL NOT NULL,
  claims_ratio REAL NOT NULL,
  overall_health_score REAL NOT NULL,
  renewal_risk_flag INTEGER NOT NULL,
  growth_best_branch TEXT NOT NULL,
  growth_worst_branch TEXT NOT NULL,
  FOREIGN KEY (agency_id) REFERENCES agencies (agency_id)
);

CREATE TABLE IF NOT EXISTS portfolio_benchmarks (
  benchmark_key TEXT PRIMARY KEY,
  avg_renewal_rate REAL NOT NULL,
  avg_claims_ratio REAL NOT NULL,
  avg_overall_health_score REAL NOT NULL,
  avg_yoy_growth_motor REAL NOT NULL,
  avg_yoy_growth_home REAL NOT NULL,
  avg_yoy_growth_health REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_plans (
  plan_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_date TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_plans (user_id, plan_date);

CREATE TABLE IF NOT EXISTS meeting_preps (
  prep_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  visit_id TEXT,
  narrative_json TEXT NOT NULL,
  notes TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (agency_id) REFERENCES agencies (agency_id)
);
CREATE INDEX IF NOT EXISTS idx_meeting_preps_user_agency ON meeting_preps (user_id, agency_id);

CREATE TABLE IF NOT EXISTS meeting_outcomes (
  outcome_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  outcome TEXT NOT NULL,
  notes TEXT NOT NULL,
  next_steps_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (agency_id) REFERENCES agencies (agency_id)
);
CREATE INDEX IF NOT EXISTS idx_meeting_outcomes_user_agency ON meeting_outcomes (user_id, agency_id);

CREATE TABLE IF NOT EXISTS contact_closures (
  closure_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  contact_reason TEXT NOT NULL,
  input_mode TEXT NOT NULL,
  raw_note TEXT NOT NULL,
  normalized_note TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points_json TEXT NOT NULL,
  action_items_json TEXT NOT NULL,
  next_steps_json TEXT NOT NULL,
  topics_json TEXT NOT NULL,
  department_notes_json TEXT NOT NULL,
  quality_score INTEGER NOT NULL,
  validation_status TEXT NOT NULL,
  validator_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (agency_id) REFERENCES agencies (agency_id)
);
CREATE INDEX IF NOT EXISTS idx_contact_closures_user_agency ON contact_closures (user_id, agency_id, created_at);

CREATE TABLE IF NOT EXISTS tasks (
  task_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agency_id TEXT NOT NULL,
  assignee TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  source_prep_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (agency_id) REFERENCES agencies (agency_id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  settings_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS system_ai_settings (
  settings_key TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  enabled INTEGER NOT NULL,
  model TEXT NOT NULL,
  base_url TEXT,
  api_key TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS agent_runs (
  run_id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  request_json TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  fallback_reason TEXT,
  warnings_json TEXT NOT NULL,
  response_id TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs (agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_runs (started_at);

CREATE TABLE IF NOT EXISTS agent_tool_calls (
  tool_call_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  step_no INTEGER NOT NULL,
  tool_name TEXT NOT NULL,
  arguments_json TEXT NOT NULL,
  output_json TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  duration_ms INTEGER NOT NULL,
  FOREIGN KEY (run_id) REFERENCES agent_runs (run_id)
);
CREATE INDEX IF NOT EXISTS idx_agent_tool_calls_run ON agent_tool_calls (run_id, step_no);
"""


def initialize_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(_SCHEMA_SQL)
