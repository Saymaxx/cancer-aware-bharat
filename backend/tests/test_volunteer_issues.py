from tests.conftest import auth_header
from tests.test_volunteers import register_and_approve_volunteer


def login_as_volunteer(client, volunteer: dict) -> str:
    resp = client.post("/auth/volunteer/login", json={"email": volunteer["email"], "password": volunteer["password"]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


class TestSubmitMyIssue:
    def test_requires_volunteer_auth(self, client):
        resp = client.post("/volunteer-issues/mine", json={"category": "Kit Shortage", "description": "Out of gloves."})
        assert resp.status_code == 401

    def test_staff_cannot_submit_as_volunteer(self, client, admin_token):
        resp = client.post(
            "/volunteer-issues/mine",
            json={"category": "Kit Shortage", "description": "X"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 403

    def test_volunteer_can_submit_own_issue(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="issue.self@example.com")
        token = login_as_volunteer(client, volunteer)

        resp = client.post(
            "/volunteer-issues/mine",
            json={"category": "Venue Access", "description": "Gate locked, no coordinator on site."},
            headers=auth_header(token),
        )
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["volunteerId"] == volunteer["id"]
        assert body["volunteerName"] == volunteer["name"]
        assert body["status"] == "New"
        assert body["resolutionNotes"] is None

    def test_rejects_blank_description(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="issue.blank@example.com")
        token = login_as_volunteer(client, volunteer)

        resp = client.post(
            "/volunteer-issues/mine",
            json={"category": "Kit Shortage", "description": ""},
            headers=auth_header(token),
        )
        assert resp.status_code == 422


class TestListMyIssues:
    def test_requires_volunteer_auth(self, client):
        resp = client.get("/volunteer-issues/mine")
        assert resp.status_code == 401

    def test_volunteer_sees_only_own_issues(self, client, admin_token):
        volunteer_a = register_and_approve_volunteer(client, admin_token, email="issue.a@example.com")
        volunteer_b = register_and_approve_volunteer(client, admin_token, email="issue.b@example.com")
        token_a = login_as_volunteer(client, volunteer_a)
        token_b = login_as_volunteer(client, volunteer_b)

        client.post("/volunteer-issues/mine", json={"category": "Kit Shortage", "description": "From A"}, headers=auth_header(token_a))
        client.post("/volunteer-issues/mine", json={"category": "Crowd Overflow", "description": "From B"}, headers=auth_header(token_b))

        resp = client.get("/volunteer-issues/mine", headers=auth_header(token_a))
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert items[0]["description"] == "From A"


class TestListIssues:
    def test_requires_staff_auth(self, client):
        resp = client.get("/volunteer-issues")
        assert resp.status_code == 401

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/volunteer-issues", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="issue.listed@example.com")
        token = login_as_volunteer(client, volunteer)
        client.post("/volunteer-issues/mine", json={"category": "Medical Escalation", "description": "Visible to admin"}, headers=auth_header(token))

        resp = client.get("/volunteer-issues", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(i["description"] == "Visible to admin" for i in resp.json())


class TestResolveIssue:
    def _submit(self, client, admin_token, **overrides) -> dict:
        volunteer = register_and_approve_volunteer(client, admin_token, **overrides)
        token = login_as_volunteer(client, volunteer)
        resp = client.post(
            "/volunteer-issues/mine",
            json={"category": "Kit Shortage", "description": "Need more gloves and masks."},
            headers=auth_header(token),
        )
        assert resp.status_code == 201
        return resp.json()

    def test_admin_can_resolve(self, client, admin_token):
        issue = self._submit(client, admin_token, email="issue.resolve1@example.com")
        resp = client.post(
            f"/volunteer-issues/{issue['id']}/resolve",
            json={"resolutionNotes": "Extra kits dispatched from HQ."},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["status"] == "Resolved"
        assert body["resolutionNotes"] == "Extra kits dispatched from HQ."

    def test_resolve_without_notes_succeeds(self, client, admin_token):
        issue = self._submit(client, admin_token, email="issue.resolve2@example.com")
        resp = client.post(f"/volunteer-issues/{issue['id']}/resolve", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Resolved"

    def test_cannot_resolve_twice(self, client, admin_token):
        issue = self._submit(client, admin_token, email="issue.resolve3@example.com")
        client.post(f"/volunteer-issues/{issue['id']}/resolve", json={}, headers=auth_header(admin_token))
        resp = client.post(f"/volunteer-issues/{issue['id']}/resolve", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_hospital_role_cannot_resolve(self, client, admin_token, hospital1_token):
        issue = self._submit(client, admin_token, email="issue.resolve4@example.com")
        resp = client.post(f"/volunteer-issues/{issue['id']}/resolve", json={}, headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_resolve_nonexistent_404s(self, client, admin_token):
        resp = client.post(
            "/volunteer-issues/00000000-0000-0000-0000-000000000000/resolve",
            json={},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404
