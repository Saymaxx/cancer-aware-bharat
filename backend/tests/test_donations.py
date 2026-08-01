from tests.conftest import auth_header


def create_sample_donation(client, admin_token, **overrides) -> dict:
    payload = {
        "donorName": "Pytest Donor",
        "donorType": "Individual",
        "amount": 5000,
        "paymentMethod": "UPI",
    }
    payload.update(overrides)
    resp = client.post("/donations", json=payload, headers=auth_header(admin_token))
    assert resp.status_code == 201, resp.text
    return resp.json()


class TestListDonations:
    def test_requires_staff_auth(self, client):
        resp = client.get("/donations")
        assert resp.status_code == 401

    def test_hospital_role_cannot_list(self, client, hospital1_token):
        resp = client.get("/donations", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_can_list(self, client, admin_token):
        create_sample_donation(client, admin_token, donorName="List Visible Donor")
        resp = client.get("/donations", headers=auth_header(admin_token))
        assert resp.status_code == 200
        assert any(d["donorName"] == "List Visible Donor" for d in resp.json())


class TestCreateDonation:
    def test_admin_can_create(self, client, admin_token):
        donation = create_sample_donation(client, admin_token)
        assert donation["receiptSent"] is False
        assert donation["amount"] == 5000

    def test_writes_audit_log_entry(self, client, admin_token, db_session):
        from app.models.audit_log import AuditLog

        create_sample_donation(client, admin_token)
        entry = db_session.query(AuditLog).filter(AuditLog.event_type == "donation_recorded").first()
        assert entry is not None

    def test_superadmin_can_create(self, client, superadmin_token):
        resp = client.post("/donations", json={
            "donorName": "Superadmin Donor", "donorType": "Corporate", "amount": 100000, "paymentMethod": "Cheque",
        }, headers=auth_header(superadmin_token))
        assert resp.status_code == 201, resp.text

    def test_hospital_role_cannot_create(self, client, hospital1_token):
        resp = client.post("/donations", json={
            "donorName": "X", "donorType": "Individual", "amount": 1000, "paymentMethod": "UPI",
        }, headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_rejects_invalid_donor_type(self, client, admin_token):
        resp = client.post("/donations", json={
            "donorName": "X", "donorType": "Made Up", "amount": 1000, "paymentMethod": "UPI",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 422

    def test_rejects_zero_amount(self, client, admin_token):
        resp = client.post("/donations", json={
            "donorName": "X", "donorType": "Individual", "amount": 0, "paymentMethod": "UPI",
        }, headers=auth_header(admin_token))
        assert resp.status_code == 422


class TestSendReceipt:
    def test_admin_can_send_receipt(self, client, admin_token):
        donation = create_sample_donation(client, admin_token)
        resp = client.post(f"/donations/{donation['id']}/send-receipt", headers=auth_header(admin_token))
        assert resp.status_code == 200, resp.text
        assert resp.json()["receiptSent"] is True

    def test_cannot_send_receipt_twice(self, client, admin_token):
        donation = create_sample_donation(client, admin_token)
        client.post(f"/donations/{donation['id']}/send-receipt", headers=auth_header(admin_token))
        resp = client.post(f"/donations/{donation['id']}/send-receipt", headers=auth_header(admin_token))
        assert resp.status_code == 409

    def test_send_receipt_nonexistent_404s(self, client, admin_token):
        resp = client.post(
            "/donations/00000000-0000-0000-0000-000000000000/send-receipt",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 404
