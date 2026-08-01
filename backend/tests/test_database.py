from tests.conftest import auth_header


class TestDatabaseHealth:
    def test_requires_staff_auth(self, client):
        resp = client.get("/database/health")
        assert resp.status_code == 401

    def test_admin_role_cannot_view(self, client, admin_token):
        resp = client.get("/database/health", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_superadmin_sees_real_stats(self, client, superadmin_token):
        resp = client.get("/database/health", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["totalSizeBytes"] > 0
        assert body["tablesCount"] > 0
        assert body["uptimeSeconds"] >= 0


class TestBackups:
    def test_requires_staff_auth(self, client):
        resp = client.post("/database/backups")
        assert resp.status_code == 401

    def test_admin_role_cannot_create(self, client, admin_token):
        resp = client.post("/database/backups", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_superadmin_can_create_and_list(self, client, superadmin_token):
        resp = client.post("/database/backups", headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text
        record = resp.json()
        assert record["sizeBytes"] > 0
        assert record["durationMs"] >= 0
        assert record["initiatedBy"] == "superadmin@awarebharat.local"

        list_resp = client.get("/database/backups", headers=auth_header(superadmin_token))
        assert list_resp.status_code == 200
        assert any(b["id"] == record["id"] for b in list_resp.json())
