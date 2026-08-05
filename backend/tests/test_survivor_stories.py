from tests.conftest import auth_header


def submit_sample_story(client, **overrides) -> dict:
    payload = {
        "name": "Pytest Survivor",
        "storyTitle": "Beating the Odds",
        "cancerType": "Breast Cancer",
        "content": "This is my story of early detection and recovery.",
        "inspiration": "My family kept me going.",
        "email": "survivor@example.com",
    }
    payload.update(overrides)
    resp = client.post("/survivor-stories", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestSubmitSurvivorStory:
    def test_public_can_submit_no_auth(self, client):
        story = submit_sample_story(client)
        assert story["status"] == "Pending"
        assert story["blogArticleId"] is None

    def test_rejects_invalid_email(self, client):
        resp = client.post("/survivor-stories", json={
            "name": "X", "storyTitle": "X", "cancerType": "X", "content": "X", "email": "not-an-email",
        })
        assert resp.status_code == 422

    def test_rejects_missing_required_fields(self, client):
        resp = client.post("/survivor-stories", json={"name": "X"})
        assert resp.status_code == 422


class TestListSurvivorStories:
    def test_requires_staff_auth(self, client):
        resp = client.get("/survivor-stories")
        assert resp.status_code == 401

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/survivor-stories", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        submit_sample_story(client, name="List Visible Survivor")
        resp = client.get("/survivor-stories", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(s["name"] == "List Visible Survivor" for s in resp.json())

    def test_filters_by_status(self, client, admin_token):
        story = submit_sample_story(client, name="Filter Status Survivor")
        client.post(f"/survivor-stories/{story['id']}/approve", headers=auth_header(admin_token))

        resp = client.get("/survivor-stories?status=Approved", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert all(s["status"] == "Approved" for s in resp.json())
        assert any(s["name"] == "Filter Status Survivor" for s in resp.json())


class TestApproveSurvivorStory:
    def test_admin_can_approve_and_it_publishes_a_blog(self, client, admin_token):
        story = submit_sample_story(client, name="Approved Survivor", storyTitle="My Journey")
        resp = client.post(f"/survivor-stories/{story['id']}/approve", headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["status"] == "Approved"
        assert body["blogArticleId"] is not None

        blogs = client.get("/blogs").json()
        published = next((b for b in blogs if b["id"] == body["blogArticleId"]), None)
        assert published is not None
        assert published["category"] == "Survivors"
        assert published["title"] == "My Journey"
        assert published["author"] == "Approved Survivor"

    def test_hospital_role_cannot_approve(self, client, hospital1_token):
        resp = client.post(
            "/survivor-stories/00000000-0000-0000-0000-000000000000/approve",
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403

    def test_cannot_approve_twice(self, client, admin_token):
        story = submit_sample_story(client, name="Double Approve Survivor")
        client.post(f"/survivor-stories/{story['id']}/approve", headers=auth_header(admin_token))
        resp = client.post(f"/survivor-stories/{story['id']}/approve", headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_approve_nonexistent_404s(self, client, admin_token):
        resp = client.post(
            "/survivor-stories/00000000-0000-0000-0000-000000000000/approve",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404


class TestRejectSurvivorStory:
    def test_admin_can_reject_with_reason(self, client, admin_token):
        story = submit_sample_story(client, name="Rejected Survivor")
        resp = client.post(
            f"/survivor-stories/{story['id']}/reject",
            json={"reason": "Needs more medical detail verification."},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["status"] == "Rejected"
        assert body["rejectionReason"] == "Needs more medical detail verification."
        assert body["blogArticleId"] is None

    def test_reject_without_reason_is_optional(self, client, admin_token):
        story = submit_sample_story(client, name="Reject No Reason Survivor")
        resp = client.post(f"/survivor-stories/{story['id']}/reject", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text

    def test_cannot_reject_twice(self, client, admin_token):
        story = submit_sample_story(client, name="Double Reject Survivor")
        client.post(f"/survivor-stories/{story['id']}/reject", json={}, headers=auth_header(admin_token))
        resp = client.post(f"/survivor-stories/{story['id']}/reject", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 409
