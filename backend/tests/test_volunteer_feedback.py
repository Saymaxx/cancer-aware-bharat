from tests.conftest import auth_header
from tests.test_volunteers import register_and_approve_volunteer


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


def login_as_volunteer(client, volunteer: dict) -> str:
    resp = client.post("/auth/volunteer/login", json={"email": volunteer["email"], "password": volunteer["password"]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


class TestSubmitMyFeedback:
    def test_requires_volunteer_auth(self, client):
        resp = client.post("/volunteer-feedback/mine", json={
            "campaignName": "X", "rating": 5, "comment": "X",
        })
        assert resp.status_code == 401

    def test_staff_cannot_submit_as_volunteer(self, client, admin_token):
        resp = client.post("/volunteer-feedback/mine", json={
            "campaignName": "X", "rating": 5, "comment": "X",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_volunteer_can_submit_own_feedback(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="feedback.self@example.com")
        token = login_as_volunteer(client, volunteer)

        resp = client.post(
            "/volunteer-feedback/mine",
            json={"campaignName": "Free Early Detection Camp", "rating": 5, "comment": "Loved organizing this."},
            headers=auth_header(token),
        )
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["volunteerId"] == volunteer["id"]
        assert body["volunteerName"] == volunteer["name"]
        assert body["status"] == "New"

    def test_rejects_rating_out_of_range(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="feedback.badrating@example.com")
        token = login_as_volunteer(client, volunteer)

        resp = client.post(
            "/volunteer-feedback/mine",
            json={"campaignName": "X", "rating": 0, "comment": "X"},
            headers=auth_header(token),
        )
        assert resp.status_code == 422


class TestListMyFeedback:
    def test_requires_volunteer_auth(self, client):
        resp = client.get("/volunteer-feedback/mine")
        assert resp.status_code == 401

    def test_volunteer_sees_only_own_feedback(self, client, admin_token):
        volunteer_a = register_and_approve_volunteer(client, admin_token, email="feedback.a@example.com")
        volunteer_b = register_and_approve_volunteer(client, admin_token, email="feedback.b@example.com")
        token_a = login_as_volunteer(client, volunteer_a)
        token_b = login_as_volunteer(client, volunteer_b)

        client.post("/volunteer-feedback/mine", json={
            "campaignName": "Camp A", "rating": 4, "comment": "From volunteer A",
        }, headers=auth_header(token_a))
        client.post("/volunteer-feedback/mine", json={
            "campaignName": "Camp B", "rating": 3, "comment": "From volunteer B",
        }, headers=auth_header(token_b))

        resp = client.get("/volunteer-feedback/mine", headers=auth_header(token_a))
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert items[0]["comment"] == "From volunteer A"

    def test_shows_admin_response(self, client, admin_token):
        volunteer = register_and_approve_volunteer(client, admin_token, email="feedback.response@example.com")
        token = login_as_volunteer(client, volunteer)

        submitted = client.post("/volunteer-feedback/mine", json={
            "campaignName": "Camp C", "rating": 5, "comment": "Great day",
        }, headers=auth_header(token)).json()

        client.post(
            f"/volunteer-feedback/{submitted['id']}/respond",
            json={"response": "Thank you for your service!"},
            headers=auth_header(admin_token),
        )

        resp = client.get("/volunteer-feedback/mine", headers=auth_header(token))
        assert resp.json()[0]["response"] == "Thank you for your service!"
        assert resp.json()[0]["status"] == "Responded"
