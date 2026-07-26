from tests.conftest import auth_header, submit_sample_enquiry


def find_hospital_id(hospitals: list[dict], name: str) -> str:
    match = next(h for h in hospitals if h["name"] == name)
    return match["id"]


class TestSubmission:
    def test_submit_creates_enquiry_pending_admin_review(self, client):
        enquiry = submit_sample_enquiry(client)
        assert enquiry["status"] == "Pending Admin Review"
        assert enquiry["enquiryId"].startswith("ENQ-")
        assert enquiry["referenceNumber"].startswith("PAT-")
        assert len(enquiry["timeline"]) == 1
        assert enquiry["timeline"][0]["stage"] == "Patient Submitted"

    def test_priority_inferred_urgent_from_symptoms(self, client):
        enquiry = submit_sample_enquiry(client, symptoms="painless lump noticed 2 weeks ago")
        assert enquiry["priority"] == "Urgent"

    def test_priority_defaults_normal(self, client):
        enquiry = submit_sample_enquiry(client, symptoms="routine annual checkup")
        assert enquiry["priority"] == "Normal"

    def test_missing_required_field_rejected(self, client):
        resp = client.post("/enquiries", json={"age": 40, "gender": "Female", "phone": "123", "city": "Pune", "reason": "x"})
        assert resp.status_code == 422

    def test_lookup_by_reference_and_phone(self, client):
        enquiry = submit_sample_enquiry(client, phone="+91 90000 22222")
        resp = client.post("/enquiries/lookup", json={
            "referenceNumber": enquiry["referenceNumber"],
            "phone": "+91 90000 22222",
        })
        assert resp.status_code == 200
        assert resp.json()["enquiryId"] == enquiry["enquiryId"]

    def test_lookup_wrong_phone_returns_404(self, client):
        enquiry = submit_sample_enquiry(client, phone="+91 90000 33333")
        resp = client.post("/enquiries/lookup", json={
            "referenceNumber": enquiry["referenceNumber"],
            "phone": "+91 00000 00000",
        })
        assert resp.status_code == 404


class TestAuthAndRoleGuards:
    def test_list_enquiries_requires_auth(self, client):
        resp = client.get("/enquiries")
        assert resp.status_code == 401

    def test_admin_approve_requires_admin_or_superadmin(self, client, admin_token, hospital1_token):
        enquiry = submit_sample_enquiry(client)
        resp = client.post(
            f"/enquiries/{enquiry['id']}/admin-approve",
            json={}, headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403

    def test_assign_hospital_requires_superadmin_not_admin(self, client, admin_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        resp = client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": hospitals[0]["id"]},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 403

    def test_hospital_cannot_act_on_enquiry_assigned_to_another_hospital(self, client, admin_token, superadmin_token, hospital2_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id},
            headers=auth_header(superadmin_token),
        )
        # hospital2 (CareWell) tries to accept a patient assigned to hospital1 (Apex)
        resp = client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept",
            json={"appointmentDate": "2026-09-01", "appointmentTime": "10:00 AM", "doctorName": "Dr. X"},
            headers=auth_header(hospital2_token),
        )
        assert resp.status_code == 403


class TestFullWorkflow:
    def test_happy_path_submit_to_appointment_confirmed(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = submit_sample_enquiry(client, patientName="Full Flow Patient")

        approved = client.post(
            f"/enquiries/{enquiry['id']}/admin-approve",
            json={"remarks": "verified"}, headers=auth_header(admin_token),
        )
        assert approved.status_code == 200
        assert approved.json()["status"] == "Approved by Admin"

        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        assigned = client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id, "remarks": "good fit"},
            headers=auth_header(superadmin_token),
        )
        assert assigned.status_code == 200
        assert assigned.json()["status"] == "Assigned to Hospital"
        assert assigned.json()["assignedHospitalName"] == "Apex Oncology Institute"

        accepted = client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept",
            json={
                "appointmentDate": "2026-09-10",
                "appointmentTime": "11:30 AM",
                "doctorName": "Dr. Test Oncologist",
                "remarks": "bring reports",
            },
            headers=auth_header(hospital1_token),
        )
        assert accepted.status_code == 200
        body = accepted.json()
        assert body["status"] == "Appointment Confirmed"
        assert body["appointment"]["date"] == "2026-09-10"
        assert body["appointment"]["doctor"] == "Dr. Test Oncologist"

        stages = [t["stage"] for t in body["timeline"]]
        assert stages == [
            "Patient Submitted",
            "Admin Approved",
            "Assigned to Hospital",
            "Hospital Accepted",
            "Appointment Created",
        ]

    def test_admin_reject_path(self, client, admin_token):
        enquiry = submit_sample_enquiry(client)
        resp = client.post(
            f"/enquiries/{enquiry['id']}/admin-reject",
            json={"rejectionReason": "duplicate submission"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Rejected by Admin"

    def test_hospital_decline_returns_to_superadmin_queue(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id},
            headers=auth_header(superadmin_token),
        )
        declined = client.post(
            f"/enquiries/{enquiry['id']}/hospital-decline",
            json={"declineReason": "no oncology bed available"},
            headers=auth_header(hospital1_token),
        )
        assert declined.status_code == 200
        assert declined.json()["status"] == "Declined by Hospital"

    def test_hospital_scoped_list_only_shows_own_enquiries(self, client, admin_token, superadmin_token, hospital1_token, hospital2_token, hospitals):
        enquiry = submit_sample_enquiry(client, patientName="Scoping Test Patient")
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id},
            headers=auth_header(superadmin_token),
        )

        hosp1_list = client.get("/enquiries", headers=auth_header(hospital1_token)).json()
        hosp2_list = client.get("/enquiries", headers=auth_header(hospital2_token)).json()

        assert any(e["id"] == enquiry["id"] for e in hosp1_list)
        assert not any(e["id"] == enquiry["id"] for e in hosp2_list)
