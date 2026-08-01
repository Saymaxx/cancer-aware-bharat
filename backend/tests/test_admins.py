from tests.conftest import auth_header


def create_sample_admin(client, superadmin_token, **overrides) -> dict:
    payload = {
        "name": "Pytest Admin",
        "email": "pytest.admin@awarebharat.local",
        "phone": "+91 98765 43210",
        "region": "North India",
    }
    payload.update(overrides)
    resp = client.post("/admins", json=payload, headers=auth_header(superadmin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestListAdmins:
    def test_requires_staff_auth(self, client):
        resp = client.get("/admins")
        assert resp.status_code == 401

    def test_admin_role_cannot_list(self, client, admin_token):
        resp = client.get("/admins", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/admins", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_superadmin_can_list(self, client, superadmin_token):
        create_sample_admin(client, superadmin_token, email="list.visible@awarebharat.local")
        resp = client.get("/admins", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        assert any(a["email"] == "list.visible@awarebharat.local" for a in resp.json())
        # The Admin Management list manages regional Admins, not other Super
        # Admins -- the seeded superadmin account itself must never appear.
        assert not any(a["email"] == "superadmin@awarebharat.local" for a in resp.json())


class TestCreateAdmin:
    def test_superadmin_can_create(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token)
        assert result["admin"]["isActive"] is True
        assert result["loginEmail"] == "pytest.admin@awarebharat.local"
        assert result["tempPassword"]

    def test_admin_role_cannot_create(self, client, admin_token):
        resp = client.post("/admins", json={"name": "X", "email": "x@awarebharat.local"}, headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_rejects_duplicate_email(self, client, superadmin_token):
        create_sample_admin(client, superadmin_token, email="dupe@awarebharat.local")
        resp = client.post("/admins", json={"name": "Dupe", "email": "dupe@awarebharat.local"}, headers=auth_header(superadmin_token))
        assert resp.status_code == 409

    def test_temp_password_actually_works(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="login.test@awarebharat.local")
        resp = client.post("/auth/staff/login", json={
            "email": "login.test@awarebharat.local",
            "password": result["tempPassword"],
        })
        assert resp.status_code == 200, resp.text
        assert resp.json()["role"] == "admin"


class TestSuspendActivateAdmin:
    def test_suspend_then_login_is_rejected(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="suspend.me@awarebharat.local")
        admin_id = result["admin"]["id"]
        temp_password = result["tempPassword"]

        suspend_resp = client.post(f"/admins/{admin_id}/suspend", headers=auth_header(superadmin_token))
        assert suspend_resp.status_code == 200, suspend_resp.text
        assert suspend_resp.json()["isActive"] is False

        login_resp = client.post("/auth/staff/login", json={"email": "suspend.me@awarebharat.local", "password": temp_password})
        assert login_resp.status_code == 403

    def test_reactivate_restores_login(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="reactivate.me@awarebharat.local")
        admin_id = result["admin"]["id"]
        temp_password = result["tempPassword"]

        client.post(f"/admins/{admin_id}/suspend", headers=auth_header(superadmin_token))
        activate_resp = client.post(f"/admins/{admin_id}/activate", headers=auth_header(superadmin_token))
        assert activate_resp.status_code == 200, activate_resp.text
        assert activate_resp.json()["isActive"] is True

        login_resp = client.post("/auth/staff/login", json={"email": "reactivate.me@awarebharat.local", "password": temp_password})
        assert login_resp.status_code == 200

    def test_cannot_suspend_twice(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="double.suspend@awarebharat.local")
        admin_id = result["admin"]["id"]
        client.post(f"/admins/{admin_id}/suspend", headers=auth_header(superadmin_token))
        resp = client.post(f"/admins/{admin_id}/suspend", headers=auth_header(superadmin_token))
        assert resp.status_code == 409

    def test_cannot_activate_already_active(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="already.active@awarebharat.local")
        admin_id = result["admin"]["id"]
        resp = client.post(f"/admins/{admin_id}/activate", headers=auth_header(superadmin_token))
        assert resp.status_code == 409

    def test_admin_role_cannot_suspend(self, client, superadmin_token, admin_token):
        result = create_sample_admin(client, superadmin_token, email="protected.from.admin@awarebharat.local")
        admin_id = result["admin"]["id"]
        resp = client.post(f"/admins/{admin_id}/suspend", headers=auth_header(admin_token))
        assert resp.status_code == 403


class TestUpdateAdmin:
    def test_superadmin_can_update(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="update.me@awarebharat.local")
        admin_id = result["admin"]["id"]
        resp = client.patch(f"/admins/{admin_id}", json={"name": "Updated Name", "phone": "+91 90000 00000", "region": "South India"}, headers=auth_header(superadmin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["name"] == "Updated Name"
        assert resp.json()["region"] == "South India"


class TestDeleteAdmin:
    def test_superadmin_can_delete(self, client, superadmin_token):
        result = create_sample_admin(client, superadmin_token, email="delete.me@awarebharat.local")
        admin_id = result["admin"]["id"]
        resp = client.delete(f"/admins/{admin_id}", headers=auth_header(superadmin_token))
        assert resp.status_code == 204
        listed = client.get("/admins", headers=auth_header(superadmin_token)).json()
        assert not any(a["id"] == admin_id for a in listed)

    def test_delete_nonexistent_404s(self, client, superadmin_token):
        resp = client.delete("/admins/00000000-0000-0000-0000-000000000000", headers=auth_header(superadmin_token))
        assert resp.status_code == 404

    def test_admin_role_cannot_delete(self, client, superadmin_token, admin_token):
        result = create_sample_admin(client, superadmin_token, email="not.deletable.by.admin@awarebharat.local")
        admin_id = result["admin"]["id"]
        resp = client.delete(f"/admins/{admin_id}", headers=auth_header(admin_token))
        assert resp.status_code == 403
