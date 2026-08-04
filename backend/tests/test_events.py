from tests.conftest import auth_header


def _approved_volunteer_token(client, admin_token, **overrides) -> str:
    from tests.test_volunteers import register_and_approve_volunteer

    volunteer = register_and_approve_volunteer(client, admin_token, **overrides)
    login = client.post("/auth/volunteer/login", json={"email": volunteer["email"], "password": volunteer["password"]})
    return login.json()["accessToken"]


def sample_event_payload(**overrides) -> dict:
    payload = {
        "title": "Pytest Screening Camp",
        "type": "Screening Camp",
        "date": "2026-09-01",
        "time": "09:00 AM",
        "location": "Community Hall, Test City",
        "description": "A test screening camp.",
        "category": "Screening Camps",
        "capacity": 100,
    }
    payload.update(overrides)
    return payload


class TestEvents:
    def _create_event(self, db_session):
        from app.models.event import Event

        event = Event(
            title="Free Cancer Screening Camp",
            type="Screening",
            date="2026-08-15",
            time="09:00 AM",
            location="Community Hall, Pune",
            category="Screening",
            capacity=100,
        )
        db_session.add(event)
        db_session.flush()
        return event

    def test_list_events_is_public(self, client, db_session):
        self._create_event(db_session)
        resp = client.get("/events")
        assert resp.status_code == 200
        assert any(e["title"] == "Free Cancer Screening Camp" for e in resp.json())

    def test_get_event_by_id_succeeds(self, client, db_session):
        event = self._create_event(db_session)
        resp = client.get(f"/events/{event.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == str(event.id)

    def test_get_nonexistent_event_returns_404(self, client):
        resp = client.get("/events/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestCreateEvent:
    def test_requires_staff_auth(self, client):
        resp = client.post("/events", json=sample_event_payload())
        assert resp.status_code == 401

    def test_hospital_role_cannot_create(self, client, hospital1_token):
        resp = client.post("/events", json=sample_event_payload(), headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_create(self, client, admin_token):
        resp = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token))
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["title"] == "Pytest Screening Camp"
        assert body["registeredCount"] == 0
        assert body["status"] == "Scheduled"

    def test_can_create_with_explicit_status(self, client, admin_token):
        resp = client.post("/events", json=sample_event_payload(status="Cancelled"), headers=auth_header(admin_token))
        assert resp.status_code == 201, resp.text
        assert resp.json()["status"] == "Cancelled"

    def test_rejects_invalid_status(self, client, admin_token):
        resp = client.post("/events", json=sample_event_payload(status="Bogus"), headers=auth_header(admin_token))
        assert resp.status_code == 422

    def test_superadmin_can_create(self, client, superadmin_token):
        resp = client.post("/events", json=sample_event_payload(title="Superadmin Camp"), headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text

    def test_rejects_blank_title(self, client, admin_token):
        resp = client.post("/events", json=sample_event_payload(title=""), headers=auth_header(admin_token))
        assert resp.status_code == 422


class TestUpdateEvent:
    def test_admin_can_update(self, client, admin_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.patch(
            f"/events/{created['id']}",
            json=sample_event_payload(title="Updated Camp Title"),
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["title"] == "Updated Camp Title"

    def test_update_nonexistent_404s(self, client, admin_token):
        resp = client.patch(
            "/events/00000000-0000-0000-0000-000000000000",
            json=sample_event_payload(),
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404

    def test_hospital_role_cannot_update(self, client, admin_token, hospital1_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.patch(
            f"/events/{created['id']}",
            json=sample_event_payload(),
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403


class TestDeleteEvent:
    def test_admin_can_delete(self, client, admin_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.delete(f"/events/{created['id']}", headers=auth_header(admin_token))
        assert resp.status_code == 204
        assert client.get(f"/events/{created['id']}").status_code == 404

    def test_delete_nonexistent_404s(self, client, admin_token):
        resp = client.delete("/events/00000000-0000-0000-0000-000000000000", headers=auth_header(admin_token))
        assert resp.status_code == 404

    def test_hospital_role_cannot_delete(self, client, admin_token, hospital1_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.delete(f"/events/{created['id']}", headers=auth_header(hospital1_token))
        assert resp.status_code == 403


class TestCampaignEnrollment:
    def test_requires_volunteer_auth(self, client, admin_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.post(f"/events/{created['id']}/enroll")
        assert resp.status_code == 401

    def test_staff_role_cannot_enroll(self, client, admin_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.post(f"/events/{created['id']}/enroll", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_volunteer_can_enroll(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["event"]["id"] == created["id"]
        assert body["checkedInAt"] is None

    def test_cannot_enroll_twice(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        resp = client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        assert resp.status_code == 409

    def test_cannot_enroll_in_cancelled_event(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(status="Cancelled"), headers=auth_header(admin_token)).json()
        resp = client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        assert resp.status_code == 409

    def test_enroll_nonexistent_event_404s(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        resp = client.post("/events/00000000-0000-0000-0000-000000000000/enroll", headers=auth_header(volunteer_token))
        assert resp.status_code == 404


class TestListMyCampaigns:
    def test_requires_volunteer_auth(self, client):
        resp = client.get("/volunteers/me/campaigns")
        assert resp.status_code == 401

    def test_starts_empty(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        resp = client.get("/volunteers/me/campaigns", headers=auth_header(volunteer_token))
        assert resp.status_code == 200
        assert resp.json() == []

    def test_shows_enrolled_campaign(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(title="My Enrolled Camp"), headers=auth_header(admin_token)).json()
        client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        resp = client.get("/volunteers/me/campaigns", headers=auth_header(volunteer_token))
        assert resp.status_code == 200
        assert [c["event"]["title"] for c in resp.json()] == ["My Enrolled Camp"]

    def test_only_shows_own_enrollments(self, client, admin_token):
        volunteer1_token = _approved_volunteer_token(client, admin_token, email="enroll1@example.com", phone="+91 90000 21212")
        volunteer2_token = _approved_volunteer_token(client, admin_token, email="enroll2@example.com", phone="+91 90000 22222")
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer1_token))
        resp = client.get("/volunteers/me/campaigns", headers=auth_header(volunteer2_token))
        assert resp.json() == []


class TestCampaignCheckIn:
    def test_requires_volunteer_auth(self, client, admin_token):
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.post(f"/volunteers/me/campaigns/{created['id']}/check-in")
        assert resp.status_code == 401

    def test_check_in_requires_enrollment(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        resp = client.post(f"/volunteers/me/campaigns/{created['id']}/check-in", headers=auth_header(volunteer_token))
        assert resp.status_code == 404

    def test_volunteer_can_check_in_after_enrolling(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        resp = client.post(f"/volunteers/me/campaigns/{created['id']}/check-in", headers=auth_header(volunteer_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["checkedInAt"] is not None

    def test_check_in_is_idempotent(self, client, admin_token):
        volunteer_token = _approved_volunteer_token(client, admin_token)
        created = client.post("/events", json=sample_event_payload(), headers=auth_header(admin_token)).json()
        client.post(f"/events/{created['id']}/enroll", headers=auth_header(volunteer_token))
        first = client.post(f"/volunteers/me/campaigns/{created['id']}/check-in", headers=auth_header(volunteer_token))
        second = client.post(f"/volunteers/me/campaigns/{created['id']}/check-in", headers=auth_header(volunteer_token))
        assert first.json()["checkedInAt"] == second.json()["checkedInAt"]


class TestListMyEvents:
    def test_requires_hospital_auth(self, client):
        resp = client.get("/events/mine")
        assert resp.status_code == 401

    def test_starts_empty(self, client, hospital1_token):
        resp = client.get("/events/mine", headers=auth_header(hospital1_token))
        assert resp.status_code == 200
        assert resp.json() == []

    def test_only_shows_events_hosted_with_own_hospital(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        client.post("/events", json=sample_event_payload(title="Public Camp, No Hospital"), headers=auth_header(admin_token))
        client.post("/events", json=sample_event_payload(title="Hospital 1 Co-Hosted Camp", hospitalId=hospitals[0]["id"]), headers=auth_header(admin_token))
        client.post("/events", json=sample_event_payload(title="Hospital 2 Co-Hosted Camp", hospitalId=hospitals[1]["id"]), headers=auth_header(admin_token))

        resp1 = client.get("/events/mine", headers=auth_header(hospital1_token))
        assert [e["title"] for e in resp1.json()] == ["Hospital 1 Co-Hosted Camp"]

        resp2 = client.get("/events/mine", headers=auth_header(hospital2_token))
        assert [e["title"] for e in resp2.json()] == ["Hospital 2 Co-Hosted Camp"]

    def test_public_list_still_includes_hospital_hosted_events(self, client, admin_token, hospitals):
        client.post("/events", json=sample_event_payload(title="Visible Everywhere Camp", hospitalId=hospitals[0]["id"]), headers=auth_header(admin_token))
        resp = client.get("/events")
        assert any(e["title"] == "Visible Everywhere Camp" for e in resp.json())
