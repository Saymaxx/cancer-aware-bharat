from tests.conftest import auth_header


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
