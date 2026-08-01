from tests.conftest import auth_header


def sample_request_payload(**overrides) -> dict:
    payload = {
        "organizationName": "Pytest NSS Unit",
        "orgType": "College",
        "contactPerson": "Prof. Test",
        "email": "nss@test.edu",
        "phone": "+91 98765 43210",
        "requestedDate": "Sep 10, 2026",
        "location": "Test Auditorium",
        "expectedAttendees": 200,
    }
    payload.update(overrides)
    return payload


def create_sample_request(client, admin_token, **overrides) -> dict:
    resp = client.post("/campaign-requests", json=sample_request_payload(**overrides), headers=auth_header(admin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestListCampaignRequests:
    def test_requires_staff_auth(self, client):
        resp = client.get("/campaign-requests")
        assert resp.status_code == 401

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/campaign-requests", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        create_sample_request(client, admin_token, organizationName="List Visible Org")
        resp = client.get("/campaign-requests", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(r["organizationName"] == "List Visible Org" for r in resp.json())


class TestCreateCampaignRequest:
    def test_admin_can_create(self, client, admin_token):
        request = create_sample_request(client, admin_token)
        assert request["status"] == "Pending Scheduling"

    def test_superadmin_can_create(self, client, superadmin_token):
        resp = client.post("/campaign-requests", json=sample_request_payload(organizationName="Superadmin Org"), headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text

    def test_hospital_role_cannot_create(self, client, hospital1_token):
        resp = client.post("/campaign-requests", json=sample_request_payload(), headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_rejects_invalid_org_type(self, client, admin_token):
        resp = client.post("/campaign-requests", json=sample_request_payload(orgType="Bogus"), headers=auth_header(admin_token))
        assert resp.status_code == 422


class TestScheduleCampaignRequest:
    def test_admin_can_schedule(self, client, admin_token):
        request = create_sample_request(client, admin_token)
        resp = client.post(f"/campaign-requests/{request['id']}/schedule", headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Scheduled"

    def test_cannot_schedule_twice(self, client, admin_token):
        request = create_sample_request(client, admin_token)
        client.post(f"/campaign-requests/{request['id']}/schedule", headers=auth_header(admin_token))
        resp = client.post(f"/campaign-requests/{request['id']}/schedule", headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_schedule_nonexistent_404s(self, client, admin_token):
        resp = client.post(
            "/campaign-requests/00000000-0000-0000-0000-000000000000/schedule",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404

    def test_hospital_role_cannot_schedule(self, client, admin_token, hospital1_token):
        request = create_sample_request(client, admin_token)
        resp = client.post(f"/campaign-requests/{request['id']}/schedule", headers=auth_header(hospital1_token))
        assert resp.status_code == 403


class TestDeclineCampaignRequest:
    def test_admin_can_decline(self, client, admin_token):
        request = create_sample_request(client, admin_token)
        resp = client.post(f"/campaign-requests/{request['id']}/decline", headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Declined"

    def test_cannot_decline_already_scheduled(self, client, admin_token):
        request = create_sample_request(client, admin_token)
        client.post(f"/campaign-requests/{request['id']}/schedule", headers=auth_header(admin_token))
        resp = client.post(f"/campaign-requests/{request['id']}/decline", headers=auth_header(admin_token))
        assert resp.status_code == 409
