from tests.conftest import auth_header


def submit_partner_request(client, **overrides) -> dict:
    payload = {
        "hospitalName": "Phase B Test Hospital",
        "contactName": "Dr. Phase B",
        "email": "phaseb@example.com",
        "phone": "+91 90000 20202",
        "city": "Bengaluru",
    }
    payload.update(overrides)
    resp = client.post("/hospitals/partner-requests", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


APPROVE_PAYLOAD = {
    "region": "south",
    "state": "Karnataka",
    "type": "Center of Excellence",
    "address": "123 MG Road, Bengaluru, Karnataka 560001",
    "lat": 12.9716,
    "lng": 77.5946,
}


class TestRecommend:
    def test_admin_can_recommend(self, client, admin_token):
        req = submit_partner_request(client, email="rec1@example.com")
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Recommended"

    def test_superadmin_can_recommend(self, client, superadmin_token):
        req = submit_partner_request(client, email="rec2@example.com")
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(superadmin_token))
        assert resp.status_code == 200, resp.text

    def test_recommend_requires_staff_auth(self, client):
        req = submit_partner_request(client, email="rec3@example.com")
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={})
        assert resp.status_code == 401

    def test_hospital_role_cannot_recommend(self, client, hospital1_token):
        req = submit_partner_request(client, email="rec4@example.com")
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_cannot_recommend_twice(self, client, admin_token):
        req = submit_partner_request(client, email="rec5@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(admin_token))
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_recommend_notes_stored_as_decision_notes(self, client, admin_token):
        req = submit_partner_request(client, email="rec6@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/recommend",
            json={"notes": "Docs verified, looks solid."},
            headers=auth_header(admin_token),
        )
        assert resp.json()["decisionNotes"] == "Docs verified, looks solid."


class TestRequestInfo:
    def test_superadmin_can_request_info(self, client, superadmin_token):
        req = submit_partner_request(client, email="info1@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/request-info",
            json={"notes": "Please share NABH accreditation documents."},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Info Requested"
        assert resp.json()["decisionNotes"] == "Please share NABH accreditation documents."

    def test_admin_cannot_request_info(self, client, admin_token):
        req = submit_partner_request(client, email="info2@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/request-info",
            json={},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 403

    def test_request_info_requires_staff_auth(self, client):
        req = submit_partner_request(client, email="info3@example.com")
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/request-info", json={})
        assert resp.status_code == 401

    def test_request_info_after_recommend_succeeds(self, client, admin_token, superadmin_token):
        req = submit_partner_request(client, email="info4@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(admin_token))
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/request-info",
            json={},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text

    def test_cannot_request_info_on_approved(self, client, superadmin_token):
        req = submit_partner_request(client, email="info5@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/approve", json=APPROVE_PAYLOAD, headers=auth_header(superadmin_token))
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/request-info", json={}, headers=auth_header(superadmin_token))
        assert resp.status_code == 409

    def test_approve_after_request_info_succeeds(self, client, superadmin_token):
        """Info Requested shouldn't be a dead end -- Super Admin can still
        approve once the applicant (or admin) follows up."""
        req = submit_partner_request(client, email="info6@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/request-info", json={}, headers=auth_header(superadmin_token))
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/approve",
            json=APPROVE_PAYLOAD,
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text

    def test_reject_after_request_info_succeeds(self, client, superadmin_token):
        req = submit_partner_request(client, email="info7@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/request-info", json={}, headers=auth_header(superadmin_token))
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/reject",
            json={"reason": "No response after follow-up."},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text


class TestApprove:
    def test_superadmin_can_approve_pending_directly(self, client, superadmin_token):
        req = submit_partner_request(client, email="app1@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/approve",
            json=APPROVE_PAYLOAD,
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["hospital"]["name"] == "Phase B Test Hospital"
        assert body["hospital"]["region"] == "south"
        assert body["loginEmail"]
        assert body["tempPassword"]

    def test_admin_cannot_approve(self, client, admin_token):
        req = submit_partner_request(client, email="app2@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/approve",
            json=APPROVE_PAYLOAD,
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 403

    def test_approve_after_recommend_succeeds(self, client, admin_token, superadmin_token):
        req = submit_partner_request(client, email="app3@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/recommend", json={}, headers=auth_header(admin_token))
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/approve",
            json=APPROVE_PAYLOAD,
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text

    def test_cannot_approve_already_approved(self, client, superadmin_token):
        req = submit_partner_request(client, email="app4@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/approve", json=APPROVE_PAYLOAD, headers=auth_header(superadmin_token))
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/approve", json=APPROVE_PAYLOAD, headers=auth_header(superadmin_token))
        assert resp.status_code == 409

    def test_approved_hospital_can_actually_log_in(self, client, superadmin_token):
        """The whole point of approval -- the generated credentials must be
        real and immediately usable, not just echoed back."""
        req = submit_partner_request(client, email="app5@example.com")
        approve_resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/approve",
            json=APPROVE_PAYLOAD,
            headers=auth_header(superadmin_token),
        )
        credentials = approve_resp.json()
        login_resp = client.post("/auth/hospital/login", json={
            "email": credentials["loginEmail"],
            "password": credentials["tempPassword"],
        })
        assert login_resp.status_code == 200, login_resp.text
        assert login_resp.json()["role"] == "hospital"

    def test_approved_hospital_appears_in_public_directory(self, client, superadmin_token):
        req = submit_partner_request(client, email="app6@example.com", hospitalName="Publicly Listed Hospital")
        client.post(f"/hospitals/partner-requests/{req['id']}/approve", json=APPROVE_PAYLOAD, headers=auth_header(superadmin_token))
        directory = client.get("/hospitals").json()
        assert any(h["name"] == "Publicly Listed Hospital" for h in directory)

    def test_approve_generates_unique_login_email_for_same_hospital_name(self, client, superadmin_token):
        """Two different partner requests happening to share a hospital name
        shouldn't collide on the generated login_email (which is unique)."""
        req1 = submit_partner_request(client, email="dup1@example.com", hospitalName="Duplicate Name Hospital")
        req2 = submit_partner_request(client, email="dup2@example.com", hospitalName="Duplicate Name Hospital")
        resp1 = client.post(f"/hospitals/partner-requests/{req1['id']}/approve", json=APPROVE_PAYLOAD, headers=auth_header(superadmin_token))
        resp2 = client.post(f"/hospitals/partner-requests/{req2['id']}/approve", json=APPROVE_PAYLOAD, headers=auth_header(superadmin_token))
        assert resp1.status_code == 200 and resp2.status_code == 200
        assert resp1.json()["loginEmail"] != resp2.json()["loginEmail"]


class TestReject:
    def test_admin_can_reject(self, client, admin_token):
        req = submit_partner_request(client, email="rej1@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/reject",
            json={"reason": "Incomplete accreditation documents."},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "Rejected"
        assert resp.json()["decisionNotes"] == "Incomplete accreditation documents."

    def test_superadmin_can_reject(self, client, superadmin_token):
        req = submit_partner_request(client, email="rej2@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/reject",
            json={"reason": "Does not meet network criteria."},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 200, resp.text

    def test_reject_requires_nonempty_reason(self, client, admin_token):
        req = submit_partner_request(client, email="rej3@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/reject",
            json={"reason": ""},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 422

    def test_hospital_role_cannot_reject(self, client, hospital1_token):
        req = submit_partner_request(client, email="rej4@example.com")
        resp = client.post(
            f"/hospitals/partner-requests/{req['id']}/reject",
            json={"reason": "test"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403

    def test_cannot_reject_already_rejected(self, client, admin_token):
        req = submit_partner_request(client, email="rej5@example.com")
        client.post(f"/hospitals/partner-requests/{req['id']}/reject", json={"reason": "first"}, headers=auth_header(admin_token))
        resp = client.post(f"/hospitals/partner-requests/{req['id']}/reject", json={"reason": "second"}, headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_rejected_request_no_hospital_created(self, client, admin_token):
        req = submit_partner_request(client, email="rej6@example.com", hospitalName="Never Should Exist Hospital")
        client.post(f"/hospitals/partner-requests/{req['id']}/reject", json={"reason": "no"}, headers=auth_header(admin_token))
        directory = client.get("/hospitals").json()
        assert not any(h["name"] == "Never Should Exist Hospital" for h in directory)


class TestNotFoundAndCreatedAt:
    def test_recommend_nonexistent_request_404s(self, client, admin_token):
        resp = client.post(
            "/hospitals/partner-requests/00000000-0000-0000-0000-000000000000/recommend",
            json={},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404

    def test_partner_request_includes_created_at(self, client, admin_token):
        submit_partner_request(client, email="createdat@example.com")
        resp = client.get("/hospitals/partner-requests/all", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert all("createdAt" in r for r in resp.json())
