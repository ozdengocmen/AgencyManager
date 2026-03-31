"""SQLite implementation of repository interfaces."""

from __future__ import annotations

import json
import secrets
from datetime import date, datetime, timedelta, timezone
from functools import lru_cache
from typing import Any, cast

from backend.app.core.config import Settings, get_settings
from backend.app.db import ensure_database
from backend.app.db.sqlite import sqlite_connection
from backend.app.repositories.contracts import RepositoryGateway
from backend.app.schemas.agency import Agency, AgencyKPI, PortfolioBenchmarks
from backend.app.schemas.auth import AuthUser, SessionRecord
from backend.app.schemas.agent_api import AgentRunMetadata, AgentToolCallMetadata
from backend.app.schemas.persistence import (
    MeetingOutcomeLogRequest,
    MeetingOutcomeRecord,
    MeetingPrepRecord,
    MeetingPrepSaveRequest,
    TaskCreateInput,
    TaskRecord,
)
from backend.app.schemas.workflows import (
    DailyPlanDetail,
    MeetingPrepDetail,
    TaskUpdateRequest,
    UserSettingsResponse,
)


class SQLiteRepositoryGateway(RepositoryGateway):
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def authenticate(self, *, email: str, password: str, role: str) -> AuthUser | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT user_id, role, email, full_name, portfolio_scope
                FROM users
                WHERE lower(email) = lower(?) AND password = ? AND role = ?
                """,
                (email.strip(), password, role),
            ).fetchone()
        return _row_to_auth_user(row) if row else None

    def get_user_by_id(self, user_id: str) -> AuthUser | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT user_id, role, email, full_name, portfolio_scope
                FROM users
                WHERE user_id = ?
                """,
                (user_id,),
            ).fetchone()
        return _row_to_auth_user(row) if row else None

    def create_session(
        self,
        *,
        user: AuthUser,
        language: str,
        portfolio_scope: str,
        ttl_hours: int,
    ) -> SessionRecord:
        created_at = _utc_now()
        expires_at = created_at + timedelta(hours=max(1, ttl_hours))
        token = _new_session_token()

        with sqlite_connection(self._settings) as connection:
            connection.execute(
                """
                INSERT INTO sessions (
                  token, user_id, role, language, portfolio_scope, created_at, expires_at, revoked_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
                """,
                (
                    token,
                    user.user_id,
                    user.role,
                    language,
                    portfolio_scope,
                    created_at.isoformat(),
                    expires_at.isoformat(),
                ),
            )

        return SessionRecord(
            token=token,
            user_id=user.user_id,
            role=user.role,
            language=language,
            portfolio_scope=portfolio_scope,
            created_at=created_at,
            expires_at=expires_at,
            revoked_at=None,
        )

    def get_active_session(self, token: str) -> SessionRecord | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT token, user_id, role, language, portfolio_scope, created_at, expires_at, revoked_at
                FROM sessions
                WHERE token = ?
                """,
                (token,),
            ).fetchone()

        if not row:
            return None

        session = _row_to_session(row)
        if session.revoked_at is not None:
            return None
        if session.expires_at <= _utc_now():
            return None
        return session

    def revoke_session(self, token: str) -> bool:
        revoked_at = _utc_now().isoformat()
        with sqlite_connection(self._settings) as connection:
            result = connection.execute(
                """
                UPDATE sessions
                SET revoked_at = ?
                WHERE token = ? AND revoked_at IS NULL
                """,
                (revoked_at, token),
            )
        return result.rowcount > 0

    def list_agencies(self) -> list[Agency]:
        with sqlite_connection(self._settings) as connection:
            rows = connection.execute(
                """
                SELECT
                  agency_id, agency_name, address_text, city, district,
                  latitude, longitude, sales_owner, priority_tier,
                  target_visit_frequency, preferred_visit_time_window,
                  last_visit_date, next_recommended_visit_date
                FROM agencies
                ORDER BY agency_id
                """
            ).fetchall()
        return [Agency.model_validate(dict(row)) for row in rows]

    def get_agency(self, agency_id: str) -> Agency | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT
                  agency_id, agency_name, address_text, city, district,
                  latitude, longitude, sales_owner, priority_tier,
                  target_visit_frequency, preferred_visit_time_window,
                  last_visit_date, next_recommended_visit_date
                FROM agencies
                WHERE agency_id = ?
                """,
                (agency_id,),
            ).fetchone()
        return Agency.model_validate(dict(row)) if row else None

    def list_kpis(self) -> dict[str, AgencyKPI]:
        with sqlite_connection(self._settings) as connection:
            rows = connection.execute(
                """
                SELECT
                  agency_id, premiums_written_total, total_revenue, claims_total,
                  portfolio_concentration, renewal_rate, yoy_growth_motor,
                  yoy_growth_home, yoy_growth_health, claims_ratio,
                  overall_health_score, renewal_risk_flag,
                  growth_best_branch, growth_worst_branch
                FROM agency_kpis_latest
                ORDER BY agency_id
                """
            ).fetchall()

        result: dict[str, AgencyKPI] = {}
        for row in rows:
            payload = dict(row)
            payload["renewal_risk_flag"] = bool(payload["renewal_risk_flag"])
            model = AgencyKPI.model_validate(payload)
            result[model.agency_id] = model
        return result

    def get_kpi(self, agency_id: str) -> AgencyKPI | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT
                  agency_id, premiums_written_total, total_revenue, claims_total,
                  portfolio_concentration, renewal_rate, yoy_growth_motor,
                  yoy_growth_home, yoy_growth_health, claims_ratio,
                  overall_health_score, renewal_risk_flag,
                  growth_best_branch, growth_worst_branch
                FROM agency_kpis_latest
                WHERE agency_id = ?
                """,
                (agency_id,),
            ).fetchone()

        if not row:
            return None
        payload = dict(row)
        payload["renewal_risk_flag"] = bool(payload["renewal_risk_flag"])
        return AgencyKPI.model_validate(payload)

    def get_benchmarks(self) -> PortfolioBenchmarks:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT
                  benchmark_key, avg_renewal_rate, avg_claims_ratio,
                  avg_overall_health_score, avg_yoy_growth_motor,
                  avg_yoy_growth_home, avg_yoy_growth_health
                FROM portfolio_benchmarks
                LIMIT 1
                """
            ).fetchone()

        if not row:
            raise ValueError("Portfolio benchmarks are not seeded")
        return PortfolioBenchmarks.model_validate(dict(row))

    def create_daily_plan(
        self,
        *,
        user_id: str,
        plan_date: date,
        plan_json: dict[str, object],
        status: str = "draft",
    ) -> DailyPlanDetail:
        now = _utc_now()

        with sqlite_connection(self._settings) as connection:
            plan_id = _next_prefixed_id(connection, "daily_plans", "plan_id", "PLAN")
            connection.execute(
                """
                INSERT INTO daily_plans (
                  plan_id, user_id, plan_date, plan_json, status, created_at, updated_at, published_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    plan_id,
                    user_id,
                    plan_date.isoformat(),
                    _to_json(plan_json),
                    status,
                    now.isoformat(),
                    now.isoformat(),
                    now.isoformat() if status == "published" else None,
                ),
            )
            row = connection.execute(
                "SELECT * FROM daily_plans WHERE plan_id = ?",
                (plan_id,),
            ).fetchone()

        if not row:
            raise ValueError("Failed to create daily plan")
        return _row_to_daily_plan_detail(row)

    def update_daily_plan(
        self,
        *,
        plan_id: str,
        user_id: str,
        plan_json: dict[str, object] | None = None,
    ) -> DailyPlanDetail | None:
        with sqlite_connection(self._settings) as connection:
            existing = connection.execute(
                "SELECT * FROM daily_plans WHERE plan_id = ? AND user_id = ?",
                (plan_id, user_id),
            ).fetchone()
            if not existing:
                return None

            next_plan_json = plan_json if plan_json is not None else _from_json(existing["plan_json"])
            connection.execute(
                """
                UPDATE daily_plans
                SET plan_json = ?, updated_at = ?
                WHERE plan_id = ? AND user_id = ?
                """,
                (
                    _to_json(next_plan_json),
                    _utc_now().isoformat(),
                    plan_id,
                    user_id,
                ),
            )
            row = connection.execute(
                "SELECT * FROM daily_plans WHERE plan_id = ? AND user_id = ?",
                (plan_id, user_id),
            ).fetchone()

        return _row_to_daily_plan_detail(row) if row else None

    def get_current_daily_plan(self, *, user_id: str, plan_date: date) -> DailyPlanDetail | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT *
                FROM daily_plans
                WHERE user_id = ? AND plan_date = ?
                ORDER BY updated_at DESC
                LIMIT 1
                """,
                (user_id, plan_date.isoformat()),
            ).fetchone()

        return _row_to_daily_plan_detail(row) if row else None

    def publish_daily_plan(self, *, plan_id: str, user_id: str) -> DailyPlanDetail | None:
        now = _utc_now().isoformat()
        with sqlite_connection(self._settings) as connection:
            updated = connection.execute(
                """
                UPDATE daily_plans
                SET status = 'published', updated_at = ?, published_at = ?
                WHERE plan_id = ? AND user_id = ?
                """,
                (now, now, plan_id, user_id),
            )
            if updated.rowcount < 1:
                return None
            row = connection.execute(
                "SELECT * FROM daily_plans WHERE plan_id = ? AND user_id = ?",
                (plan_id, user_id),
            ).fetchone()

        return _row_to_daily_plan_detail(row) if row else None

    def create_meeting_prep(self, payload: MeetingPrepSaveRequest) -> MeetingPrepRecord:
        detail = self._insert_meeting_prep(payload=payload, status="final")
        return MeetingPrepRecord(
            prep_id=detail.prep_id,
            user_id=detail.user_id,
            agency_id=detail.agency_id,
            narrative_json=detail.narrative_json,
            visit_id=detail.visit_id,
            notes=detail.notes,
            created_at=detail.created_at,
        )

    def create_meeting_prep_draft(self, payload: MeetingPrepSaveRequest) -> MeetingPrepDetail:
        return self._insert_meeting_prep(payload=payload, status="draft")

    def update_meeting_prep(
        self,
        *,
        prep_id: str,
        user_id: str,
        narrative_json: dict[str, object] | None = None,
        notes: str | None = None,
        status: str | None = None,
    ) -> MeetingPrepDetail | None:
        with sqlite_connection(self._settings) as connection:
            where = "prep_id = ?"
            args: list[Any] = [prep_id]
            if user_id != "manager":
                where += " AND user_id = ?"
                args.append(user_id)

            existing = connection.execute(
                f"SELECT * FROM meeting_preps WHERE {where}",
                tuple(args),
            ).fetchone()
            if not existing:
                return None

            next_narrative = (
                narrative_json if narrative_json is not None else _from_json(existing["narrative_json"])
            )
            next_notes = notes if notes is not None else str(existing["notes"])
            next_status = status if status is not None else str(existing["status"])

            connection.execute(
                f"""
                UPDATE meeting_preps
                SET narrative_json = ?, notes = ?, status = ?, updated_at = ?
                WHERE {where}
                """,
                (
                    _to_json(next_narrative),
                    next_notes,
                    next_status,
                    _utc_now().isoformat(),
                    *args,
                ),
            )
            row = connection.execute(
                f"SELECT * FROM meeting_preps WHERE {where}",
                tuple(args),
            ).fetchone()

        return _row_to_meeting_prep_detail(row) if row else None

    def list_meeting_preps(self, *, user_id: str, agency_id: str | None = None) -> list[MeetingPrepDetail]:
        where_clauses = ["1 = 1"]
        args: list[Any] = []
        if user_id != "manager":
            where_clauses.append("user_id = ?")
            args.append(user_id)
        if agency_id:
            where_clauses.append("agency_id = ?")
            args.append(agency_id)

        where = " AND ".join(where_clauses)
        with sqlite_connection(self._settings) as connection:
            rows = connection.execute(
                f"""
                SELECT *
                FROM meeting_preps
                WHERE {where}
                ORDER BY updated_at DESC
                """,
                tuple(args),
            ).fetchall()

        return [_row_to_meeting_prep_detail(row) for row in rows]

    def log_meeting_outcome(self, payload: MeetingOutcomeLogRequest) -> MeetingOutcomeRecord:
        now = _utc_now()
        user_id = payload.user_id
        with sqlite_connection(self._settings) as connection:
            outcome_id = _next_prefixed_id(connection, "meeting_outcomes", "outcome_id", "OUTCOME")
            connection.execute(
                """
                INSERT INTO meeting_outcomes (
                  outcome_id, user_id, agency_id, outcome, notes, next_steps_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    outcome_id,
                    user_id,
                    payload.agency_id,
                    payload.outcome,
                    payload.notes,
                    _to_json(payload.next_steps),
                    now.isoformat(),
                ),
            )

        return MeetingOutcomeRecord(
            outcome_id=outcome_id,
            user_id=user_id,
            agency_id=payload.agency_id,
            outcome=payload.outcome,
            notes=payload.notes,
            next_steps=list(payload.next_steps),
            created_at=now,
        )

    def create_tasks(
        self,
        *,
        user_id: str,
        tasks: list[TaskCreateInput],
        source_prep_id: str | None = None,
    ) -> list[TaskRecord]:
        now = _utc_now()
        created: list[TaskRecord] = []

        with sqlite_connection(self._settings) as connection:
            for payload in tasks:
                task_id = _next_prefixed_id(connection, "tasks", "task_id", "TASK")
                status = payload.status
                completed_at = now.isoformat() if status == "completed" else None

                connection.execute(
                    """
                    INSERT INTO tasks (
                      task_id, user_id, agency_id, assignee, title, description, due_date,
                      priority, status, source_prep_id, created_at, updated_at, completed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        task_id,
                        user_id,
                        payload.agency_id,
                        payload.assignee,
                        payload.title,
                        payload.description,
                        payload.due_date.isoformat(),
                        payload.priority,
                        status,
                        source_prep_id,
                        now.isoformat(),
                        now.isoformat(),
                        completed_at,
                    ),
                )
                created.append(
                    TaskRecord(
                        task_id=task_id,
                        agency_id=payload.agency_id,
                        assignee=cast(Any, payload.assignee),
                        title=payload.title,
                        description=payload.description,
                        due_date=payload.due_date,
                        priority=cast(Any, payload.priority),
                        status=cast(Any, payload.status),
                        created_at=now,
                    )
                )

        return created

    def list_tasks(
        self,
        *,
        user_id: str,
        assignee: str | None = None,
        status: str | None = None,
        agency_id: str | None = None,
    ) -> list[TaskRecord]:
        where = ["1 = 1"]
        args: list[Any] = []

        if user_id != "manager":
            where.append("assignee = ?")
            args.append(user_id)
        elif assignee:
            where.append("assignee = ?")
            args.append(assignee)

        if status:
            where.append("status = ?")
            args.append(status)
        if agency_id:
            where.append("agency_id = ?")
            args.append(agency_id)

        with sqlite_connection(self._settings) as connection:
            rows = connection.execute(
                f"""
                SELECT
                  task_id, agency_id, assignee, title, description,
                  due_date, priority, status, created_at
                FROM tasks
                WHERE {' AND '.join(where)}
                ORDER BY due_date ASC, created_at DESC
                """,
                tuple(args),
            ).fetchall()

        return [
            TaskRecord.model_validate(
                {
                    **dict(row),
                    "due_date": str(row["due_date"]),
                    "created_at": str(row["created_at"]),
                }
            )
            for row in rows
        ]

    def update_task(
        self,
        *,
        user_id: str,
        task_id: str,
        patch: TaskUpdateRequest,
    ) -> TaskRecord | None:
        with sqlite_connection(self._settings) as connection:
            where = "task_id = ?"
            args: list[Any] = [task_id]
            if user_id != "manager":
                where += " AND assignee = ?"
                args.append(user_id)

            row = connection.execute(f"SELECT * FROM tasks WHERE {where}", tuple(args)).fetchone()
            if not row:
                return None

            next_title = patch.title if patch.title is not None else str(row["title"])
            next_description = patch.description if patch.description is not None else str(row["description"])
            next_due_date = patch.due_date.isoformat() if patch.due_date else str(row["due_date"])
            next_priority = patch.priority if patch.priority is not None else str(row["priority"])
            next_status = patch.status if patch.status is not None else str(row["status"])
            completed_at: str | None
            if next_status == "completed":
                completed_at = str(row["completed_at"]) if row["completed_at"] else _utc_now().isoformat()
            else:
                completed_at = None

            connection.execute(
                f"""
                UPDATE tasks
                SET title = ?, description = ?, due_date = ?, priority = ?, status = ?,
                    updated_at = ?, completed_at = ?
                WHERE {where}
                """,
                (
                    next_title,
                    next_description,
                    next_due_date,
                    next_priority,
                    next_status,
                    _utc_now().isoformat(),
                    completed_at,
                    *args,
                ),
            )

            updated = connection.execute(
                """
                SELECT
                  task_id, agency_id, assignee, title, description,
                  due_date, priority, status, created_at
                FROM tasks
                WHERE task_id = ?
                """,
                (task_id,),
            ).fetchone()

        if not updated:
            return None
        return TaskRecord.model_validate(
            {
                **dict(updated),
                "due_date": str(updated["due_date"]),
                "created_at": str(updated["created_at"]),
            }
        )

    def complete_task(self, *, user_id: str, task_id: str) -> TaskRecord | None:
        return self.update_task(
            user_id=user_id,
            task_id=task_id,
            patch=TaskUpdateRequest(status="completed"),
        )

    def get_settings(self, user_id: str) -> UserSettingsResponse:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                "SELECT user_id, settings_json, updated_at FROM user_settings WHERE user_id = ?",
                (user_id,),
            ).fetchone()

        if not row:
            raise KeyError(f"Settings not found for user '{user_id}'")
        return UserSettingsResponse(
            user_id=cast(Any, row["user_id"]),
            settings_json=_from_json(str(row["settings_json"])),
            updated_at=_to_datetime(str(row["updated_at"])),
        )

    def update_settings(self, user_id: str, settings_json: dict[str, object]) -> UserSettingsResponse:
        now = _utc_now().isoformat()
        with sqlite_connection(self._settings) as connection:
            connection.execute(
                """
                INSERT INTO user_settings (user_id, settings_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                  settings_json = excluded.settings_json,
                  updated_at = excluded.updated_at
                """,
                (user_id, _to_json(settings_json), now),
            )
            row = connection.execute(
                "SELECT user_id, settings_json, updated_at FROM user_settings WHERE user_id = ?",
                (user_id,),
            ).fetchone()

        if not row:
            raise ValueError("Failed to persist settings")

        return UserSettingsResponse(
            user_id=cast(Any, row["user_id"]),
            settings_json=_from_json(str(row["settings_json"])),
            updated_at=_to_datetime(str(row["updated_at"])),
        )

    def create_agent_run(
        self,
        *,
        agent_name: str,
        request_json: dict[str, object],
        provider: str,
        model: str,
        status: str,
        started_at: str,
    ) -> str:
        with sqlite_connection(self._settings) as connection:
            run_id = _next_prefixed_id(connection, "agent_runs", "run_id", "RUN")
            connection.execute(
                """
                INSERT INTO agent_runs (
                  run_id, agent_name, request_json, provider, model, status,
                  fallback_reason, warnings_json, response_id, started_at, ended_at
                ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, NULL)
                """,
                (
                    run_id,
                    agent_name,
                    _to_json(request_json),
                    provider,
                    model,
                    status,
                    _to_json([]),
                    started_at,
                ),
            )
        return run_id

    def update_agent_run(
        self,
        *,
        run_id: str,
        provider: str,
        model: str,
        status: str,
        fallback_reason: str | None,
        warnings: list[str],
        response_id: str | None,
        ended_at: str,
    ) -> None:
        with sqlite_connection(self._settings) as connection:
            connection.execute(
                """
                UPDATE agent_runs
                SET provider = ?, model = ?, status = ?, fallback_reason = ?,
                    warnings_json = ?, response_id = ?, ended_at = ?
                WHERE run_id = ?
                """,
                (
                    provider,
                    model,
                    status,
                    fallback_reason,
                    _to_json(warnings),
                    response_id,
                    ended_at,
                    run_id,
                ),
            )

    def create_agent_tool_call(
        self,
        *,
        run_id: str,
        step_no: int,
        tool_name: str,
        arguments_json: dict[str, object],
        output_json: dict[str, object],
        status: str,
        error: str | None,
        duration_ms: int,
    ) -> None:
        with sqlite_connection(self._settings) as connection:
            tool_call_id = _next_prefixed_id(connection, "agent_tool_calls", "tool_call_id", "TCALL")
            connection.execute(
                """
                INSERT INTO agent_tool_calls (
                  tool_call_id, run_id, step_no, tool_name, arguments_json,
                  output_json, status, error, duration_ms
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    tool_call_id,
                    run_id,
                    step_no,
                    tool_name,
                    _to_json(arguments_json),
                    _to_json(output_json),
                    status,
                    error,
                    max(0, duration_ms),
                ),
            )

    def get_agent_run(self, run_id: str) -> AgentRunMetadata | None:
        with sqlite_connection(self._settings) as connection:
            row = connection.execute(
                """
                SELECT
                  run_id, agent_name, request_json, provider, model, status, fallback_reason,
                  warnings_json, response_id, started_at, ended_at
                FROM agent_runs
                WHERE run_id = ?
                """,
                (run_id,),
            ).fetchone()

        if not row:
            return None
        return AgentRunMetadata(
            run_id=str(row["run_id"]),
            agent_name=str(row["agent_name"]),
            request_json=_from_json(str(row["request_json"])),
            provider=str(row["provider"]),
            model=str(row["model"]),
            status=str(row["status"]),
            fallback_reason=str(row["fallback_reason"]) if row["fallback_reason"] else None,
            warnings=_from_json_list_of_strings(str(row["warnings_json"])),
            response_id=str(row["response_id"]) if row["response_id"] else None,
            started_at=_to_datetime(str(row["started_at"])),
            ended_at=_to_datetime(str(row["ended_at"])) if row["ended_at"] else None,
        )

    def list_agent_tool_calls(self, run_id: str) -> list[AgentToolCallMetadata]:
        with sqlite_connection(self._settings) as connection:
            rows = connection.execute(
                """
                SELECT run_id, step_no, tool_name, arguments_json, output_json, status, error, duration_ms
                FROM agent_tool_calls
                WHERE run_id = ?
                ORDER BY step_no ASC
                """,
                (run_id,),
            ).fetchall()

        return [
            AgentToolCallMetadata(
                run_id=str(row["run_id"]),
                step_no=int(row["step_no"]),
                tool_name=str(row["tool_name"]),
                arguments_json=_from_json(str(row["arguments_json"])),
                output_json=_from_json(str(row["output_json"])),
                status=str(row["status"]),
                error=str(row["error"]) if row["error"] else None,
                duration_ms=int(row["duration_ms"]),
            )
            for row in rows
        ]

    def _insert_meeting_prep(
        self,
        *,
        payload: MeetingPrepSaveRequest,
        status: str,
    ) -> MeetingPrepDetail:
        now = _utc_now()
        with sqlite_connection(self._settings) as connection:
            prep_id = _next_prefixed_id(connection, "meeting_preps", "prep_id", "PREP")
            connection.execute(
                """
                INSERT INTO meeting_preps (
                  prep_id, user_id, agency_id, visit_id, narrative_json, notes, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    prep_id,
                    payload.user_id,
                    payload.agency_id,
                    payload.visit_id,
                    _to_json(payload.narrative_json),
                    payload.notes,
                    status,
                    now.isoformat(),
                    now.isoformat(),
                ),
            )
            row = connection.execute(
                "SELECT * FROM meeting_preps WHERE prep_id = ?",
                (prep_id,),
            ).fetchone()

        if not row:
            raise ValueError("Failed to create meeting prep")
        return _row_to_meeting_prep_detail(row)


