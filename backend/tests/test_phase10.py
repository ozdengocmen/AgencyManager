"""Phase 10 coverage for auth/session, repository CRUD, authz, and seed consistency."""

from __future__ import annotations

import unittest
from datetime import date

from fastapi.testclient import TestClient

from backend.app.db.bootstrap import reset_database
from backend.app.main import create_app
from backend.app.repositories import get_repository_gateway
from backend.app.tools.data_access import list_agencies


class Phase10IntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        reset_database()
        get_repository_gateway.cache_clear()
        self.repository = get_repository_gateway()
        self.client = TestClient(create_app())

    def test_auth_session_lifecycle(self) -> None:
        login_response = self.client.post(
            "/api/auth/login",
            json={
                "email": "john.smith@company.com",
                "password": "password",
                "role": "salesperson",
                "language": "en",
            },
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        me_response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["user"]["user_id"], "salesperson")

        logout_response = self.client.post("/api/auth/logout", headers=headers)
        self.assertEqual(logout_response.status_code, 200)

        me_after_logout = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_after_logout.status_code, 401)

    def test_repository_crud_and_status_updates(self) -> None:
        plan = self.repository.create_daily_plan(
            user_id="salesperson",
            plan_date=date(2026, 3, 7),
            plan_json={"visits": [{"agency_id": "AG001"}]},
        )
        self.assertTrue(plan.plan_id.startswith("PLAN-"))

        updated = self.repository.update_daily_plan(
            plan_id=plan.plan_id,
            user_id="salesperson",
            plan_json={"visits": [{"agency_id": "AG002"}]},
        )
        self.assertIsNotNone(updated)
        assert updated is not None
        self.assertEqual(updated.plan_json["visits"][0]["agency_id"], "AG002")

        published = self.repository.publish_daily_plan(plan_id=plan.plan_id, user_id="salesperson")
        self.assertIsNotNone(published)
        assert published is not None
        self.assertEqual(published.status, "published")

    def test_route_level_authorization_and_validation(self) -> None:
        unauthorized = self.client.get("/api/workflows/tasks")
        self.assertEqual(unauthorized.status_code, 401)

        login_response = self.client.post(
            "/api/auth/login",
            json={
                "email": "john.smith@company.com",
                "password": "password",
                "role": "salesperson",
                "language": "en",
            },
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        invalid = self.client.post(
            "/api/workflows/tasks",
            headers=headers,
            json={"tasks": []},
        )
        self.assertEqual(invalid.status_code, 422)

    def test_seed_consistency_eight_agencies(self) -> None:
        agencies = list_agencies(limit=200)
        self.assertEqual(agencies.total, 8)
        self.assertEqual(len(agencies.items), 8)

        required_keys = {
            "agency_id",
            "agency_name",
            "address_text",
            "city",
            "district",
            "latitude",
            "longitude",
            "sales_owner",
            "priority_tier",
            "target_visit_frequency",
            "preferred_visit_time_window",
            "last_visit_date",
            "next_recommended_visit_date",
        }

        sample = agencies.items[0].agency.model_dump(mode="json")
        self.assertTrue(required_keys.issubset(sample.keys()))


if __name__ == "__main__":
    unittest.main()
