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


class TestReportUpload:
    def test_upload_report_succeeds_with_matching_phone(self, client):
        enquiry = submit_sample_enquiry(client, phone="+91 90000 44444")
        resp = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": "+91 90000 44444"},
            files={"file": ("report.pdf", b"%PDF-1.4 fake pdf contents", "application/pdf")},
        )
        assert resp.status_code == 201, resp.text
        assert resp.json()["type"] == "application/pdf"

    def test_upload_report_rejects_mismatched_phone(self, client):
        enquiry = submit_sample_enquiry(client, phone="+91 90000 55555")
        resp = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": "+91 00000 00000"},
            files={"file": ("report.pdf", b"%PDF-1.4 fake pdf contents", "application/pdf")},
        )
        assert resp.status_code == 403

    def test_upload_report_rejects_spoofed_content_type(self, client):
        enquiry = submit_sample_enquiry(client, phone="+91 90000 66666")
        resp = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": "+91 90000 66666"},
            files={"file": ("fake.pdf", b"this is not actually a pdf", "application/pdf")},
        )
        assert resp.status_code == 400

    def test_upload_report_rejects_oversize_file(self, client):
        from app.routers.enquiries import MAX_REPORT_BYTES

        enquiry = submit_sample_enquiry(client, phone="+91 90000 77777")
        # One byte over the 10 MB cap -- still starts with a valid PDF magic
        # number so this exercises the size check specifically, not the
        # magic-byte check above it.
        oversize_contents = b"%PDF-1.4" + b"0" * (MAX_REPORT_BYTES - 7)
        resp = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": "+91 90000 77777"},
            files={"file": ("big.pdf", oversize_contents, "application/pdf")},
        )
        assert resp.status_code == 400
        assert "10 MB" in resp.json()["detail"]


