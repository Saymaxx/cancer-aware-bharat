"""phase B: hospital partner-request status workflow

Revision ID: 0009_partner_request_status
Revises: 0008_enquiry_patient_fk
Create Date: 2026-07-29

"""
from alembic import op
import sqlalchemy as sa

revision = "0009_partner_request_status"
down_revision = "0008_enquiry_patient_fk"
branch_labels = None
depends_on = None

PARTNER_REQUEST_STATUSES = ("Pending", "Recommended", "Approved", "Rejected")


def upgrade() -> None:
    op.add_column("hospital_partner_requests", sa.Column("decision_notes", sa.Text(), nullable=True))
    op.create_check_constraint(
        "ck_hospital_partner_requests_status",
        "hospital_partner_requests",
        "status IN ('" + "', '".join(PARTNER_REQUEST_STATUSES) + "')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_hospital_partner_requests_status", "hospital_partner_requests", type_="check")
    op.drop_column("hospital_partner_requests", "decision_notes")
