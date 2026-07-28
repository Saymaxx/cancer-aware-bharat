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
