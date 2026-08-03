from tests.conftest import auth_header


def _create_patient_record(client, admin_token, hospital_id, **overrides):
    payload = {
        "name": "Report Test Patient",
        "age": 42,
        "gender": "Female",
        "diagnosis": "Breast Cancer",
        "hospitalId": hospital_id,
        **overrides,
    }
    resp = client.post("/patient-records", json=payload, headers=auth_header(admin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


def _upload(client, token, record_id, **overrides):
    data = {
        "patientRecordId": record_id,
        "reportType": "Lab Test",
        **overrides,
    }
    files = {"file": ("report.pdf", b"%PDF-1.4 fake pdf contents", "application/pdf")}
    return client.post("/hospital-reports/mine", data=data, files=files, headers=auth_header(token))


class TestUploadMyReport:
    def test_requires_hospital_auth(self, client):
        resp = client.post("/hospital-reports/mine", data={}, files={})
        assert resp.status_code == 401

    def test_uploads_successfully(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        resp = _upload(client, hospital1_token, record["id"], reportType="Biopsy")
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["reportType"] == "Biopsy"
        assert body["fileType"] == "application/pdf"
        assert body["patientName"] == "Report Test Patient"
        assert body["patientRecordId"] == record["id"]

    def test_prescription_upload_flips_patient_flag(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        resp = _upload(client, hospital1_token, record["id"], reportType="Prescription")
        assert resp.status_code == 201, resp.text

        listing = client.get("/patient-records/mine", headers=auth_header(hospital1_token)).json()
        updated = next(r for r in listing if r["id"] == record["id"])
        assert updated["prescriptionUploaded"] is True

    def test_non_prescription_upload_leaves_flag_false(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        _upload(client, hospital1_token, record["id"], reportType="Lab Test")

        listing = client.get("/patient-records/mine", headers=auth_header(hospital1_token)).json()
        updated = next(r for r in listing if r["id"] == record["id"])
        assert updated["prescriptionUploaded"] is False

    def test_cannot_upload_for_another_hospitals_patient(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        resp = _upload(client, hospital2_token, record["id"])
        assert resp.status_code == 404

    def test_rejects_invalid_report_type(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        resp = _upload(client, hospital1_token, record["id"], reportType="Not A Real Type")
        assert resp.status_code == 422

    def test_rejects_spoofed_content_type(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        data = {"patientRecordId": record["id"], "reportType": "Lab Test"}
        files = {"file": ("fake.pdf", b"this is not actually a pdf", "application/pdf")}
        resp = client.post("/hospital-reports/mine", data=data, files=files, headers=auth_header(hospital1_token))
        assert resp.status_code == 400

    def test_rejects_oversize_file(self, client, admin_token, hospital1_token, hospitals):
        from app.core.storage import MAX_REPORT_BYTES

        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        oversize_contents = b"%PDF-1.4" + b"0" * (MAX_REPORT_BYTES - 7)
        data = {"patientRecordId": record["id"], "reportType": "Lab Test"}
        files = {"file": ("big.pdf", oversize_contents, "application/pdf")}
        resp = client.post("/hospital-reports/mine", data=data, files=files, headers=auth_header(hospital1_token))
        assert resp.status_code == 400

    def test_assigns_uploading_doctor_scoped_to_hospital(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        other_doctor = client.post("/hospital-doctors/mine", json={
            "name": "Dr. Wrong Hospital", "specialty": "Oncology", "qualification": "MD",
            "experienceYears": 5, "phone": "+91 90000 00002", "email": "wrong@example.com",
        }, headers=auth_header(hospital2_token)).json()

        resp = _upload(client, hospital1_token, record["id"], uploadedByDoctorId=other_doctor["id"])
        assert resp.status_code == 404


class TestListMyReports:
    def test_requires_hospital_auth(self, client):
        resp = client.get("/hospital-reports/mine")
        assert resp.status_code == 401

    def test_only_shows_own_hospitals_reports(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        _upload(client, hospital1_token, record["id"])

        resp1 = client.get("/hospital-reports/mine", headers=auth_header(hospital1_token))
        assert len(resp1.json()) == 1

        resp2 = client.get("/hospital-reports/mine", headers=auth_header(hospital2_token))
        assert resp2.json() == []

    def test_filters_by_patient_record_id(self, client, admin_token, hospital1_token, hospitals):
        record1 = _create_patient_record(client, admin_token, hospitals[0]["id"], name="Patient One")
        record2 = _create_patient_record(client, admin_token, hospitals[0]["id"], name="Patient Two")
        _upload(client, hospital1_token, record1["id"])
        _upload(client, hospital1_token, record2["id"])

        resp = client.get(f"/hospital-reports/mine?patientRecordId={record1['id']}", headers=auth_header(hospital1_token))
        results = resp.json()
        assert len(results) == 1
        assert results[0]["patientRecordId"] == record1["id"]


class TestDownloadMyReport:
    def test_downloads_own_report(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        report = _upload(client, hospital1_token, record["id"]).json()

        resp = client.get(f"/hospital-reports/mine/{report['id']}/download", headers=auth_header(hospital1_token))
        assert resp.status_code == 200
        assert resp.content == b"%PDF-1.4 fake pdf contents"

    def test_cannot_download_another_hospitals_report(self, client, admin_token, hospital1_token, hospital2_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        report = _upload(client, hospital1_token, record["id"]).json()

        resp = client.get(f"/hospital-reports/mine/{report['id']}/download", headers=auth_header(hospital2_token))
        assert resp.status_code == 404

    def test_download_nonexistent_404s(self, client, hospital1_token):
        resp = client.get(
            "/hospital-reports/mine/00000000-0000-0000-0000-000000000000/download",
            headers=auth_header(hospital1_token),
        )
        assert resp.status_code == 404


class TestReportsCountOnPatientRecord:
    def test_reflects_real_uploads(self, client, admin_token, hospital1_token, hospitals):
        record = _create_patient_record(client, admin_token, hospitals[0]["id"])
        assert record["reportsCount"] == 0

        _upload(client, hospital1_token, record["id"])
        _upload(client, hospital1_token, record["id"], reportType="Biopsy")

        listing = client.get("/patient-records/mine", headers=auth_header(hospital1_token)).json()
        updated = next(r for r in listing if r["id"] == record["id"])
        assert updated["reportsCount"] == 2
