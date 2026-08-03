from tests.conftest import auth_header


def create_sample_record(client, admin_token, **overrides) -> dict:
    payload = {
        "name": "Pytest Patient Case",
        "age": 45,
        "gender": "Female",
        "diagnosis": "Breast Cancer (Stage I)",
        "financialAidStatus": "Not Requested",
        "caseStatus": "Under Treatment",
    }
    payload.update(overrides)
    resp = client.post("/patient-records", json=payload, headers=auth_header(admin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestListPatientRecords:
    def test_requires_staff_auth(self, client):
        resp = client.get("/patient-records")
        assert resp.status_code == 401

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/patient-records", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        create_sample_record(client, admin_token, name="List Visible Patient")
        resp = client.get("/patient-records", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(r["name"] == "List Visible Patient" for r in resp.json())


class TestCreatePatientRecord:
    def test_admin_can_create(self, client, admin_token):
        record = create_sample_record(client, admin_token)
        assert record["recordId"].startswith("CASE-")
        assert record["caseStatus"] == "Under Treatment"
        assert record["financialAidStatus"] == "Not Requested"

    def test_writes_audit_log_entry(self, client, admin_token, db_session):
        from app.models.audit_log import AuditLog

        create_sample_record(client, admin_token)
        entry = db_session.query(AuditLog).filter(AuditLog.event_type == "patient_record_created").first()
        assert entry is not None

    def test_superadmin_can_create(self, client, superadmin_token):
        resp = client.post("/patient-records", json={
            "name": "Superadmin Created Case", "age": 30, "gender": "Male", "diagnosis": "Oral Cavity Cancer",
        }, headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text

    def test_hospital_role_cannot_create(self, client, hospital1_token):
        resp = client.post("/patient-records", json={
            "name": "X", "age": 30, "gender": "Male", "diagnosis": "X",
        }, headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_rejects_invalid_financial_aid_status(self, client, admin_token):
        resp = client.post("/patient-records", json={
            "name": "X", "age": 30, "gender": "Male", "diagnosis": "X",
            "financialAidStatus": "Made Up Status",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 422

    def test_hospital_id_and_name_stored(self, client, admin_token, hospitals):
        hospital = hospitals[0]
        record = create_sample_record(client, admin_token, hospitalId=hospital["id"], hospitalName=hospital["name"])
        assert record["hospitalId"] == hospital["id"]
        assert record["hospitalName"] == hospital["name"]


class TestUpdatePatientRecord:
    def test_admin_can_update(self, client, admin_token):
        record = create_sample_record(client, admin_token, name="Original Name")
        resp = client.patch(f"/patient-records/{record['id']}", json={
            "name": "Updated Name", "age": 46, "gender": "Female", "diagnosis": "Breast Cancer (Stage II)",
            "financialAidStatus": "Approved", "financialAidAmount": 50000, "caseStatus": "Recovered",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["name"] == "Updated Name"
        assert body["caseStatus"] == "Recovered"
        assert body["financialAidAmount"] == 50000

    def test_update_nonexistent_404s(self, client, admin_token):
        resp = client.patch(
            "/patient-records/00000000-0000-0000-0000-000000000000",
            json={"name": "X", "age": 30, "gender": "Male", "diagnosis": "X"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404


class TestDeletePatientRecord:
    def test_admin_can_delete(self, client, admin_token):
        record = create_sample_record(client, admin_token, name="To Be Deleted")
        resp = client.delete(f"/patient-records/{record['id']}", headers=auth_header(admin_token))
        assert resp.status_code == 204

        listing = client.get("/patient-records", headers=auth_header(admin_token)).json()
        assert not any(r["id"] == record["id"] for r in listing)

    def test_delete_nonexistent_404s(self, client, admin_token):
        resp = client.delete(
            "/patient-records/00000000-0000-0000-0000-000000000000",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404


class TestListMyPatientRecords:
    def test_requires_hospital_auth(self, client):
        resp = client.get("/patient-records/mine")
        assert resp.status_code == 401

    def test_only_shows_own_hospitals_records(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        create_sample_record(client, admin_token, name="Assigned To H1", hospitalId=hospitals[0]["id"])

        resp1 = client.get("/patient-records/mine", headers=auth_header(hospital1_token))
        assert resp1.status_code == 200
        assert any(r["name"] == "Assigned To H1" for r in resp1.json())

        resp2 = client.get("/patient-records/mine", headers=auth_header(hospital2_token))
        assert resp2.status_code == 200
        assert not any(r["name"] == "Assigned To H1" for r in resp2.json())

    def test_unassigned_records_are_invisible_to_hospitals(self, client, admin_token, hospital1_token):
        create_sample_record(client, admin_token, name="Not Assigned Anywhere")
        resp = client.get("/patient-records/mine", headers=auth_header(hospital1_token))
        assert not any(r["name"] == "Not Assigned Anywhere" for r in resp.json())

    def test_new_record_defaults(self, client, admin_token, hospital1_token, hospitals):
        create_sample_record(client, admin_token, name="Fresh Intake", hospitalId=hospitals[0]["id"])
        resp = client.get("/patient-records/mine", headers=auth_header(hospital1_token))
        record = next(r for r in resp.json() if r["name"] == "Fresh Intake")
        assert record["treatmentStatus"] == "Under Review"
        assert record["prescriptionUploaded"] is False
        assert record["reportsCount"] == 0
        assert record["remarks"] == ""


class TestUpdateMyPatientRecord:
    def test_updates_status_and_remarks(self, client, admin_token, hospital1_token, hospitals):
        record = create_sample_record(client, admin_token, name="Editable Patient", hospitalId=hospitals[0]["id"])
        resp = client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"treatmentStatus": "Under Treatment", "remarks": "Started chemo cycle 1", "cancerStage": "Stage II"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["treatmentStatus"] == "Under Treatment"
        assert body["remarks"] == "Started chemo cycle 1"
        assert body["cancerStage"] == "Stage II"

    def test_partial_update_leaves_other_fields_untouched(self, client, admin_token, hospital1_token, hospitals):
        record = create_sample_record(client, admin_token, name="Partial Update Patient", hospitalId=hospitals[0]["id"])
        client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"remarks": "First note"},
            headers=auth_header(hospital1_token),
        )
        resp = client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"treatmentStatus": "Completed"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["treatmentStatus"] == "Completed"
        assert body["remarks"] == "First note"

    def test_assigns_own_doctor(self, client, admin_token, hospital1_token, hospitals):
        doctor_resp = client.post("/hospital-doctors/mine", json={
            "name": "Dr. Test Assignee", "specialty": "Oncology", "qualification": "MD",
            "experienceYears": 5, "phone": "+91 90000 00000", "email": "dr.assignee@example.com",
        }, headers=auth_header(hospital1_token))
        assert doctor_resp.status_code == 201, doctor_resp.text
        doctor = doctor_resp.json()

        record = create_sample_record(client, admin_token, name="Doctor Assignment Patient", hospitalId=hospitals[0]["id"])
        resp = client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"assignedDoctorId": doctor["id"]},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["assignedDoctorId"] == doctor["id"]
        assert body["assignedDoctorName"] == "Dr. Test Assignee"

    def test_cannot_assign_another_hospitals_doctor(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        doctor_resp = client.post("/hospital-doctors/mine", json={
            "name": "Dr. Other Hospital", "specialty": "Oncology", "qualification": "MD",
            "experienceYears": 5, "phone": "+91 90000 00001", "email": "dr.other@example.com",
        }, headers=auth_header(hospital2_token))
        doctor = doctor_resp.json()

        record = create_sample_record(client, admin_token, name="Cross Hospital Doctor Patient", hospitalId=hospitals[0]["id"])
        resp = client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"assignedDoctorId": doctor["id"]},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 404

    def test_rejects_invalid_treatment_status(self, client, admin_token, hospital1_token, hospitals):
        record = create_sample_record(client, admin_token, name="Bad Status Patient", hospitalId=hospitals[0]["id"])
        resp = client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"treatmentStatus": "Made Up Status"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 422

    def test_cannot_update_another_hospitals_record(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        record = create_sample_record(client, admin_token, name="H1 Only Patient", hospitalId=hospitals[0]["id"])
        resp = client.patch(
            f"/patient-records/mine/{record['id']}",
            json={"remarks": "Should not work"},
            headers=auth_header(hospital2_token),
        )
        assert resp.status_code == 404

    def test_update_nonexistent_404s(self, client, hospital1_token):
        resp = client.patch(
            "/patient-records/mine/00000000-0000-0000-0000-000000000000",
            json={"remarks": "X"},
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 404
