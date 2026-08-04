from tests.conftest import auth_header


def register_sample_volunteer(client, **overrides) -> dict:
    payload = {
        "name": "Pytest Volunteer",
        "email": "pytest.volunteer@example.com",
        "phone": "+91 90000 12121",
        "password": "SuperSecret123",
        "area": "Educational Campaigns",
        "availableDays": ["Monday", "Wednesday"],
        "motivation": "Want to help.",
    }
    payload.update(overrides)
    resp = client.post("/auth/volunteer/register", json=payload)
    assert resp.status_code == 201, resp.text
    return {**resp.json(), "password": payload["password"]}


def register_and_approve_volunteer(client, admin_token, **overrides) -> dict:
    volunteer = register_sample_volunteer(client, **overrides)
    resp = client.post(f"/volunteers/{volunteer['id']}/approve", headers=auth_header(admin_token))
    assert resp.status_code == 200, resp.text
    return volunteer


class TestVolunteerRegistrationAndLogin:
    def test_register_creates_volunteer(self, client):
        volunteer = register_sample_volunteer(client)
        assert volunteer["email"] == "pytest.volunteer@example.com"
        assert volunteer["volunteerId"].startswith("V-")

    def test_register_defaults_to_pending_approval(self, client):
        volunteer = register_sample_volunteer(client, email="pending@example.com")
        assert volunteer["status"] == "Pending Approval"

    def test_register_rejects_duplicate_email(self, client):
        register_sample_volunteer(client, email="dupe@example.com")
        resp = client.post("/auth/volunteer/register", json={
            "name": "Someone Else",
            "email": "dupe@example.com",
            "phone": "+91 90000 13131",
            "password": "AnotherPass123",
        })
        assert resp.status_code == 409

    def test_register_rejects_short_password(self, client):
        resp = client.post("/auth/volunteer/register", json={
            "name": "Short Pw",
            "email": "shortpw@example.com",
            "phone": "+91 90000 14141",
            "password": "short",
        })
        assert resp.status_code == 422

    def test_login_blocked_while_pending_approval(self, client):
        volunteer = register_sample_volunteer(client, email="pending.login@example.com")
        resp = client.post("/auth/volunteer/login", json={"email": "pending.login@example.com", "password": volunteer["password"]})
        assert resp.status_code == 403

    def test_login_succeeds_after_approval(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="login.ok@example.com")
        resp = client.post("/auth/volunteer/login", json={"email": "login.ok@example.com", "password": volunteer["password"]})
        assert resp.status_code == 200
        assert resp.json()["role"] == "volunteer"

    def test_login_blocked_after_rejection(self, client, admin_token):
        volunteer = register_sample_volunteer(client, email="login.rejected@example.com")
        client.post(
            f"/volunteers/{volunteer['id']}/reject",
            json={"reason": "Incomplete details."},
            headers=auth_header(admin_token),
        )
        resp = client.post("/auth/volunteer/login", json={"email": "login.rejected@example.com", "password": volunteer["password"]})
        assert resp.status_code == 403

    def test_login_fails_with_wrong_password(self, client):
        register_sample_volunteer(client, email="login.bad@example.com")
        resp = client.post("/auth/volunteer/login", json={"email": "login.bad@example.com", "password": "WrongPassword1"})
        assert resp.status_code == 401


