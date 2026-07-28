from tests.conftest import ADMIN_CREDENTIALS, auth_header


class TestAuditLog:
    def test_successful_login_is_recorded(self, client, db_session):
        from app.models.audit_log import AuditLog

        client.post("/auth/staff/login", json={"email": ADMIN_CREDENTIALS[0], "password": ADMIN_CREDENTIALS[1]})
        entry = db_session.query(AuditLog).filter(AuditLog.event_type == "login_success").order_by(AuditLog.created_at.desc()).first()
        assert entry is not None
        assert entry.role == "admin"
        assert entry.actor_id is not None

    def test_failed_login_is_recorded_with_attempted_email_but_no_actor(self, client, db_session):
        from app.models.audit_log import AuditLog

        client.post("/auth/staff/login", json={"email": ADMIN_CREDENTIALS[0], "password": "definitely-wrong"})
        entry = db_session.query(AuditLog).filter(AuditLog.event_type == "login_failure").order_by(AuditLog.created_at.desc()).first()
        assert entry is not None
        assert entry.actor_id is None
        assert entry.detail == ADMIN_CREDENTIALS[0]

    def test_logout_is_recorded(self, client, db_session, admin_token):
        from app.models.audit_log import AuditLog

        client.post("/auth/logout", headers=auth_header(admin_token))
        entry = db_session.query(AuditLog).filter(AuditLog.event_type == "logout").order_by(AuditLog.created_at.desc()).first()
        assert entry is not None
        assert entry.role == "admin"


class TestLogout:
    def test_logout_revokes_token(self, client, admin_token):
        resp = client.get("/enquiries", headers=auth_header(admin_token))
        assert resp.status_code == 200

        logout_resp = client.post("/auth/logout", headers=auth_header(admin_token))
        assert logout_resp.status_code == 204

        resp_after = client.get("/enquiries", headers=auth_header(admin_token))
        assert resp_after.status_code == 401

    def test_logout_requires_auth(self, client):
        resp = client.post("/auth/logout")
        assert resp.status_code == 401

    def test_double_logout_is_idempotent(self, client, admin_token):
        first = client.post("/auth/logout", headers=auth_header(admin_token))
        assert first.status_code == 204
        # Second call reuses the now-revoked token to authenticate itself,
        # so it must fail with 401 (revoked), not a 500 from a duplicate
        # insert into the unique jti column.
        second = client.post("/auth/logout", headers=auth_header(admin_token))
        assert second.status_code == 401
