from tests.conftest import auth_header


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
