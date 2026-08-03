from tests.conftest import auth_header


def _create_doctor(client, token, **overrides):
    payload = {
        "name": "Dr. Anjali Rao",
        "specialty": "Medical Oncology",
        "qualification": "MD, DM Oncology",
        "experienceYears": 12,
        "phone": "+919876500001",
        "email": "anjali.rao@example.com",
        "availability": "Available",
        **overrides,
    }
    return client.post("/hospital-doctors/mine", json=payload, headers=auth_header(token))


class TestListMyDoctors:
    def test_requires_hospital_auth(self, client):
        resp = client.get("/hospital-doctors/mine")
        assert resp.status_code == 401

    def test_admin_role_cannot_view(self, client, admin_token):
        resp = client.get("/hospital-doctors/mine", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_starts_empty(self, client, hospital1_token):
        resp = client.get("/hospital-doctors/mine", headers=auth_header(hospital1_token))
        assert resp.status_code == 200
        assert resp.json() == []

    def test_only_shows_own_hospitals_doctors(self, client, hospital1_token, hospital2_token):
        create_resp = _create_doctor(client, hospital1_token)
        assert create_resp.status_code == 201, create_resp.text

        resp1 = client.get("/hospital-doctors/mine", headers=auth_header(hospital1_token))
        assert len(resp1.json()) == 1

        resp2 = client.get("/hospital-doctors/mine", headers=auth_header(hospital2_token))
        assert resp2.json() == []


class TestAddMyDoctor:
    def test_requires_hospital_auth(self, client):
        resp = client.post("/hospital-doctors/mine", json={})
        assert resp.status_code == 401

    def test_creates_doctor_scoped_to_caller(self, client, hospital1_token):
        resp = _create_doctor(client, hospital1_token)
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["name"] == "Dr. Anjali Rao"
        assert body["availability"] == "Available"
        assert body["assignedPatientsCount"] == 0

    def test_rejects_invalid_availability(self, client, hospital1_token):
        resp = _create_doctor(client, hospital1_token, availability="On Vacation")
        assert resp.status_code == 422

    def test_rejects_invalid_email(self, client, hospital1_token):
        resp = _create_doctor(client, hospital1_token, email="not-an-email")
        assert resp.status_code == 422


class TestUpdateMyDoctorAvailability:
    def test_updates_own_doctor(self, client, hospital1_token):
        doctor = _create_doctor(client, hospital1_token).json()
        resp = client.patch(
            f"/hospital-doctors/mine/{doctor['id']}",
            json={"availability": "In Surgery"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200
        assert resp.json()["availability"] == "In Surgery"

    def test_cannot_update_another_hospitals_doctor(self, client, hospital1_token, hospital2_token):
        doctor = _create_doctor(client, hospital1_token).json()
        resp = client.patch(
            f"/hospital-doctors/mine/{doctor['id']}",
            json={"availability": "On Leave"},
            headers=auth_header(hospital2_token),
        )
        assert resp.status_code == 404

    def test_update_nonexistent_404s(self, client, hospital1_token):
        resp = client.patch(
            "/hospital-doctors/mine/00000000-0000-0000-0000-000000000000",
            json={"availability": "On Leave"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 404


class TestRemoveMyDoctor:
    def test_removes_own_doctor(self, client, hospital1_token):
        doctor = _create_doctor(client, hospital1_token).json()
        resp = client.delete(f"/hospital-doctors/mine/{doctor['id']}", headers=auth_header(hospital1_token))
        assert resp.status_code == 204

        list_resp = client.get("/hospital-doctors/mine", headers=auth_header(hospital1_token))
        assert list_resp.json() == []

    def test_cannot_remove_another_hospitals_doctor(self, client, hospital1_token, hospital2_token):
        doctor = _create_doctor(client, hospital1_token).json()
        resp = client.delete(f"/hospital-doctors/mine/{doctor['id']}", headers=auth_header(hospital2_token))
        assert resp.status_code == 404
