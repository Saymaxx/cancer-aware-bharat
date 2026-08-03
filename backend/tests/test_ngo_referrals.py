from tests.conftest import auth_header


def _create_referral(client, admin_token, hospital_id, **overrides):
    payload = {
        "hospitalId": hospital_id,
        "patientName": "Sunita Devi",
        "age": 41,
        "gender": "Female",
        "referralDate": "2026-08-01",
        "priority": "Urgent",
        "cancerType": "Cervical Cancer",
        "recommendedDepartment": "Gynecological Oncology",
        "referredByNgoAgent": "CAB Field Coordinator - Rekha",
        **overrides,
    }
    return client.post("/ngo-referrals", json=payload, headers=auth_header(admin_token))


def _hospital1_id(hospitals, hospital1_token=None):
    return hospitals[0]["id"]


class TestCreateReferral:
    def test_requires_staff_auth(self, client, hospitals):
        resp = client.post("/ngo-referrals", json={})
        assert resp.status_code == 401

    def test_hospital_role_cannot_create(self, client, hospital1_token, hospitals):
        resp = _create_referral(client, hospital1_token, hospitals[0]["id"])
        assert resp.status_code == 403

    def test_admin_creates_referral(self, client, admin_token, hospitals):
        resp = _create_referral(client, admin_token, hospitals[0]["id"])
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["patientName"] == "Sunita Devi"
        assert body["status"] == "Pending Action"
        assert body["hospitalId"] == hospitals[0]["id"]

    def test_rejects_invalid_priority(self, client, admin_token, hospitals):
        resp = _create_referral(client, admin_token, hospitals[0]["id"], priority="Whenever")
        assert resp.status_code == 422


class TestListMyReferrals:
    def test_requires_hospital_auth(self, client):
        resp = client.get("/ngo-referrals/mine")
        assert resp.status_code == 401

    def test_only_shows_own_hospitals_referrals(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        create_resp = _create_referral(client, admin_token, hospitals[0]["id"])
        assert create_resp.status_code == 201, create_resp.text

        resp1 = client.get("/ngo-referrals/mine", headers=auth_header(hospital1_token))
        assert len(resp1.json()) == 1

        resp2 = client.get("/ngo-referrals/mine", headers=auth_header(hospital2_token))
        assert resp2.json() == []


class TestAcceptReferral:
    def test_accepts_own_pending_referral(self, client, admin_token, hospital1_token, hospitals):
        referral = _create_referral(client, admin_token, hospitals[0]["id"]).json()
        resp = client.post(f"/ngo-referrals/mine/{referral['id']}/accept", headers=auth_header(hospital1_token))
        assert resp.status_code == 200
        assert resp.json()["status"] == "Accepted"

    def test_cannot_accept_another_hospitals_referral(self, client, admin_token, hospital2_token, hospitals):
        referral = _create_referral(client, admin_token, hospitals[0]["id"]).json()
        resp = client.post(f"/ngo-referrals/mine/{referral['id']}/accept", headers=auth_header(hospital2_token))
        assert resp.status_code == 404

    def test_cannot_accept_twice(self, client, admin_token, hospital1_token, hospitals):
        referral = _create_referral(client, admin_token, hospitals[0]["id"]).json()
        client.post(f"/ngo-referrals/mine/{referral['id']}/accept", headers=auth_header(hospital1_token))
        resp = client.post(f"/ngo-referrals/mine/{referral['id']}/accept", headers=auth_header(hospital1_token))
        assert resp.status_code == 409


class TestDeclineReferral:
    def test_declines_own_pending_referral_with_reason(self, client, admin_token, hospital1_token, hospitals):
        referral = _create_referral(client, admin_token, hospitals[0]["id"]).json()
        resp = client.post(
            f"/ngo-referrals/mine/{referral['id']}/decline",
            json={"reason": "Department at maximum bed capacity"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "Declined"
        assert body["declineReason"] == "Department at maximum bed capacity"

    def test_rejects_blank_reason(self, client, admin_token, hospital1_token, hospitals):
        referral = _create_referral(client, admin_token, hospitals[0]["id"]).json()
        resp = client.post(
            f"/ngo-referrals/mine/{referral['id']}/decline",
            json={"reason": ""},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 422

    def test_cannot_decline_another_hospitals_referral(self, client, admin_token, hospital2_token, hospitals):
        referral = _create_referral(client, admin_token, hospitals[0]["id"]).json()
        resp = client.post(
            f"/ngo-referrals/mine/{referral['id']}/decline",
            json={"reason": "Not our specialty"},
            headers=auth_header(hospital2_token),
        )
        assert resp.status_code == 404
