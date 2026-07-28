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