@lru_cache
def get_repository_gateway() -> SQLiteRepositoryGateway:
    ensure_database()
    return SQLiteRepositoryGateway()


def _row_to_auth_user(row: Any) -> AuthUser:
    return AuthUser(
        user_id=cast(Any, row["user_id"]),
        role=cast(Any, row["role"]),
        email=str(row["email"]),
        full_name=str(row["full_name"]),
        portfolio_scope=str(row["portfolio_scope"]),
    )


def _row_to_session(row: Any) -> SessionRecord:
    return SessionRecord(
        token=str(row["token"]),
        user_id=cast(Any, row["user_id"]),
        role=cast(Any, row["role"]),
        language=str(row["language"]),
        portfolio_scope=str(row["portfolio_scope"]),
        created_at=_to_datetime(str(row["created_at"])),
        expires_at=_to_datetime(str(row["expires_at"])),
        revoked_at=_to_datetime(str(row["revoked_at"])) if row["revoked_at"] else None,
    )


def _row_to_daily_plan_detail(row: Any) -> DailyPlanDetail:
    return DailyPlanDetail(
        plan_id=str(row["plan_id"]),
        user_id=cast(Any, row["user_id"]),
        plan_date=date.fromisoformat(str(row["plan_date"])),
        plan_json=_from_json(str(row["plan_json"])),
        status=cast(Any, row["status"]),
        created_at=_to_datetime(str(row["created_at"])),
        updated_at=_to_datetime(str(row["updated_at"])),
        published_at=_to_datetime(str(row["published_at"])) if row["published_at"] else None,
    )


