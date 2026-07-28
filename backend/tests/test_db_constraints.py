import pytest
from sqlalchemy.exc import IntegrityError

from app.models.user import User


class TestStatusRoleCheckConstraints:
    def test_invalid_user_role_is_rejected_at_the_db_level(self, db_session):
        db_session.add(User(name="Bad Role", email="badrole@example.com", hashed_password="x", role="hacker"))
        with pytest.raises(IntegrityError, match="ck_users_role"):
            db_session.flush()

    def test_invalid_enquiry_status_is_rejected_at_the_db_level(self, client, db_session):
        from tests.conftest import submit_sample_enquiry
        from app.models.enquiry import PatientEnquiry

        enquiry = submit_sample_enquiry(client, phone="+91 90000 99999")
        row = db_session.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry["id"]).first()
        row.status = "approved"  # not a real ENQUIRY_STATUSES value (case-typo)
        with pytest.raises(IntegrityError, match="ck_patient_enquiries_status"):
            db_session.flush()

    def test_invalid_enquiry_priority_is_rejected_at_the_db_level(self, client, db_session):
        from tests.conftest import submit_sample_enquiry
        from app.models.enquiry import PatientEnquiry

        enquiry = submit_sample_enquiry(client, phone="+91 90000 88888")
        row = db_session.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry["id"]).first()
        row.priority = "Severe"  # not a real PRIORITY_LEVELS value
        with pytest.raises(IntegrityError, match="ck_patient_enquiries_priority"):
            db_session.flush()
