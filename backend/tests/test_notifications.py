from tests.conftest import auth_header, submit_sample_enquiry


def find_hospital_id(hospitals: list[dict], name: str) -> str:
    return next(h for h in hospitals if h["name"] == name)["id"]


class TestNotificationIdor:
    def test_hospital_cannot_mark_read_another_hospitals_notification(
        self, client, admin_token, superadmin_token, hospital1_token, hospital2_token, hospitals
    ):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        hospital1_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": hospital1_id},
            headers=auth_header(superadmin_token),
        )

        notifications = client.get("/notifications", headers=auth_header(hospital1_token)).json()
        target = next(n for n in notifications if n["enquiryId"] == enquiry["enquiryId"])

        resp = client.post(f"/notifications/{target['id']}/read", headers=auth_header(hospital2_token))
        assert resp.status_code == 403

        resp_owner = client.post(f"/notifications/{target['id']}/read", headers=auth_header(hospital1_token))
        assert resp_owner.status_code == 200
        assert resp_owner.json()["read"] is True


class TestNotificationList:
    def test_list_requires_auth(self, client):
        resp = client.get("/notifications")
        assert resp.status_code == 401

    def test_admin_sees_new_enquiry_notification(self, client, admin_token):
        resp = client.post("/enquiries", json={
            "patientName": "Notif Test Patient", "age": 30, "gender": "Male",
            "phone": "+91 90000 15151", "city": "Pune", "reason": "Free Cancer Screening",
        })
        assert resp.status_code == 201
        enquiry_id = resp.json()["enquiryId"]

        notifications = client.get("/notifications", headers=auth_header(admin_token)).json()
        assert any(n["enquiryId"] == enquiry_id for n in notifications)

    def test_hospital_only_sees_own_notifications(self, client, admin_token, superadmin_token, hospital1_token, hospital2_token, hospitals):
        enquiry = submit_sample_enquiry(client, phone="+91 90000 16161")
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id},
            headers=auth_header(superadmin_token),
        )

        hosp1_notifications = client.get("/notifications", headers=auth_header(hospital1_token)).json()
        hosp2_notifications = client.get("/notifications", headers=auth_header(hospital2_token)).json()
        assert any(n["enquiryId"] == enquiry["enquiryId"] for n in hosp1_notifications)
        assert not any(n["enquiryId"] == enquiry["enquiryId"] for n in hosp2_notifications)

    def test_limit_param_is_respected(self, client, admin_token):
        resp = client.get("/notifications?limit=1", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert len(resp.json()) <= 1


class TestNotificationReadState:
    def test_mark_read_is_per_recipient_not_shared_by_role(self, client, admin_token):
        from tests.test_volunteers import register_and_approve_volunteer

        v1 = register_and_approve_volunteer(client, admin_token, email="reader1@example.com", phone="+91 90000 17171")
        v2 = register_and_approve_volunteer(client, admin_token, email="reader2@example.com", phone="+91 90000 18181")
        v1_token = client.post("/auth/volunteer/login", json={"email": "reader1@example.com", "password": v1["password"]}).json()["accessToken"]
        v2_token = client.post("/auth/volunteer/login", json={"email": "reader2@example.com", "password": v2["password"]}).json()["accessToken"]

        client.post(
            "/notifications/broadcast",
            json={"audience": "Volunteers", "title": "Shared Broadcast", "message": "one row, two recipients"},
            headers=auth_header(admin_token),
        )

        v1_notifs = client.get("/notifications", headers=auth_header(v1_token)).json()
        target = next(n for n in v1_notifs if n["title"] == "Shared Broadcast")
        assert target["read"] is False

        resp = client.post(f"/notifications/{target['id']}/read", headers=auth_header(v1_token))
        assert resp.status_code == 200
        assert resp.json()["read"] is True

        # v1 marking it read must not affect v2 -- they share the same
        # underlying Notification row (one per role-broadcast), so this is
        # exactly the bug the NotificationRead table exists to prevent.
        v1_after = next(n for n in client.get("/notifications", headers=auth_header(v1_token)).json() if n["id"] == target["id"])
        v2_after = next(n for n in client.get("/notifications", headers=auth_header(v2_token)).json() if n["id"] == target["id"])
        assert v1_after["read"] is True
        assert v2_after["read"] is False

    def test_marking_read_twice_is_idempotent(self, client, admin_token):
        from tests.test_volunteers import register_and_approve_volunteer

        v1 = register_and_approve_volunteer(client, admin_token, email="reader3@example.com", phone="+91 90000 19191")
        v1_token = client.post("/auth/volunteer/login", json={"email": "reader3@example.com", "password": v1["password"]}).json()["accessToken"]

        client.post(
            "/notifications/broadcast",
            json={"audience": "Volunteers", "title": "Idempotent Test", "message": "m"},
            headers=auth_header(admin_token),
        )
        target = next(n for n in client.get("/notifications", headers=auth_header(v1_token)).json() if n["title"] == "Idempotent Test")

        first = client.post(f"/notifications/{target['id']}/read", headers=auth_header(v1_token))
        second = client.post(f"/notifications/{target['id']}/read", headers=auth_header(v1_token))
        assert first.status_code == 200
        assert second.status_code == 200
        assert second.json()["read"] is True


class TestNotificationBroadcast:
    def test_requires_staff_auth(self, client):
        resp = client.post("/notifications/broadcast", json={"audience": "Volunteers", "title": "t", "message": "m"})
        assert resp.status_code == 401

    def test_hospital_role_cannot_broadcast(self, client, hospital1_token):
        resp = client.post(
            "/notifications/broadcast",
            json={"audience": "Volunteers", "title": "t", "message": "m"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403

    def test_admin_can_broadcast_to_volunteers(self, client, admin_token):
        from tests.test_volunteers import register_sample_volunteer
        register_sample_volunteer(client, email="broadcast.recipient@example.com")
        login = client.post("/auth/volunteer/login", json={"email": "broadcast.recipient@example.com", "password": "SuperSecret123"})
        # Volunteer is Pending Approval and can't log in yet -- broadcast delivery is
        # role-based (see AUDIENCE_ROLES), not per-recipient, so this only proves the
        # write side; recipient-side visibility is covered by test_list below.
        assert login.status_code == 403

        resp = client.post(
            "/notifications/broadcast",
            json={"audience": "Volunteers", "title": "Announcement", "message": "Broadcast test"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 201, resp.text
        assert resp.json()["recipientCount"] == 1

    def test_broadcast_to_hospitals_fans_out_per_hospital(self, client, superadmin_token, hospital1_token, hospital2_token):
        resp = client.post(
            "/notifications/broadcast",
            json={"audience": "Hospitals", "title": "Policy Update", "message": "New guidelines"},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 201, resp.text
        assert resp.json()["recipientCount"] >= 2

        hosp1 = client.get("/notifications", headers=auth_header(hospital1_token)).json()
        hosp2 = client.get("/notifications", headers=auth_header(hospital2_token)).json()
        assert any(n["title"] == "Policy Update" for n in hosp1)
        assert any(n["title"] == "Policy Update" for n in hosp2)

    def test_all_users_audience_reaches_admin(self, client, admin_token, superadmin_token):
        resp = client.post(
            "/notifications/broadcast",
            json={"audience": "All Users", "title": "System Notice", "message": "Everyone sees this"},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 201, resp.text

        admin_notifs = client.get("/notifications", headers=auth_header(admin_token)).json()
        assert any(n["title"] == "System Notice" for n in admin_notifs)
