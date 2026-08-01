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
