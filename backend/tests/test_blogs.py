from tests.conftest import auth_header


def sample_blog_payload(**overrides) -> dict:
    payload = {
        "title": "Pytest Blog Article",
        "summary": "A short summary.",
        "content": "Full article content goes here.",
        "author": "Dr. Test Author",
        "date": "2026-08-01",
        "category": "Prevention",
    }
    payload.update(overrides)
    return payload


class TestBlogs:
    def _create_blog(self, db_session):
        from app.models.blog import BlogArticle

        blog = BlogArticle(
            title="Early Detection Saves Lives",
            content="Regular screening catches cancer at its most treatable stage.",
            author="Dr. Neha Sharma",
            date="2026-07-01",
            category="Awareness",
        )
        db_session.add(blog)
        db_session.flush()
        return blog

    def test_list_blogs_is_public(self, client, db_session):
        self._create_blog(db_session)
        resp = client.get("/blogs")
        assert resp.status_code == 200
        assert any(b["title"] == "Early Detection Saves Lives" for b in resp.json())

    def test_get_blog_by_id_succeeds(self, client, db_session):
        blog = self._create_blog(db_session)
        resp = client.get(f"/blogs/{blog.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == str(blog.id)

    def test_get_nonexistent_blog_returns_404(self, client):
        resp = client.get("/blogs/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestCreateBlog:
    def test_requires_staff_auth(self, client):
        resp = client.post("/blogs", json=sample_blog_payload())
        assert resp.status_code == 401

    def test_hospital_role_cannot_create(self, client, hospital1_token):
        resp = client.post("/blogs", json=sample_blog_payload(), headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_create(self, client, admin_token):
        resp = client.post("/blogs", json=sample_blog_payload(), headers=auth_header(admin_token))
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["title"] == "Pytest Blog Article"
        assert body["category"] == "Prevention"

    def test_superadmin_can_create(self, client, superadmin_token):
        resp = client.post("/blogs", json=sample_blog_payload(title="Superadmin Blog"), headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text

    def test_rejects_blank_title(self, client, admin_token):
        resp = client.post("/blogs", json=sample_blog_payload(title=""), headers=auth_header(admin_token))
        assert resp.status_code == 422


class TestUpdateBlog:
    def test_admin_can_update(self, client, admin_token):
        created = client.post("/blogs", json=sample_blog_payload(), headers=auth_header(admin_token)).json()
        resp = client.patch(
            f"/blogs/{created['id']}",
            json=sample_blog_payload(title="Updated Title"),
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["title"] == "Updated Title"

    def test_update_nonexistent_404s(self, client, admin_token):
        resp = client.patch(
            "/blogs/00000000-0000-0000-0000-000000000000",
            json=sample_blog_payload(),
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404

    def test_hospital_role_cannot_update(self, client, admin_token, hospital1_token):
        created = client.post("/blogs", json=sample_blog_payload(), headers=auth_header(admin_token)).json()
        resp = client.patch(
            f"/blogs/{created['id']}",
            json=sample_blog_payload(),
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403


class TestDeleteBlog:
    def test_admin_can_delete(self, client, admin_token):
        created = client.post("/blogs", json=sample_blog_payload(), headers=auth_header(admin_token)).json()
        resp = client.delete(f"/blogs/{created['id']}", headers=auth_header(admin_token))
        assert resp.status_code == 204
        assert client.get(f"/blogs/{created['id']}").status_code == 404

    def test_delete_nonexistent_404s(self, client, admin_token):
        resp = client.delete("/blogs/00000000-0000-0000-0000-000000000000", headers=auth_header(admin_token))
        assert resp.status_code == 404

    def test_hospital_role_cannot_delete(self, client, admin_token, hospital1_token):
        created = client.post("/blogs", json=sample_blog_payload(), headers=auth_header(admin_token)).json()
        resp = client.delete(f"/blogs/{created['id']}", headers=auth_header(hospital1_token))
        assert resp.status_code == 403
