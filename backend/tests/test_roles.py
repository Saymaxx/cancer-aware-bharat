from tests.conftest import auth_header


def create_sample_role(client, superadmin_token, **overrides) -> dict:
    payload = {
        "name": "Pytest Role",
        "description": "A test role.",
        "permissions": ["dashboard.view", "reports.view"],
    }
    payload.update(overrides)
    resp = client.post("/roles", json=payload, headers=auth_header(superadmin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestListRoles:
    def test_requires_staff_auth(self, client):
        resp = client.get("/roles")
        assert resp.status_code == 401

    def test_admin_role_cannot_list(self, client, admin_token):
        resp = client.get("/roles", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/roles", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_superadmin_can_list(self, client, superadmin_token):
        create_sample_role(client, superadmin_token, name="List Visible Role")
        resp = client.get("/roles", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        assert any(r["name"] == "List Visible Role" for r in resp.json())


class TestCreateRole:
    def test_superadmin_can_create(self, client, superadmin_token):
        role = create_sample_role(client, superadmin_token)
        assert role["isSystem"] is False
        assert role["assignedCount"] == 0
        assert role["permissions"] == ["dashboard.view", "reports.view"]

    def test_admin_role_cannot_create(self, client, admin_token):
        resp = client.post("/roles", json={"name": "X", "description": "", "permissions": []}, headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_rejects_blank_name(self, client, superadmin_token):
        resp = client.post("/roles", json={"name": "", "description": "", "permissions": []}, headers=auth_header(superadmin_token))
        assert resp.status_code == 422


class TestDeleteRole:
    def test_superadmin_can_delete_custom_role(self, client, superadmin_token):
        role = create_sample_role(client, superadmin_token)
        resp = client.delete(f"/roles/{role['id']}", headers=auth_header(superadmin_token))
        assert resp.status_code == 204
        listed = client.get("/roles", headers=auth_header(superadmin_token)).json()
        assert not any(r["id"] == role["id"] for r in listed)

    def test_cannot_delete_system_role(self, client, superadmin_token, db_session):
        from app.models.custom_role import CustomRole

        system_role = CustomRole(name="System Role", description="", permissions=[], is_system=True)
        db_session.add(system_role)
        db_session.flush()

        resp = client.delete(f"/roles/{system_role.id}", headers=auth_header(superadmin_token))
        assert resp.status_code == 409

    def test_delete_nonexistent_404s(self, client, superadmin_token):
        resp = client.delete("/roles/00000000-0000-0000-0000-000000000000", headers=auth_header(superadmin_token))
        assert resp.status_code == 404

    def test_admin_role_cannot_delete(self, client, admin_token, superadmin_token):
        role = create_sample_role(client, superadmin_token)
        resp = client.delete(f"/roles/{role['id']}", headers=auth_header(admin_token))
        assert resp.status_code == 403
