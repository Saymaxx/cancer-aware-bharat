class TestSecurityHeaders:
    def test_headers_present_on_api_response(self, client):
        resp = client.get("/hospitals")
        assert resp.headers["X-Content-Type-Options"] == "nosniff"
        assert resp.headers["X-Frame-Options"] == "DENY"
        assert resp.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "Strict-Transport-Security" in resp.headers
        assert resp.headers["Content-Security-Policy"] == "default-src 'none'; frame-ancestors 'none'"

    def test_csp_excluded_on_docs_so_swagger_ui_still_loads(self, client):
        resp = client.get("/docs")
        assert resp.status_code == 200
        assert "Content-Security-Policy" not in resp.headers
        # Other headers still apply even on docs.
        assert resp.headers["X-Frame-Options"] == "DENY"