def _row_to_meeting_prep_detail(row: Any) -> MeetingPrepDetail:
    return MeetingPrepDetail(
        prep_id=str(row["prep_id"]),
        user_id=cast(Any, row["user_id"]),
        agency_id=str(row["agency_id"]),
        visit_id=str(row["visit_id"]) if row["visit_id"] else None,
        narrative_json=_from_json(str(row["narrative_json"])),
        notes=str(row["notes"]),
        status=cast(Any, row["status"]),
        created_at=_to_datetime(str(row["created_at"])),
        updated_at=_to_datetime(str(row["updated_at"])),
    )


def _to_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _to_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True)


def _from_json(value: str) -> dict[str, object]:
    loaded = json.loads(value)
    if isinstance(loaded, dict):
        return cast(dict[str, object], loaded)
    raise ValueError("Expected JSON object payload")


def _from_json_list_of_strings(value: str) -> list[str]:
    loaded = json.loads(value)
    if not isinstance(loaded, list):
        return []
    return [str(item) for item in loaded]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _new_session_token() -> str:
    return f"sess_{secrets.token_urlsafe(24)}"


def _next_prefixed_id(connection: Any, table: str, column: str, prefix: str) -> str:
    row = connection.execute(
        f"SELECT {column} FROM {table} WHERE {column} LIKE ? ORDER BY {column} DESC LIMIT 1",
        (f"{prefix}-%",),
    ).fetchone()
    if not row:
        return f"{prefix}-0001"

    raw = str(row[column])
    if "-" not in raw:
        return f"{prefix}-0001"
    suffix = raw.rsplit("-", maxsplit=1)[-1]
    if not suffix.isdigit():
        return f"{prefix}-0001"
    return f"{prefix}-{int(suffix) + 1:04d}"
