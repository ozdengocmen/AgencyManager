"""Phase 13 coverage for meeting-flow backend assistance stubs."""

from __future__ import annotations

import os
import unittest

from fastapi.testclient import TestClient

from backend.app.core.config import Settings, get_settings
from backend.app.db.bootstrap import reset_database
from backend.app.main import create_app
from backend.app.repositories import get_repository_gateway
from backend.app.services.workflow_store import get_workflow_store


class Phase13MeetingFlowBackendTests(unittest.TestCase):
    def setUp(self) -> None:
        self._original_openai_api_key = os.environ.get("OPENAI_API_KEY")
        self._original_openai_base_url = os.environ.get("OPENAI_BASE_URL")
        os.environ["OPENAI_API_KEY"] = ""
        os.environ["OPENAI_BASE_URL"] = ""
        get_settings.cache_clear()

        reset_database()
        get_repository_gateway.cache_clear()
        get_workflow_store.cache_clear()

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

    def test_meeting_prep_includes_structured_recommendation_fields(self) -> None:
        response = self.client.post(
            "/api/agent/meeting-prep",
            json={"agency_id": "AG001", "language": "en", "save_result": False},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        recommendations = payload["narrative"]["recommendations"]
        self.assertGreaterEqual(len(recommendations), 1)

        for item in recommendations:
            self.assertIn("rationale", item)
            self.assertIn("expected_kpi", item)
            self.assertIn("expected_window_days", item)
            self.assertIn("confidence", item)
            self.assertGreaterEqual(item["confidence"], 0.0)
            self.assertLessEqual(item["confidence"], 1.0)

    def test_post_meeting_review_saves_linked_report_and_outcomes(self) -> None:
        meeting_id = "MEET-AG001-PH3"
        response = self.client.post(
            "/api/agent/post-meeting-review",
            json={
                "agency_id": "AG001",
                "meeting_id": meeting_id,
                "language": "en",
                "report_summary": "Renewal and claim controls were reviewed with explicit owners.",
                "commitments": [
                    "Weekly renewal tracking was accepted by the agency.",
                    "Claims review checkpoint will run every Friday.",
                ],
                "recommendations": [
                    {
                        "recommendation_id": "REC-PH3-01",
                        "text": "Track high-risk renewal cases weekly and escalate unresolved items fast.",
                        "rationale": "Renewal retention requires tighter cadence and quick escalation.",
                        "expected_kpi": "renewal_rate",
                        "expected_window_days": 30,
                        "confidence": 0.78,
                        "decision": "accepted",
                    },
                    {
                        "recommendation_id": "REC-PH3-02",
                        "text": "Strengthen claim-segment controls in underwriting and pricing review loops.",
                        "rationale": "Claim drift is reduced when controls are enforced per segment.",
                        "expected_kpi": "claims_ratio",
                        "expected_window_days": 30,
                        "confidence": 0.71,
                        "decision": "modified",
                    },
                ],
                "save_result": True,
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()

        analysis = payload["analysis"]
        self.assertEqual(analysis["meeting_id"], meeting_id)
        self.assertGreaterEqual(len(analysis["comparisons"]), 1)
        self.assertEqual(len(analysis["comparisons"]), len(analysis["outcomes"]))

        saved_report_id = payload["saved_report_id"]
        self.assertIsNotNone(saved_report_id)
        self.assertEqual(len(payload["saved_outcome_ids"]), len(analysis["outcomes"]))
        self.assertEqual(
            len(payload["saved_recommendation_decision_ids"]),
            len(analysis["comparisons"]),
        )
        for item in analysis["outcomes"]:
            self.assertEqual(item["linked_report_id"], analysis["report_id"])

        store = get_workflow_store()
        reports = store.list_post_meeting_reports(meeting_id=meeting_id, agency_id="AG001")
        outcomes = store.list_recommendation_outcomes(meeting_id=meeting_id, agency_id="AG001")
        decisions = store.list_recommendation_decisions(meeting_id=meeting_id, agency_id="AG001")
        self.assertEqual(len(reports), 1)
        self.assertEqual(len(outcomes), len(analysis["outcomes"]))
        self.assertEqual(len(decisions), len(analysis["comparisons"]))
        self.assertEqual(reports[0].report_id, saved_report_id)

    def test_post_meeting_fallback_is_deterministic_for_same_payload(self) -> None:
        request_payload = {
            "agency_id": "AG002",
            "meeting_id": "MEET-AG002-DETERMINISTIC",
            "language": "en",
            "report_summary": "Renewal actions were discussed but no claim follow-up owner was assigned.",
            "commitments": ["Renewal list to be reviewed every Monday."],
            "deviations": ["Claims follow-up owner missing in the final recap."],
            "save_result": False,
        }
        first = self.client.post("/api/agent/post-meeting-review", json=request_payload)
        second = self.client.post("/api/agent/post-meeting-review", json=request_payload)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)

        first_payload = first.json()
        second_payload = second.json()
        self.assertEqual(first_payload["provider"], "local-fallback")
        self.assertEqual(second_payload["provider"], "local-fallback")
        self.assertEqual(
            first_payload["analysis"]["comparisons"],
            second_payload["analysis"]["comparisons"],
        )
        self.assertEqual(
            first_payload["analysis"]["outcomes"],
            second_payload["analysis"]["outcomes"],
        )
        self.assertEqual(
            first_payload["analysis"]["consistency_summary"],
            second_payload["analysis"]["consistency_summary"],
        )

    def test_contract_catalog_includes_post_meeting_analysis(self) -> None:
        response = self.client.get("/api/agent/contracts")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("PostMeetingAnalysis", payload["contracts"])


if __name__ == "__main__":
    unittest.main()
