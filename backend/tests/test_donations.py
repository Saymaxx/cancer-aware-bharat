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


class _FakeRazorpayOrder:
    def create(self, data):
        return {"id": "order_FAKE123"}


class _FakeRazorpayUtility:
    def __init__(self, should_fail=False):
        self.should_fail = should_fail

    def verify_payment_signature(self, params):
        if self.should_fail:
            import razorpay
            raise razorpay.errors.SignatureVerificationError("bad signature")


class _FakeRazorpayClient:
    def __init__(self, should_fail_verification=False):
        self.order = _FakeRazorpayOrder()
        self.utility = _FakeRazorpayUtility(should_fail_verification)


class TestDonationCheckout:
    def test_checkout_503s_when_gateway_not_configured(self, client, monkeypatch):
        from app.core.config import settings
        monkeypatch.setattr(settings, "razorpay_key_id", None)
        monkeypatch.setattr(settings, "razorpay_key_secret", None)

        resp = client.post("/donations/checkout", json={
            "amount": 500, "donorName": "Public Donor", "donorEmail": "donor@example.com",
        })
        assert resp.status_code == 503

    def test_checkout_creates_order_when_configured(self, client, monkeypatch):
        from app.core.config import settings
        import app.routers.donations as donations_module

        monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_fake")
        monkeypatch.setattr(settings, "razorpay_key_secret", "fake_secret")
        monkeypatch.setattr(donations_module, "_razorpay_client", lambda: _FakeRazorpayClient())

        resp = client.post("/donations/checkout", json={
            "amount": 500, "donorName": "Public Donor", "donorEmail": "donor@example.com",
        })
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["orderId"] == "order_FAKE123"
        assert body["amountPaise"] == 50000
        assert body["keyId"] == "rzp_test_fake"

    def test_checkout_rejects_zero_amount(self, client, monkeypatch):
        from app.core.config import settings
        monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_fake")
        monkeypatch.setattr(settings, "razorpay_key_secret", "fake_secret")
        resp = client.post("/donations/checkout", json={
            "amount": 0, "donorName": "X", "donorEmail": "x@example.com",
        })
        assert resp.status_code == 422


class TestDonationVerify:
    def _verify_payload(self, **overrides):
        payload = {
            "razorpayOrderId": "order_FAKE123",
            "razorpayPaymentId": "pay_FAKE456",
            "razorpaySignature": "fake_signature",
            "donorName": "Public Donor",
            "donorEmail": "donor@example.com",
            "donorType": "Individual",
            "amount": 500,
        }
        payload.update(overrides)
        return payload

    def test_verify_503s_when_gateway_not_configured(self, client, monkeypatch):
        from app.core.config import settings
        monkeypatch.setattr(settings, "razorpay_key_id", None)
        monkeypatch.setattr(settings, "razorpay_key_secret", None)
        resp = client.post("/donations/verify", json=self._verify_payload())
        assert resp.status_code == 503

    def test_verify_records_real_donation_on_valid_signature(self, client, monkeypatch, db_session):
        from app.core.config import settings
        import app.routers.donations as donations_module
        from app.models.audit_log import AuditLog

        monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_fake")
        monkeypatch.setattr(settings, "razorpay_key_secret", "fake_secret")
        monkeypatch.setattr(donations_module, "_razorpay_client", lambda: _FakeRazorpayClient())

        resp = client.post("/donations/verify", json=self._verify_payload())
        assert resp.status_code == 201, resp.text
        body = resp.json()
        assert body["donorName"] == "Public Donor"
        assert body["paymentMethod"] == "Razorpay"
        assert body["amount"] == 500

        entry = db_session.query(AuditLog).filter(AuditLog.event_type == "donation_recorded_online").first()
        assert entry is not None

    def test_verify_rejects_bad_signature(self, client, monkeypatch):
        from app.core.config import settings
        import app.routers.donations as donations_module

        monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_fake")
        monkeypatch.setattr(settings, "razorpay_key_secret", "fake_secret")
        monkeypatch.setattr(donations_module, "_razorpay_client", lambda: _FakeRazorpayClient(should_fail_verification=True))

        resp = client.post("/donations/verify", json=self._verify_payload())
        assert resp.status_code == 400

    def test_verify_is_idempotent_on_repeat_payment_id(self, client, monkeypatch):
        from app.core.config import settings
        import app.routers.donations as donations_module

        monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_fake")
        monkeypatch.setattr(settings, "razorpay_key_secret", "fake_secret")
        monkeypatch.setattr(donations_module, "_razorpay_client", lambda: _FakeRazorpayClient())

        first = client.post("/donations/verify", json=self._verify_payload())
        assert first.status_code == 201, first.text
        second = client.post("/donations/verify", json=self._verify_payload())
        assert second.status_code == 201, second.text
        assert first.json()["id"] == second.json()["id"]
