"""phase 11: index notifications hot-path filter columns

Revision ID: 0006_notification_indexes
Revises: 0005_status_role_checks
Create Date: 2026-07-29

"""
from alembic import op

revision = "0006_notification_indexes"
down_revision = "0005_status_role_checks"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Every dashboard polls GET /notifications every 20s, filtered on
    # target_role (and additionally target_hospital_id for hospital
    # accounts). Neither column was indexed, forcing a full table scan on
    # every poll from every logged-in session -- the same class of gap the
    # patient_enquiries status/hospital_id indexes closed in
    # 0002_phase1_hardening, just not caught for this table at the time.
    op.create_index("ix_notifications_target_role", "notifications", ["target_role"])
    op.create_index("ix_notifications_target_hospital_id", "notifications", ["target_hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_notifications_target_hospital_id", table_name="notifications")
    op.drop_index("ix_notifications_target_role", table_name="notifications")
