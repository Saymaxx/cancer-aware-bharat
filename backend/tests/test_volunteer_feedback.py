from tests.conftest import auth_header


def create_sample_feedback(client, admin_token, **overrides) -> dict:
    payload = {
        "volunteerName": "Pytest Volunteer",
        "campaignName": "Free Early Detection Camp",
        "rating": 4,
        "comment": "Great turnout, well organized.",
    }
    payload.update(overrides)
    resp = client.post("/volunteer-feedback", json=payload, headers=auth_header(admin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestListVolunteerFeedback:
    def test_requires_staff_auth(self, client):
        resp = client.get("/volunteer-feedback")
        assert resp.status_code == 401

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/volunteer-feedback", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        create_sample_feedback(client, admin_token, volunteerName="List Visible Volunteer")
        resp = client.get("/volunteer-feedback", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(f["volunteerName"] == "List Visible Volunteer" for f in resp.json())


class TestCreateVolunteerFeedback:
    def test_admin_can_create(self, client, admin_token):
        feedback = create_sample_feedback(client, admin_token)
        assert feedback["status"] == "New"
        assert feedback["response"] is None

    def test_superadmin_can_create(self, client, superadmin_token):
        resp = client.post("/volunteer-feedback", json={
            "volunteerName": "Superadmin Volunteer", "campaignName": "Blood Donation Drive", "rating": 5, "comment": "Excellent.",
        }, headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text

    def test_hospital_role_cannot_create(self, client, hospital1_token):
        resp = client.post("/volunteer-feedback", json={
            "volunteerName": "X", "campaignName": "X", "rating": 3, "comment": "X",
        }, headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_rejects_rating_out_of_range(self, client, admin_token):
        resp = client.post("/volunteer-feedback", json={
            "volunteerName": "X", "campaignName": "X", "rating": 6, "comment": "X",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 422


class TestRespondToFeedback:
    def test_admin_can_respond(self, client, admin_token):
        feedback = create_sample_feedback(client, admin_token)
        resp = client.post(
            f"/volunteer-feedback/{feedback['id']}/respond",
            json={"response": "Thanks for the feedback, we'll add an extra coordinator next time."},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["status"] == "Responded"
        assert "extra coordinator" in body["response"]

    def test_cannot_respond_twice(self, client, admin_token):
        feedback = create_sample_feedback(client, admin_token)
        client.post(f"/volunteer-feedback/{feedback['id']}/respond", json={"response": "first"}, headers=auth_header(admin_token))
        resp = client.post(f"/volunteer-feedback/{feedback['id']}/respond", json={"response": "second"}, headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_respond_requires_nonempty_text(self, client, admin_token):
        feedback = create_sample_feedback(client, admin_token)
        resp = client.post(
            f"/volunteer-feedback/{feedback['id']}/respond",
            json={"response": ""},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 422

    def test_respond_nonexistent_404s(self, client, admin_token):
        resp = client.post(
            "/volunteer-feedback/00000000-0000-0000-0000-000000000000/respond",
            json={"response": "x"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404
