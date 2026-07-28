from tests.conftest import auth_header


class TestApiVersioning:
    def test_v1_prefix_serves_the_same_routes_as_the_legacy_unprefixed_path(self, client):
        legacy = client.get("/hospitals")
        v1 = client.get("/v1/hospitals")
        assert legacy.status_code == v1.status_code == 200
        assert legacy.json() == v1.json()

    def test_rate_limit_is_shared_across_legacy_and_v1_mounts(self, client):
        # Regression test: dual-mounting the same router at two paths
        # (see main.py) previously let a caller double every rate limit
        # for free by alternating between the unprefixed and /v1 paths,
        # since slowapi's default key_style="url" tracked each mount as a
        # separate bucket. core/limiter.py's key_style="endpoint" fixes
        # this by keying on the view function's identity instead.
        for _ in range(10):
            client.post("/auth/staff/login", json={"email": "nobody@example.com", "password": "wrong"})
        exhausted = client.post("/auth/staff/login", json={"email": "nobody@example.com", "password": "wrong"})
        assert exhausted.status_code == 429

        still_limited = client.post("/v1/auth/staff/login", json={"email": "nobody@example.com", "password": "wrong"})
        assert still_limited.status_code == 429
