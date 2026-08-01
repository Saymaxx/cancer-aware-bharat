from tests.conftest import auth_header


class TestGetOrgSettings:
    def test_requires_staff_auth(self, client):
        resp = client.get("/org-settings")
        assert resp.status_code == 401

    def test_admin_role_cannot_view(self, client, admin_token):
        resp = client.get("/org-settings", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_superadmin_gets_defaults_on_first_call(self, client, superadmin_token):
        resp = client.get("/org-settings", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["ngoName"]
        assert body["email"]


class TestUpdateOrgSettings:
    def test_admin_role_cannot_update(self, client, admin_token):
        resp = client.patch("/org-settings", json={
            "ngoName": "X", "tagline": "X", "registrationNo": "X",
            "address": "X", "phone": "X", "email": "x@awarebharat.local", "website": "X",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_superadmin_can_update_and_it_persists(self, client, superadmin_token):
        payload = {
            "ngoName": "Updated NGO Name",
            "tagline": "Updated Tagline",
            "registrationNo": "NGO-TEST-0001",
            "address": "Test Address",
            "phone": "+91 00000 00000",
            "email": "updated@awarebharat.local",
            "website": "www.updated.org",
        }
        resp = client.patch("/org-settings", json=payload, headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        assert resp.json()["ngoName"] == "Updated NGO Name"

        get_resp = client.get("/org-settings", headers=auth_header(superadmin_token))
        assert get_resp.json()["ngoName"] == "Updated NGO Name"
        assert get_resp.json()["email"] == "updated@awarebharat.local"
