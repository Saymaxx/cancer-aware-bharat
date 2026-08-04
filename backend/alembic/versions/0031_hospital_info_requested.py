"""hospital partner-request "Info Requested" status

Revision ID: 0031_hospital_info_requested
Revises: 0030_notification_reads
Create Date: 2026-08-04

"""
from alembic import op

revision = "0031_hospital_info_requested"
down_revision = "0030_notification_reads"
branch_labels = None
depends_on = None

OLD_STATUSES = ("Pending", "Recommended", "Approved", "Rejected")
NEW_STATUSES = ("Pending", "Recommended", "Info Requested", "Approved", "Rejected")


def upgrade() -> None:
    op.drop_constraint("ck_hospital_partner_requests_status", "hospital_partner_requests", type_="check")
    op.create_check_constraint(
        "ck_hospital_partner_requests_status",
        "hospital_partner_requests",
        "status IN ('" + "', '".join(NEW_STATUSES) + "')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_hospital_partner_requests_status", "hospital_partner_requests", type_="check")
    op.create_check_constraint(
        "ck_hospital_partner_requests_status",
        "hospital_partner_requests",
        "status IN ('" + "', '".join(OLD_STATUSES) + "')",
    )
