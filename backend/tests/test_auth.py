from tests.conftest import ADMIN_CREDENTIALS, HOSPITAL1_CREDENTIALS, SUPERADMIN_CREDENTIALS, auth_header


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


class TestStaffMe:
    def test_requires_auth(self, client):
        resp = client.get("/auth/staff/me")
        assert resp.status_code == 401

    def test_admin_can_read_own_profile(self, client, admin_token):
        resp = client.get("/auth/staff/me", headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["email"] == ADMIN_CREDENTIALS[0]
        assert resp.json()["role"] == "admin"

    def test_superadmin_can_read_own_profile(self, client, superadmin_token):
        # Confirms self-service works for superadmin too, unlike /admins
        # which never lists Super Admin accounts at all.
        resp = client.get("/auth/staff/me", headers=auth_header(superadmin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["email"] == SUPERADMIN_CREDENTIALS[0]
        assert resp.json()["role"] == "superadmin"

    def test_can_update_own_display_name(self, client, admin_token):
        resp = client.patch("/auth/staff/me", json={"name": "Updated Display Name"}, headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["name"] == "Updated Display Name"

        get_resp = client.get("/auth/staff/me", headers=auth_header(admin_token))
        assert get_resp.json()["name"] == "Updated Display Name"


class TestChangePassword:
    def test_requires_auth(self, client):
        resp = client.post("/auth/staff/change-password", json={"currentPassword": "x", "newPassword": "newpassword123"})
        assert resp.status_code == 401

    def test_wrong_current_password_rejected(self, client, admin_token):
        # 400, not 401 -- the Bearer token itself is valid here; 401 would
        # trigger the frontend's global "session expired" force-logout,
        # which must not happen just because the current-password field
        # was wrong.
        resp = client.post(
            "/auth/staff/change-password",
            json={"currentPassword": "definitely-wrong", "newPassword": "newpassword123"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 400

    def test_correct_current_password_updates_and_new_password_logs_in(self, client, admin_token):
        resp = client.post(
            "/auth/staff/change-password",
            json={"currentPassword": ADMIN_CREDENTIALS[1], "newPassword": "brandNewPassword456"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 204, resp.text

        old_login = client.post("/auth/staff/login", json={"email": ADMIN_CREDENTIALS[0], "password": ADMIN_CREDENTIALS[1]})
        assert old_login.status_code == 401

        new_login = client.post("/auth/staff/login", json={"email": ADMIN_CREDENTIALS[0], "password": "brandNewPassword456"})
        assert new_login.status_code == 200


class TestHospitalChangePassword:
    def test_requires_auth(self, client):
        resp = client.post("/auth/hospital/change-password", json={"currentPassword": "x", "newPassword": "newpassword123"})
        assert resp.status_code == 401

    def test_wrong_current_password_rejected(self, client, hospital1_token):
        resp = client.post(
            "/auth/hospital/change-password",
            json={"currentPassword": "definitely-wrong", "newPassword": "newpassword123"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 400

    def test_new_password_too_short_rejected(self, client, hospital1_token):
        resp = client.post(
            "/auth/hospital/change-password",
            json={"currentPassword": HOSPITAL1_CREDENTIALS[1], "newPassword": "short"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 422

    def test_staff_token_rejected(self, client, admin_token):
        # A valid Bearer token for the wrong role must not be treated as a
        # hospital session -- require_hospital should 403, not touch any row.
        resp = client.post(
            "/auth/hospital/change-password",
            json={"currentPassword": "whatever", "newPassword": "newpassword123"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 403

    def test_correct_current_password_updates_and_new_password_logs_in(self, client, hospital1_token):
        resp = client.post(
            "/auth/hospital/change-password",
            json={"currentPassword": HOSPITAL1_CREDENTIALS[1], "newPassword": "brandNewPassword456"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 204, resp.text

        old_login = client.post("/auth/hospital/login", json={"email": HOSPITAL1_CREDENTIALS[0], "password": HOSPITAL1_CREDENTIALS[1]})
        assert old_login.status_code == 401

        new_login = client.post("/auth/hospital/login", json={"email": HOSPITAL1_CREDENTIALS[0], "password": "brandNewPassword456"})
        assert new_login.status_code == 200
