"""Seed utilities for the local SQLite PoC database."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone

from backend.app.data.mock_data import AGENCY_ROWS, KPI_ROWS, PORTFOLIO_BENCHMARKS

_DEFAULT_USERS = [
    {
        "user_id": "salesperson",
        "role": "salesperson",
        "email": "john.smith@company.com",
        "full_name": "John Smith",
        "password": "password",
        "portfolio_scope": "john-smith",
    },
    {
        "user_id": "manager",
        "role": "manager",
        "email": "ayse.demir@company.com",
        "full_name": "Ayse Demir",
        "password": "manager123",
        "portfolio_scope": "all",
    },
]

_DEFAULT_SETTINGS = {
    "language": "en",
    "defaultTone": "consultative",
    "maxVisitsPerDay": 5,
    "maxTravelHours": 4,
    "avgVisitMinutes": 45,
    "startLocation": "office",
    "startTime": "09:00",
    "endTime": "17:00",
    "includeBenchmarks": True,
    "autoGenerateMeetingNotes": True,
    "priorityNotifications": True,
    "visitReminders": True,
    "taskDueAlerts": True,
    "performanceAlerts": False,
}


def seed_reference_data(connection: sqlite3.Connection, force: bool = False) -> None:
    cursor = connection.cursor()

    agency_count = cursor.execute("SELECT COUNT(*) FROM agencies").fetchone()[0]
    should_seed_reference = force or agency_count == 0
    if should_seed_reference:
        cursor.execute("DELETE FROM agency_kpis_latest")
        cursor.execute("DELETE FROM agencies")
        cursor.execute("DELETE FROM portfolio_benchmarks")

        cursor.executemany(
            """
            INSERT INTO agencies (
              agency_id, agency_name, address_text, city, district, latitude, longitude,
              sales_owner, priority_tier, target_visit_frequency, preferred_visit_time_window,
              last_visit_date, next_recommended_visit_date
            ) VALUES (
              :agency_id, :agency_name, :address_text, :city, :district, :latitude, :longitude,
              :sales_owner, :priority_tier, :target_visit_frequency, :preferred_visit_time_window,
              :last_visit_date, :next_recommended_visit_date
            )
            """,
            AGENCY_ROWS,
        )

        kpi_rows = [
            {
                **row,
                "renewal_risk_flag": 1 if bool(row["renewal_risk_flag"]) else 0,
            }
            for row in KPI_ROWS.values()
        ]
        cursor.executemany(
            """
            INSERT INTO agency_kpis_latest (
              agency_id, premiums_written_total, total_revenue, claims_total,
              portfolio_concentration, renewal_rate, yoy_growth_motor, yoy_growth_home,
              yoy_growth_health, claims_ratio, overall_health_score, renewal_risk_flag,
              growth_best_branch, growth_worst_branch
            ) VALUES (
              :agency_id, :premiums_written_total, :total_revenue, :claims_total,
              :portfolio_concentration, :renewal_rate, :yoy_growth_motor, :yoy_growth_home,
              :yoy_growth_health, :claims_ratio, :overall_health_score, :renewal_risk_flag,
              :growth_best_branch, :growth_worst_branch
            )
            """,
            kpi_rows,
        )

        cursor.execute(
            """
            INSERT INTO portfolio_benchmarks (
              benchmark_key, avg_renewal_rate, avg_claims_ratio, avg_overall_health_score,
              avg_yoy_growth_motor, avg_yoy_growth_home, avg_yoy_growth_health
            ) VALUES (
              :benchmark_key, :avg_renewal_rate, :avg_claims_ratio, :avg_overall_health_score,
              :avg_yoy_growth_motor, :avg_yoy_growth_home, :avg_yoy_growth_health
            )
            """,
            PORTFOLIO_BENCHMARKS,
        )

    user_count = cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if force or user_count == 0:
        cursor.execute("DELETE FROM sessions")
        cursor.execute("DELETE FROM user_settings")
        cursor.execute("DELETE FROM users")
        cursor.executemany(
            """
            INSERT INTO users (user_id, role, email, full_name, password, portfolio_scope)
            VALUES (:user_id, :role, :email, :full_name, :password, :portfolio_scope)
            """,
            _DEFAULT_USERS,
        )
        now = _utc_now()
        for user in _DEFAULT_USERS:
            cursor.execute(
                """
                INSERT INTO user_settings (user_id, settings_json, updated_at)
                VALUES (?, ?, ?)
                """,
                (user["user_id"], json.dumps(_DEFAULT_SETTINGS, ensure_ascii=True), now),
            )


def reset_demo_data(connection: sqlite3.Connection) -> None:
    cursor = connection.cursor()
    cursor.execute("DELETE FROM agent_tool_calls")
    cursor.execute("DELETE FROM agent_runs")
    cursor.execute("DELETE FROM sessions")
    cursor.execute("DELETE FROM meeting_outcomes")
    cursor.execute("DELETE FROM tasks")
    cursor.execute("DELETE FROM meeting_preps")
    cursor.execute("DELETE FROM daily_plans")
    cursor.execute("DELETE FROM user_settings")
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM agency_kpis_latest")
    cursor.execute("DELETE FROM agencies")
    cursor.execute("DELETE FROM portfolio_benchmarks")
    seed_reference_data(connection, force=True)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()
