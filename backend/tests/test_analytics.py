from tests.conftest import auth_header


class TestDonationsMonthly:
    def test_requires_staff_auth(self, client):
        resp = client.get("/analytics/donations-monthly")
        assert resp.status_code == 401

    def test_admin_role_cannot_view(self, client, admin_token):
        resp = client.get("/analytics/donations-monthly", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_hospital_role_cannot_view(self, client, hospital1_token):
        resp = client.get("/analytics/donations-monthly", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_superadmin_sees_real_aggregate(self, client, superadmin_token, db_session):
        from app.models.donation import Donation

        db_session.add_all([
            Donation(donor_name="A", donor_type="Individual", amount=1000, payment_method="UPI"),
            Donation(donor_name="B", donor_type="Individual", amount=2000, payment_method="UPI"),
        ])
        db_session.flush()

        resp = client.get("/analytics/donations-monthly", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) >= 1
        total_this_bucket = sum(m["amount"] for m in body)
        assert total_this_bucket >= 3000


class TestPatientIntakeMonthly:
    def test_requires_staff_auth(self, client):
        resp = client.get("/analytics/patient-intake-monthly")
        assert resp.status_code == 401

    def test_hospital_role_cannot_view(self, client, hospital1_token):
        resp = client.get("/analytics/patient-intake-monthly", headers=auth_header(hospital1_token))
        assert resp.status_code == 403

    def test_admin_sees_real_aggregate(self, client, admin_token, db_session):
        # Unlike donations-monthly and volunteer-hours-monthly, admin is
        # allowed here -- it's an org-wide aggregate count with no PII,
        # backing Admin's own dashboard overview chart.
        from app.models.enquiry import PatientEnquiry

        db_session.add(PatientEnquiry(
            enquiry_id="ENQ-ANALYTICS-ADMIN-1", reference_number="REF-ANALYTICS-ADMIN-1",
            patient_name="Analytics Admin Test Patient", age=40, gender="Female", phone="+919876500001",
            city="Delhi", reason="Screening", status="Pending Admin Review", priority="Normal",
            date="2026-08-01",
        ))
        db_session.flush()

        resp = client.get("/analytics/patient-intake-monthly", headers=auth_header(admin_token))
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) >= 1
        assert sum(m["count"] for m in body) >= 1

    def test_superadmin_sees_real_aggregate(self, client, superadmin_token, db_session):
        from app.models.enquiry import PatientEnquiry

        db_session.add(PatientEnquiry(
            enquiry_id="ENQ-ANALYTICS-1", reference_number="REF-ANALYTICS-1",
            patient_name="Analytics Test Patient", age=40, gender="Female", phone="+919876500000",
            city="Delhi", reason="Screening", status="Pending Admin Review", priority="Normal",
            date="2026-08-01",
        ))
        db_session.flush()

        resp = client.get("/analytics/patient-intake-monthly", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) >= 1
        assert sum(m["count"] for m in body) >= 1


class TestVolunteerHoursMonthly:
    def test_requires_staff_auth(self, client):
        resp = client.get("/analytics/volunteer-hours-monthly")
        assert resp.status_code == 401

    def test_admin_role_cannot_view(self, client, admin_token):
        resp = client.get("/analytics/volunteer-hours-monthly", headers=auth_header(admin_token))
        assert resp.status_code == 403

    def test_superadmin_sees_real_aggregate(self, client, superadmin_token, db_session):
        from tests.test_volunteers import register_and_approve_volunteer
        from app.models.volunteer_hours_log import VolunteerHoursLog

        volunteer = register_and_approve_volunteer(client, superadmin_token, email="hours.analytics@example.com")
        db_session.add_all([
            VolunteerHoursLog(volunteer_id=volunteer["id"], activity="Camp setup", hours=3, log_date="2026-08-01"),
            VolunteerHoursLog(volunteer_id=volunteer["id"], activity="Registration desk", hours=2, log_date="2026-08-01"),
        ])
        db_session.flush()

        resp = client.get("/analytics/volunteer-hours-monthly", headers=auth_header(superadmin_token))
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) >= 1
        assert sum(m["hours"] for m in body) >= 5
