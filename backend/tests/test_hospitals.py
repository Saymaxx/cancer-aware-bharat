from tests.conftest import auth_header


class TestHospitalIsActiveFilter:
    def test_get_inactive_hospital_returns_404(self, client, db_session, hospitals):
        from app.models.hospital import Hospital

        hospital = db_session.query(Hospital).filter(Hospital.id == hospitals[0]["id"]).first()
        hospital.is_active = False
        db_session.flush()

        resp = client.get(f"/hospitals/{hospital.id}")
        assert resp.status_code == 404

    def test_get_active_hospital_succeeds(self, client, hospitals):
        resp = client.get(f"/hospitals/{hospitals[0]['id']}")
        assert resp.status_code == 200
        assert resp.json()["id"] == hospitals[0]["id"]

    def test_get_nonexistent_hospital_returns_404(self, client):
        resp = client.get("/hospitals/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestHospitalList:
    def test_list_hospitals_is_public(self, client):
        resp = client.get("/hospitals")
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    def test_list_hospitals_excludes_inactive(self, client, db_session, hospitals):
        from app.models.hospital import Hospital

        hospital = db_session.query(Hospital).filter(Hospital.id == hospitals[0]["id"]).first()
        hospital.is_active = False
        db_session.flush()

        resp = client.get("/hospitals").json()
        assert not any(h["id"] == hospitals[0]["id"] for h in resp)

    def test_list_hospitals_pagination(self, client):
        resp = client.get("/hospitals?limit=1")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


class TestHospitalMyProfile:
    def test_get_my_profile_requires_hospital_auth(self, client):
        resp = client.get("/hospitals/me")
        assert resp.status_code == 401

    def test_admin_cannot_get_hospital_my_profile(self, client, admin_token):
        resp = client.get("/hospitals/me", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_hospital_can_get_own_profile(self, client, hospital1_token):
        resp = client.get("/hospitals/me", headers=auth_header(hospital1_token))
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert "address" in body
        assert "phone" in body

    def test_hospital_can_update_own_profile(self, client, hospital1_token):
        resp = client.patch(
            "/hospitals/me",
            json={
                "address": "New Address, Test City",
                "phone": "+91 90000 55555",
                "emergencyPhone": "+91 90000 66666",
                "website": "www.testhospital.org",
            },
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["address"] == "New Address, Test City"
        assert body["phone"] == "+91 90000 55555"
        assert body["emergencyPhone"] == "+91 90000 66666"
        assert body["website"] == "www.testhospital.org"

        # Persists -- a fresh GET reflects the same saved values, not just
        # the PATCH response echoing the request back.
        refetched = client.get("/hospitals/me", headers=auth_header(hospital1_token)).json()
        assert refetched["address"] == "New Address, Test City"
        assert refetched["website"] == "www.testhospital.org"

    def test_partial_update_leaves_other_fields_untouched(self, client, hospital1_token):
        original = client.get("/hospitals/me", headers=auth_header(hospital1_token)).json()

        resp = client.patch(
            "/hospitals/me",
            json={"website": "www.onlywebsite.org"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["website"] == "www.onlywebsite.org"
        assert body["phone"] == original["phone"]
        assert body["address"] == original["address"]

    def test_hospital_cannot_update_another_hospitals_profile(self, client, hospital1_token, hospital2_token):
        client.patch("/hospitals/me", json={"website": "www.hospital-one.org"}, headers=auth_header(hospital1_token))
        hospital2_profile = client.get("/hospitals/me", headers=auth_header(hospital2_token)).json()
        assert hospital2_profile["website"] != "www.hospital-one.org"

    def test_update_requires_hospital_auth(self, client):
        resp = client.patch("/hospitals/me", json={"website": "www.example.org"})
        assert resp.status_code == 401


class TestHospitalPartnerRequests:
    def test_submit_partner_request_is_public(self, client):
        resp = client.post("/hospitals/partner-requests", json={
            "hospitalName": "New Partner Hospital",
            "contactName": "Dr. Test Contact",
            "email": "contact@newpartner.example.com",
            "phone": "+91 90000 17171",
            "city": "Jaipur",
        })
        assert resp.status_code == 201, resp.text
        assert resp.json()["status"] == "Pending"

    def test_list_partner_requests_requires_staff_role(self, client):
        resp = client.get("/hospitals/partner-requests/all")
        assert resp.status_code == 401

    def test_list_partner_requests_visible_to_admin(self, client, admin_token):
        client.post("/hospitals/partner-requests", json={
            "hospitalName": "Visible To Admin Hospital",
            "contactName": "Dr. Visible",
            "email": "visible@example.com",
            "phone": "+91 90000 18181",
            "city": "Chennai",
        })
        resp = client.get("/hospitals/partner-requests/all", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(r["hospitalName"] == "Visible To Admin Hospital" for r in resp.json())
