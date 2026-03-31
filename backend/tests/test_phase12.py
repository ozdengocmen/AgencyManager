"""Phase 12 coverage for agent traceability and tool-policy signaling."""

from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.agents.meeting_prep_fallback import generate_local_meeting_narrative
from backend.app.agents.meeting_prep_orchestrator import MeetingPrepOrchestrator
from backend.app.core.config import Settings, get_settings
from backend.app.db.bootstrap import reset_database
from backend.app.main import create_app
from backend.app.repositories import get_repository_gateway
from backend.app.schemas.agent_api import MeetingPrepRequest
from backend.app.services.agent_trace import AgentPolicyError


class Phase12TraceabilityTests(unittest.TestCase):
    def setUp(self) -> None:
        self._original_openai_api_key = os.environ.get("OPENAI_API_KEY")
        self._original_openai_base_url = os.environ.get("OPENAI_BASE_URL")
        os.environ["OPENAI_API_KEY"] = ""
        os.environ["OPENAI_BASE_URL"] = ""
        get_settings.cache_clear()

        reset_database()
        get_repository_gateway.cache_clear()
        self.repository = get_repository_gateway()
        self.client = TestClient(
            create_app(
                Settings(
                    app_db_path="backend/app/data/agencymanager.db",
                    openai_api_key="",
                    openai_base_url=None,
                    openai_model="gpt-4.1-mini",
                )
            )
        )

    def tearDown(self) -> None:
        if self._original_openai_api_key is None:
            os.environ.pop("OPENAI_API_KEY", None)
        else:
            os.environ["OPENAI_API_KEY"] = self._original_openai_api_key

        if self._original_openai_base_url is None:
            os.environ.pop("OPENAI_BASE_URL", None)
        else:
            os.environ["OPENAI_BASE_URL"] = self._original_openai_base_url
        get_settings.cache_clear()

    def test_meeting_prep_includes_run_id_trace_and_evidence(self) -> None:
        response = self.client.post(
            "/api/agent/meeting-prep",
            json={"agency_id": "AG001", "language": "en", "save_result": False},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()

        run_id = payload["run_id"]
        self.assertTrue(run_id.startswith("RUN-"))
        self.assertEqual(payload["trace_summary"]["run_id"], run_id)
        self.assertGreaterEqual(len(payload["trace_summary"]["events"]), 1)

        metric_keys = [item["metric_key"] for item in payload["narrative"]["metric_quotes"]]
        for metric_key in metric_keys:
            self.assertIn(metric_key, payload["evidence_map"])
            self.assertGreaterEqual(len(payload["evidence_map"][metric_key]), 1)

        run_response = self.client.get(f"/api/agent/runs/{run_id}")
        self.assertEqual(run_response.status_code, 200)
        run_payload = run_response.json()
        self.assertEqual(run_payload["run"]["run_id"], run_id)

    def test_daily_plan_returns_run_id_and_trace_lookup(self) -> None:
        response = self.client.post(
            "/api/agent/daily-plan",
            json={"language": "en", "save_result": False, "max_visits": 4},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["run_id"].startswith("RUN-"))

        run_response = self.client.get(f"/api/agent/runs/{payload['run_id']}")
        self.assertEqual(run_response.status_code, 200)
        run_payload = run_response.json()
        self.assertEqual(run_payload["run"]["agent_name"], "daily-plan")

    def test_tool_policy_violation_returns_explicit_code(self) -> None:
        with patch.object(
            MeetingPrepOrchestrator,
            "_enforce_tool_policy",
            side_effect=AgentPolicyError(
                code="AGENT_TOOL_POLICY_MEETING_PREP",
                message="Meeting prep tool policy violation",
            ),
        ):
            response = self.client.post(
                "/api/agent/meeting-prep",
                json={"agency_id": "AG001", "save_result": False},
            )

        self.assertEqual(response.status_code, 422)
        payload = response.json()
        self.assertEqual(payload["detail"]["code"], "AGENT_TOOL_POLICY_MEETING_PREP")

    def test_openai_and_fallback_runs_are_persisted(self) -> None:
        fallback_response = self.client.post(
            "/api/agent/meeting-prep",
            json={"agency_id": "AG001", "language": "en", "save_result": False},
        )
        self.assertEqual(fallback_response.status_code, 200)
        fallback_run = self.repository.get_agent_run(fallback_response.json()["run_id"])
        self.assertIsNotNone(fallback_run)
        assert fallback_run is not None
        self.assertEqual(fallback_run.provider, "local-fallback")

        request = MeetingPrepRequest(agency_id="AG001", save_result=False, language="en")
        openai_narrative, _ = generate_local_meeting_narrative(request)
        orchestrator = MeetingPrepOrchestrator(
            Settings(
                app_db_path="backend/app/data/agencymanager.db",
                openai_api_key="dummy-openai-key",
                openai_model="gpt-4.1-mini",
            )
        )

        with patch.object(
            MeetingPrepOrchestrator,
            "_generate_with_openai",
            return_value=(
                openai_narrative,
                ["get_agency_profile", "get_portfolio_summary"],
                "resp_phase12_openai",
            ),
        ):
            openai_result = orchestrator.generate(request)

        openai_run = self.repository.get_agent_run(openai_result.run_id)
        self.assertIsNotNone(openai_run)
        assert openai_run is not None
        self.assertEqual(openai_run.provider, "openai")
        self.assertEqual(openai_run.response_id, "resp_phase12_openai")


if __name__ == "__main__":
    unittest.main()
