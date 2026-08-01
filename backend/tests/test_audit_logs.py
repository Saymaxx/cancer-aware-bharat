from tests.conftest import auth_header


class TestAuditLogs:
    def test_requires_staff_auth(self, client):
        resp = client.get("/audit-logs")
        assert resp.status_code == 401

    def test_admin_role_cannot_list(self, client, admin_token):
        resp = client.get("/audit-logs", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/audit-logs", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_superadmin_can_list(self, client, superadmin_token, admin_token):
        # Logging in as admin already writes a login_success AuditLog row.
        resp = client.get("/audit-logs", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        assert any(entry["eventType"] == "login_success" for entry in resp.json())

    def test_severity_derivation(self, client, superadmin_token, db_session):
        from app.models.audit_log import AuditLog

        db_session.add_all([
            AuditLog(event_type="login_failure", detail="x"),
            AuditLog(event_type="blog_deleted", detail="x"),
            AuditLog(event_type="blog_updated", detail="x"),
            AuditLog(event_type="blog_published", detail="x"),
        ])
        db_session.flush()

        resp = client.get("/audit-logs", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        by_type = {e["eventType"]: e["severity"] for e in resp.json() if e["eventType"] in
                   ("login_failure", "blog_deleted", "blog_updated", "blog_published")}
        assert by_type["login_failure"] == "Critical"
        assert by_type["blog_deleted"] == "Critical"
        assert by_type["blog_updated"] == "Warning"
        assert by_type["blog_published"] == "Info"
