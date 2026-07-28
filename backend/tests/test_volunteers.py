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


class TestVolunteerRegistrationAndLogin:
    def test_register_creates_volunteer(self, client):
        volunteer = register_sample_volunteer(client)
        assert volunteer["email"] == "pytest.volunteer@example.com"
        assert volunteer["volunteerId"].startswith("V-")

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

    def test_login_succeeds_with_correct_credentials(self, client):
        volunteer = register_sample_volunteer(client, email="login.ok@example.com")
        resp = client.post("/auth/volunteer/login", json={"email": "login.ok@example.com", "password": volunteer["password"]})
        assert resp.status_code == 200
        assert resp.json()["role"] == "volunteer"

    def test_login_fails_with_wrong_password(self, client):
        register_sample_volunteer(client, email="login.bad@example.com")
        resp = client.post("/auth/volunteer/login", json={"email": "login.bad@example.com", "password": "WrongPassword1"})
        assert resp.status_code == 401


class TestVolunteerProfile:
    def test_me_requires_auth(self, client):
        resp = client.get("/volunteers/me")
        assert resp.status_code == 401

    def test_me_returns_own_profile(self, client):
        volunteer = register_sample_volunteer(client, email="myprofile@example.com")
        login = client.post("/auth/volunteer/login", json={"email": "myprofile@example.com", "password": volunteer["password"]})
        token = login.json()["accessToken"]

        resp = client.get("/volunteers/me", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["email"] == "myprofile@example.com"

    def test_staff_token_cannot_access_volunteer_me(self, client, admin_token):
        resp = client.get("/volunteers/me", headers=auth_header(admin_token))
        assert resp.status_code == 403
