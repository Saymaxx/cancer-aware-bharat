import logging

from tests.conftest import auth_header, extract_otp_code, submit_sample_enquiry

PATIENT_PAYLOAD = {
    "name": "Pytest Patient Account",
    "email": "pytest.patient@example.com",
    "phone": "+91 90000 12121",
    "password": "correct-horse-battery",
}


def register_patient(client, **overrides) -> dict:
    payload = {**PATIENT_PAYLOAD, **overrides}
    resp = client.post("/patients/register", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


def register_and_verify(client, caplog, **overrides) -> dict:
    """Returns the login TokenOut dict (accessToken/role/name) for a freshly
    registered + verified patient."""
    payload = {**PATIENT_PAYLOAD, **overrides}
    with caplog.at_level(logging.INFO):
        register_patient(client, **payload)
        code = extract_otp_code(caplog.text, email=payload["email"])
    resp = client.post("/patients/verify-email", json={"email": payload["email"], "code": code})
    assert resp.status_code == 200, resp.text
    return resp.json()


class TestRegistration:
    def test_register_creates_unverified_patient(self, client):
        patient = register_patient(client)
        assert patient["emailVerified"] is False
        assert patient["patientRefId"].startswith("PT-")

    def test_register_rejects_duplicate_email(self, client):
        register_patient(client, email="dupe.patient@example.com")
        resp = client.post("/patients/register", json={**PATIENT_PAYLOAD, "email": "dupe.patient@example.com"})
        assert resp.status_code == 409

    def test_register_rejects_short_password(self, client):
        resp = client.post("/patients/register", json={**PATIENT_PAYLOAD, "email": "short.pw@example.com", "password": "short"})
        assert resp.status_code == 422


class TestEmailVerificationAndLogin:
    def test_login_blocked_before_verification(self, client):
        register_patient(client, email="unverified@example.com")
        resp = client.post("/auth/patient/login", json={"email": "unverified@example.com", "password": PATIENT_PAYLOAD["password"]})
        assert resp.status_code == 403

    def test_verify_email_wrong_code_rejected(self, client):
        register_patient(client, email="wrongcode@example.com")
        resp = client.post("/patients/verify-email", json={"email": "wrongcode@example.com", "code": "000000"})
        assert resp.status_code == 400

    def test_verify_email_succeeds_and_returns_token(self, client, caplog):
        token = register_and_verify(client, caplog, email="verifyok@example.com")
        assert token["role"] == "patient"
        assert token["accessToken"]

    def test_login_succeeds_after_verification(self, client, caplog):
        register_and_verify(client, caplog, email="loginok@example.com")
        resp = client.post("/auth/patient/login", json={"email": "loginok@example.com", "password": PATIENT_PAYLOAD["password"]})
        assert resp.status_code == 200
        assert resp.json()["role"] == "patient"

    def test_verify_email_locks_out_after_max_attempts(self, client, caplog):
        with caplog.at_level(logging.INFO):
            register_patient(client, email="lockout@example.com")
            code = extract_otp_code(caplog.text, email="lockout@example.com")
        for _ in range(5):
            resp = client.post("/patients/verify-email", json={"email": "lockout@example.com", "code": "000000"})
            assert resp.status_code == 400
        # 6th attempt: even the correct code should now be locked out
        resp = client.post("/patients/verify-email", json={"email": "lockout@example.com", "code": code})
        assert resp.status_code == 429


class TestForgotPassword:
    def test_request_returns_generic_message_for_unknown_email(self, client):
        resp = client.post("/patients/forgot-password/request", json={"email": "no-such-account@example.com"})
        assert resp.status_code == 200
        assert "if an account exists" in resp.json()["message"].lower()

    def test_request_returns_same_generic_message_for_known_email(self, client, caplog):
        register_and_verify(client, caplog, email="resetflow@example.com")
        resp = client.post("/patients/forgot-password/request", json={"email": "resetflow@example.com"})
        assert resp.status_code == 200
        assert "if an account exists" in resp.json()["message"].lower()

    def test_reset_with_valid_code_updates_password(self, client, caplog):
        register_and_verify(client, caplog, email="resetsuccess@example.com")
        with caplog.at_level(logging.INFO):
            client.post("/patients/forgot-password/request", json={"email": "resetsuccess@example.com"})
            code = extract_otp_code(caplog.text, email="resetsuccess@example.com")
        resp = client.post("/patients/forgot-password/reset", json={
            "email": "resetsuccess@example.com", "code": code, "newPassword": "brand-new-password-123",
        })
        assert resp.status_code == 200

        old_login = client.post("/auth/patient/login", json={"email": "resetsuccess@example.com", "password": PATIENT_PAYLOAD["password"]})
        assert old_login.status_code == 401
        new_login = client.post("/auth/patient/login", json={"email": "resetsuccess@example.com", "password": "brand-new-password-123"})
        assert new_login.status_code == 200

    def test_reset_with_wrong_code_rejected(self, client, caplog):
        register_and_verify(client, caplog, email="resetwrong@example.com")
        client.post("/patients/forgot-password/request", json={"email": "resetwrong@example.com"})
        resp = client.post("/patients/forgot-password/reset", json={
            "email": "resetwrong@example.com", "code": "000000", "newPassword": "brand-new-password-123",
        })
        assert resp.status_code == 400


class TestProfile:
    def test_me_requires_auth(self, client):
        resp = client.get("/patients/me")
        assert resp.status_code == 401

    def test_me_returns_profile(self, client, caplog):
        token = register_and_verify(client, caplog, email="profile@example.com")
        resp = client.get("/patients/me", headers=auth_header(token["accessToken"]))
        assert resp.status_code == 200
        assert resp.json()["email"] == "profile@example.com"

    def test_update_profile_changes_name_and_phone(self, client, caplog):
        token = register_and_verify(client, caplog, email="updateprofile@example.com")
        resp = client.patch(
            "/patients/me",
            json={"name": "Updated Name", "phone": "+91 99999 88888"},
            headers=auth_header(token["accessToken"]),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"
        assert resp.json()["phone"] == "+91 99999 88888"


class TestMyEnquiries:
    def test_empty_initially(self, client, caplog):
        token = register_and_verify(client, caplog, email="noenquiries@example.com")
        resp = client.get("/patients/me/enquiries", headers=auth_header(token["accessToken"]))
        assert resp.status_code == 200
        assert resp.json() == []

    def test_enquiry_submitted_while_logged_in_is_linked_and_visible(self, client, caplog):
        token = register_and_verify(client, caplog, email="linkedenquiry@example.com", phone="+91 90000 33221")
        submit_resp = client.post(
            "/enquiries",
            json={
                "patientName": "Pytest Patient Account", "age": 40, "gender": "Female",
                "phone": "+91 90000 33221", "city": "Pune", "reason": "Free Cancer Screening",
            },
            headers=auth_header(token["accessToken"]),
        )
        assert submit_resp.status_code == 201, submit_resp.text

        mine = client.get("/patients/me/enquiries", headers=auth_header(token["accessToken"]))
        assert mine.status_code == 200
        assert len(mine.json()) == 1
        assert mine.json()[0]["enquiryId"] == submit_resp.json()["enquiryId"]

    def test_guest_enquiry_with_matching_phone_is_surfaced_and_backfilled(self, client, caplog):
        token = register_and_verify(client, caplog, email="guestmatch@example.com", phone="+91 90000 44551")
        guest_enquiry = submit_sample_enquiry(client, phone="+91 90000 44551")

        mine = client.get("/patients/me/enquiries", headers=auth_header(token["accessToken"]))
        assert mine.status_code == 200
        ids = [e["enquiryId"] for e in mine.json()]
        assert guest_enquiry["enquiryId"] in ids

    def test_anonymous_submission_has_no_patient_bearer_still_works(self, client):
        # No Authorization header at all -- must behave exactly as before Phase A.
        resp = submit_sample_enquiry(client, phone="+91 90000 55662")
        assert resp["status"] == "Pending Admin Review"


class TestReportDownloadOwnership:
    def test_patient_can_download_own_report_after_viewing_my_enquiries(self, client, caplog):
        token = register_and_verify(client, caplog, email="downloadown@example.com", phone="+91 90000 66773")
        enquiry = submit_sample_enquiry(client, phone="+91 90000 66773")
        upload = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": "+91 90000 66773"},
            files={"file": ("report.pdf", b"%PDF-1.4 patient owned report", "application/pdf")},
        )
        assert upload.status_code == 201, upload.text

        # Viewing "my enquiries" backfills patient_id onto the guest-submitted enquiry.
        client.get("/patients/me/enquiries", headers=auth_header(token["accessToken"]))

        download = client.get(
            f"/enquiries/{enquiry['id']}/reports/{upload.json()['id']}/download",
            headers=auth_header(token["accessToken"]),
        )
        assert download.status_code == 200
        assert download.content == b"%PDF-1.4 patient owned report"

    def test_patient_cannot_download_another_patients_report(self, client, caplog):
        register_and_verify(client, caplog, email="ownerpatient@example.com", phone="+91 90000 77884")
        other_token = register_and_verify(client, caplog, email="otherpatient@example.com", phone="+91 90000 99000")

        enquiry = submit_sample_enquiry(client, phone="+91 90000 77884")
        upload = client.post(
            f"/enquiries/{enquiry['id']}/reports",
            data={"phone": "+91 90000 77884"},
            files={"file": ("report.pdf", b"%PDF-1.4 owner only", "application/pdf")},
        )
        assert upload.status_code == 201, upload.text

        download = client.get(
            f"/enquiries/{enquiry['id']}/reports/{upload.json()['id']}/download",
            headers=auth_header(other_token["accessToken"]),
        )
        assert download.status_code == 403