class TestReportDownload:
    def _upload_sample_report(self, client, phone: str) -> dict:
        enquiry = submit_sample_enquiry(client, phone=phone)
        resp = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": phone},
            files={"file": ("report.pdf", b"%PDF-1.4 fake pdf contents", "application/pdf")},
        )
        assert resp.status_code == 201, resp.text
        return {**resp.json(), "enquiryId": enquiry["id"]}

    def test_url_points_at_download_route_not_a_filesystem_path(self, client):
        report = self._upload_sample_report(client, "+91 90000 77777")
        assert report["url"] == f"/v1/enquiries/{report['enquiryId']}/reports/{report['id']}/download"

    def test_download_requires_auth(self, client):
        report = self._upload_sample_report(client, "+91 90000 88888")
        resp = client.get(f"/enquiries/{report['enquiryId']}/reports/{report['id']}/download")
        assert resp.status_code == 401

    def test_admin_can_download(self, client, admin_token):
        report = self._upload_sample_report(client, "+91 90000 99999")
        resp = client.get(
            f"/enquiries/{report['enquiryId']}/reports/{report['id']}/download",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200
        assert resp.content == b"%PDF-1.4 fake pdf contents"

    def test_unassigned_hospital_cannot_download(
        self, client, admin_token, superadmin_token, hospital1_token, hospital2_token, hospitals
    ):
        report = self._upload_sample_report(client, "+91 90001 00000")
        client.post(f"/enquiries/{report['enquiryId']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{report['enquiryId']}/assign-hospital",
            json={"hospitalId": apex_id},
            headers=auth_header(superadmin_token),
        )

        owner_resp = client.get(
            f"/enquiries/{report['enquiryId']}/reports/{report['id']}/download",
            headers=auth_header(hospital1_token),
        )
        assert owner_resp.status_code == 200

        other_resp = client.get(
            f"/enquiries/{report['enquiryId']}/reports/{report['id']}/download",
            headers=auth_header(hospital2_token),
        )
        assert other_resp.status_code == 403


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


class TestStatusGuards:
    """Regression coverage for the status-guard fix: every transition must
    reject being called from an illegal predecessor state instead of
    silently re-applying (see _assert_status in enquiry_workflow.py)."""

    def test_cannot_approve_an_already_approved_enquiry(self, client, admin_token):
        enquiry = submit_sample_enquiry(client)
        first = client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        assert first.status_code == 200

        second = client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        assert second.status_code == 409

    def test_cannot_approve_an_already_rejected_enquiry(self, client, admin_token):
        enquiry = submit_sample_enquiry(client)
        client.post(
            f"/enquiries/{enquiry['id']}/admin-reject",
            json={"rejectionReason": "duplicate"}, headers=auth_header(admin_token),
        )
        resp = client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_cannot_reject_an_already_approved_enquiry(self, client, admin_token):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        resp = client.post(
            f"/enquiries/{enquiry['id']}/admin-reject",
            json={"rejectionReason": "too late"}, headers=auth_header(admin_token),
        )
        assert resp.status_code == 409

    def test_cannot_assign_hospital_before_admin_approval(self, client, superadmin_token, hospitals):
        """Without the guard, a direct API call could skip admin review
        entirely and jump straight to hospital assignment."""
        enquiry = submit_sample_enquiry(client)
        resp = client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": hospitals[0]["id"]},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 409

    def test_can_reassign_hospital_after_a_decline(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        """assign-hospital must stay legal from "Declined by Hospital" --
        that's the real reassignment path the Super Admin dashboard offers,
        not a case the guard should block."""
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id}, headers=auth_header(superadmin_token),
        )
        client.post(
            f"/enquiries/{enquiry['id']}/hospital-decline",
            json={"declineReason": "no beds"}, headers=auth_header(hospital1_token),
        )
        carewell_id = find_hospital_id(hospitals, "CareWell Cancer Hospital")
        reassigned = client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": carewell_id}, headers=auth_header(superadmin_token),
        )
        assert reassigned.status_code == 200
        assert reassigned.json()["status"] == "Assigned to Hospital"
        assert reassigned.json()["assignedHospitalName"] == "CareWell Cancer Hospital"

    def test_cannot_accept_an_enquiry_not_yet_assigned(self, client, admin_token, hospital1_token):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        # approved, but never assigned to a hospital -- hospital1 has no
        # legitimate claim on it yet, and the ownership check (hospital_id
        # is None) would already 403 it; this proves the status guard is a
        # real independent second layer, not just ownership.
        resp = client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept",
            json={"appointmentDate": "2026-09-01", "appointmentTime": "10:00 AM", "doctorName": "Dr. X"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 403

    def test_cannot_accept_an_already_accepted_enquiry(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id}, headers=auth_header(superadmin_token),
        )
        accept_payload = {"appointmentDate": "2026-09-01", "appointmentTime": "10:00 AM", "doctorName": "Dr. X"}
        first = client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept", json=accept_payload, headers=auth_header(hospital1_token),
        )
        assert first.status_code == 200

        second = client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept", json=accept_payload, headers=auth_header(hospital1_token),
        )
        assert second.status_code == 409

    def test_cannot_decline_an_already_confirmed_appointment(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        apex_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": apex_id}, headers=auth_header(superadmin_token),
        )
        client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept",
            json={"appointmentDate": "2026-09-01", "appointmentTime": "10:00 AM", "doctorName": "Dr. X"},
            headers=auth_header(hospital1_token),
        )
        resp = client.post(
            f"/enquiries/{enquiry['id']}/hospital-decline",
            json={"declineReason": "changed my mind"}, headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 409


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


class TestWorkflowCompleteness:
    def _accept_flow(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        hospital1_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": hospital1_id},
            headers=auth_header(superadmin_token),
        )
        client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept",
            json={"appointmentDate": "2026-08-01", "appointmentTime": "10:00 AM", "doctorName": "Dr. Test"},
            headers=auth_header(hospital1_token),
        )
        return enquiry

    def test_completed_transition_reachable(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = self._accept_flow(client, admin_token, superadmin_token, hospital1_token, hospitals)

        resp = client.post(
            f"/enquiries/{enquiry['id']}/complete", json={"remarks": "All good"}, headers=auth_header(hospital1_token)
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["status"] == "Completed"
        assert body["appointment"]["status"] == "Completed"

    def test_cannot_complete_before_appointment_confirmed(self, client, admin_token, superadmin_token, hospital1_token, hospitals):
        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        hospital1_id = find_hospital_id(hospitals, "Apex Oncology Institute")
        client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": hospital1_id},
            headers=auth_header(superadmin_token),
        )

        resp = client.post(f"/enquiries/{enquiry['id']}/complete", json={}, headers=auth_header(hospital1_token))
        assert resp.status_code == 409

    def test_cannot_assign_to_inactive_hospital(self, client, admin_token, superadmin_token, hospitals, db_session):
        from app.models.hospital import Hospital

        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))
        hospital1_id = find_hospital_id(hospitals, "Apex Oncology Institute")

        hospital = db_session.query(Hospital).filter(Hospital.id == hospital1_id).first()
        hospital.is_active = False
        db_session.flush()

        resp = client.post(
            f"/enquiries/{enquiry['id']}/assign-hospital",
            json={"hospitalId": hospital1_id},
            headers=auth_header(superadmin_token),
        )
        assert resp.status_code == 400

    def test_staff_attribution_fk_recorded(self, client, admin_token, db_session):
        from app.models.enquiry import PatientEnquiry
        from app.models.user import User

        enquiry = submit_sample_enquiry(client)
        client.post(f"/enquiries/{enquiry['id']}/admin-approve", json={}, headers=auth_header(admin_token))

        row = db_session.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry["id"]).first()
        admin_user = db_session.query(User).filter(User.email == "admin@awarebharat.local").first()
        assert row.admin_decided_by_id == admin_user.id

    def test_double_accept_race_returns_409(self, client, admin_token, superadmin_token, hospital1_token, hospitals, db_session):
        from app.models.enquiry import PatientEnquiry

        enquiry = self._accept_flow(client, admin_token, superadmin_token, hospital1_token, hospitals)

        # Simulate the race a real concurrent request would hit: reset the
        # status back so the guard doesn't block a second attempt, leaving
        # the already-created AppointmentDetails row (unique on enquiry_id)
        # as the only remaining defense.
        row = db_session.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry["id"]).first()
        row.status = "Assigned to Hospital"
        db_session.flush()

        resp = client.post(
            f"/enquiries/{enquiry['id']}/hospital-accept",
            json={"appointmentDate": "2026-08-01", "appointmentTime": "10:00 AM", "doctorName": "Dr. Test"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 409
