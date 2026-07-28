"""phase 4: CHECK constraints on status/priority/role

Revision ID: 0005_status_role_checks
Revises: 0004_audit_log
Create Date: 2026-07-28

"""
from alembic import op

revision = "0005_status_role_checks"
down_revision = "0004_audit_log"
branch_labels = None
depends_on = None

# Hardcoded rather than imported from app.models: migrations should stay
# self-contained and not shift meaning if the model's tuple is edited later.
# Keep these in sync with ENQUIRY_STATUSES/PRIORITY_LEVELS/STAFF_ROLES.
ENQUIRY_STATUSES = (
    "Pending Admin Review",
    "Rejected by Admin",
    "Approved by Admin",
    "Pending Hospital Assignment",
    "Assigned to Hospital",
    "Declined by Hospital",
    "Accepted by Hospital",
    "Appointment Confirmed",
    "Completed",
)
PRIORITY_LEVELS = ("Normal", "Urgent", "Critical")
STAFF_ROLES = ("admin", "superadmin")


def upgrade() -> None:
    op.create_check_constraint(
        "ck_patient_enquiries_status",
        "patient_enquiries",
        "status IN ('" + "', '".join(ENQUIRY_STATUSES) + "')",
    )
    op.create_check_constraint(
        "ck_patient_enquiries_priority",
        "patient_enquiries",
        "priority IN ('" + "', '".join(PRIORITY_LEVELS) + "')",
    )
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('" + "', '".join(STAFF_ROLES) + "')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.drop_constraint("ck_patient_enquiries_priority", "patient_enquiries", type_="check")
    op.drop_constraint("ck_patient_enquiries_status", "patient_enquiries", type_="check")