class TestVolunteerProfile:
    def test_me_requires_auth(self, client):
        resp = client.get("/volunteers/me")
        assert resp.status_code == 401

    def test_me_returns_own_profile(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="myprofile@example.com")
        login = client.post("/auth/volunteer/login", json={"email": "myprofile@example.com", "password": volunteer["password"]})
        token = login.json()["accessToken"]

        resp = client.get("/volunteers/me", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["email"] == "myprofile@example.com"

    def test_staff_token_cannot_access_volunteer_me(self, client, admin_token):
        resp = client.get("/volunteers/me", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_me_returns_404_not_500_for_deleted_volunteer(self, client, admin_token, db_session):
        from app.models.volunteer import Volunteer

        volunteer = register_and_approve_volunteer(client, admin_token, email="deleted.volunteer@example.com")
        login = client.post("/auth/volunteer/login", json={"email": "deleted.volunteer@example.com", "password": volunteer["password"]})
        token = login.json()["accessToken"]

        db_session.query(Volunteer).filter(Volunteer.id == volunteer["id"]).delete()
        db_session.flush()

        resp = client.get("/volunteers/me", headers=auth_header(token))
        assert resp.status_code == 404


class TestListVolunteers:
    def test_requires_staff_auth(self, client):
        resp = client.get("/volunteers")
        assert resp.status_code == 401

    def test_volunteer_role_cannot_list(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="list.notallowed@example.com")
        login = client.post("/auth/volunteer/login", json={"email": "list.notallowed@example.com", "password": volunteer["password"]})
        token = login.json()["accessToken"]
        resp = client.get("/volunteers", headers=auth_header(token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        register_sample_volunteer(client, email="list.visible@example.com")
        resp = client.get("/volunteers", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(v["email"] == "list.visible@example.com" for v in resp.json())


class TestApproveVolunteer:
    def test_admin_can_approve(self, client, admin_token):
        volunteer = register_sample_volunteer(client, email="app1@example.com")
        resp = client.post(f"/volunteers/{volunteer['id']}/approve", headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Approved"

    def test_superadmin_can_approve(self, client, superadmin_token):
        volunteer = register_sample_volunteer(client, email="app2@example.com")
        resp = client.post(f"/volunteers/{volunteer['id']}/approve", headers=auth_header(superadmin_token))
        assert resp.status_code == 200, resp.text

    def test_approve_requires_staff_auth(self, client):
        volunteer = register_sample_volunteer(client, email="app3@example.com")
        resp = client.post(f"/volunteers/{volunteer['id']}/approve")
        assert resp.status_code == 401

    def test_hospital_role_cannot_approve(self, client, hospital1_token):
        volunteer = register_sample_volunteer(client, email="app4@example.com")
        resp = client.post(f"/volunteers/{volunteer['id']}/approve", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_cannot_approve_twice(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="app5@example.com")
        resp = client.post(f"/volunteers/{volunteer['id']}/approve", headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_approve_nonexistent_404s(self, client, admin_token):
        resp = client.post(
            "/volunteers/00000000-0000-0000-0000-000000000000/approve",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404


class TestRejectVolunteer:
    def test_admin_can_reject(self, client, admin_token):
        volunteer = register_sample_volunteer(client, email="rej1@example.com")
        resp = client.post(
            f"/volunteers/{volunteer['id']}/reject",
            json={"reason": "Could not verify details."},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Rejected"

    def test_reject_requires_nonempty_reason(self, client, admin_token):
        volunteer = register_sample_volunteer(client, email="rej2@example.com")
        resp = client.post(
            f"/volunteers/{volunteer['id']}/reject",
            json={"reason": ""},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 422

    def test_cannot_reject_already_approved(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="rej3@example.com")
        resp = client.post(
            f"/volunteers/{volunteer['id']}/reject",
            json={"reason": "too late"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 409


def login_as_volunteer(client, volunteer: dict) -> str:
    resp = client.post("/auth/volunteer/login", json={"email": volunteer["email"], "password": volunteer["password"]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


class TestVolunteerHours:
    def test_new_volunteer_has_zero_total_hours(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="hours.zero@example.com")
        token = login_as_volunteer(client, volunteer)
        resp = client.get("/volunteers/me", headers=auth_header(token))
        assert resp.json()["totalHours"] == 0

    def test_log_hours_requires_volunteer_auth(self, client):
        resp = client.post("/volunteers/me/hours", json={"activity": "X", "hours": 2, "logDate": "2026-08-01"})
        assert resp.status_code == 401

    def test_staff_cannot_log_hours_as_volunteer(self, client, admin_token):
        resp = client.post(
            "/volunteers/me/hours",
            json={"activity": "X", "hours": 2, "logDate": "2026-08-01"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 403

    def test_volunteer_can_log_and_list_own_hours(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="hours.log@example.com")
        token = login_as_volunteer(client, volunteer)

        resp = client.post(
            "/volunteers/me/hours",
            json={"activity": "Free Early Detection Camp", "hours": 4.5, "logDate": "2026-08-01"},
            headers=auth_header(token),
        )
        assert resp.status_code == 201, resp.text
        assert resp.json()["activity"] == "Free Early Detection Camp"

        list_resp = client.get("/volunteers/me/hours", headers=auth_header(token))
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1

    def test_logged_hours_sum_into_total_hours(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="hours.total@example.com")
        token = login_as_volunteer(client, volunteer)

        client.post("/volunteers/me/hours", json={"activity": "A", "hours": 3, "logDate": "2026-08-01"}, headers=auth_header(token))
        client.post("/volunteers/me/hours", json={"activity": "B", "hours": 2.5, "logDate": "2026-08-02"}, headers=auth_header(token))

        resp = client.get("/volunteers/me", headers=auth_header(token))
        assert resp.json()["totalHours"] == 5.5

        # Visible to admin/superadmin's volunteer list too, not just self-service.
        admin_view = client.get("/volunteers", headers=auth_header(admin_token))
        listed = next(v for v in admin_view.json() if v["id"] == volunteer["id"])
        assert listed["totalHours"] == 5.5

    def test_rejects_hours_out_of_range(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="hours.badrange@example.com")
        token = login_as_volunteer(client, volunteer)

        resp = client.post(
            "/volunteers/me/hours",
            json={"activity": "X", "hours": 25, "logDate": "2026-08-01"},
            headers=auth_header(token),
        )
        assert resp.status_code == 422

    def test_one_volunteers_hours_not_visible_to_another(self, client, admin_token):
        volunteer_a = register_and_approve_volunteer(client, admin_token, email="hours.a@example.com")
        volunteer_b = register_and_approve_volunteer(client, admin_token, email="hours.b@example.com")
        token_a = login_as_volunteer(client, volunteer_a)
        token_b = login_as_volunteer(client, volunteer_b)

        client.post("/volunteers/me/hours", json={"activity": "A only", "hours": 1, "logDate": "2026-08-01"}, headers=auth_header(token_a))

        resp = client.get("/volunteers/me/hours", headers=auth_header(token_b))
        assert resp.json() == []


class TestTrainingProgress:
    def test_requires_volunteer_auth(self, client):
        resp = client.get("/volunteers/me/training")
        assert resp.status_code == 401

    def test_starts_empty(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="training.empty@example.com")
        token = login_as_volunteer(client, volunteer)
        resp = client.get("/volunteers/me/training", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json() == []

    def test_can_update_progress(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="training.update@example.com")
        token = login_as_volunteer(client, volunteer)
        resp = client.patch("/volunteers/me/training/res-1", json={"progress": 40}, headers=auth_header(token))
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["resourceId"] == "res-1"
        assert body["progress"] == 40
        assert body["completedAt"] is None

    def test_progress_persists_and_lists(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="training.list@example.com")
        token = login_as_volunteer(client, volunteer)
        client.patch("/volunteers/me/training/res-1", json={"progress": 40}, headers=auth_header(token))
        client.patch("/volunteers/me/training/res-2", json={"progress": 100}, headers=auth_header(token))

        resp = client.get("/volunteers/me/training", headers=auth_header(token))
        assert resp.status_code == 200
        by_resource = {r["resourceId"]: r for r in resp.json()}
        assert by_resource["res-1"]["progress"] == 40
        assert by_resource["res-2"]["progress"] == 100
        assert by_resource["res-2"]["completedAt"] is not None

    def test_updating_same_resource_again_overwrites_not_duplicates(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="training.overwrite@example.com")
        token = login_as_volunteer(client, volunteer)
        client.patch("/volunteers/me/training/res-1", json={"progress": 40}, headers=auth_header(token))
        client.patch("/volunteers/me/training/res-1", json={"progress": 100}, headers=auth_header(token))

        resp = client.get("/volunteers/me/training", headers=auth_header(token))
        rows = [r for r in resp.json() if r["resourceId"] == "res-1"]
        assert len(rows) == 1
        assert rows[0]["progress"] == 100

    def test_rejects_out_of_range_progress(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="training.badrange@example.com")
        token = login_as_volunteer(client, volunteer)
        resp = client.patch("/volunteers/me/training/res-1", json={"progress": 150}, headers=auth_header(token))
        assert resp.status_code == 422

    def test_one_volunteers_progress_not_visible_to_another(self, client, admin_token):
        volunteer_a = register_and_approve_volunteer(client, admin_token, email="training.a@example.com")
        volunteer_b = register_and_approve_volunteer(client, admin_token, email="training.b@example.com")
        token_a = login_as_volunteer(client, volunteer_a)
        token_b = login_as_volunteer(client, volunteer_b)

        client.patch("/volunteers/me/training/res-1", json={"progress": 100}, headers=auth_header(token_a))

        resp = client.get("/volunteers/me/training", headers=auth_header(token_b))
        assert resp.json() == []
