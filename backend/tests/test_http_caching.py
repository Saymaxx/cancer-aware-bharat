from tests.conftest import auth_header


class TestHttpCaching:
    def test_sensitive_endpoint_defaults_to_no_store(self, client, admin_token):
        resp = client.get("/enquiries", headers=auth_header(admin_token))
        assert resp.headers["Cache-Control"] == "no-store"

    def test_hospitals_list_is_publicly_cacheable(self, client):
        resp = client.get("/hospitals")
        assert resp.headers["Cache-Control"] == "public, max-age=60"

    def test_hospital_detail_is_publicly_cacheable(self, client, hospitals):
        resp = client.get(f"/hospitals/{hospitals[0]['id']}")
        assert resp.headers["Cache-Control"] == "public, max-age=60"

    def test_events_list_is_publicly_cacheable(self, client):
        resp = client.get("/events")
        assert resp.headers["Cache-Control"] == "public, max-age=60"

    def test_blogs_list_is_publicly_cacheable(self, client):
        resp = client.get("/blogs")
        assert resp.headers["Cache-Control"] == "public, max-age=60"
