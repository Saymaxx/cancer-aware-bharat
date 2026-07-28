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
