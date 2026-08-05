"""volunteer campaign enrollment approval gate: status + decision_notes

Revision ID: 0035_enrollment_approval
Revises: 0034_issue_reports
Create Date: 2026-08-04

"""
from alembic import op
import sqlalchemy as sa

revision = "0035_enrollment_approval"
down_revision = "0034_issue_reports"
branch_labels = None
depends_on = None

ENROLLMENT_STATUSES = ("Pending", "Approved", "Rejected")


def upgrade() -> None:
    # Nullable first so the backfill below can target pre-existing rows
    # before NOT NULL is enforced -- every volunteer who already self-
    # enrolled under the old immediate-enrollment system keeps their spot
    # rather than being retroactively bumped back to Pending.
    op.add_column("volunteer_campaign_enrollments", sa.Column("status", sa.String(length=20), nullable=True))
    op.execute("UPDATE volunteer_campaign_enrollments SET status = 'Approved' WHERE status IS NULL")
    op.alter_column(
        "volunteer_campaign_enrollments", "status",
        existing_type=sa.String(length=20),
        nullable=False,
        server_default="Pending",
    )
    op.create_check_constraint(
        "ck_volunteer_campaign_enrollments_status",
        "volunteer_campaign_enrollments",
        "status IN ('" + "', '".join(ENROLLMENT_STATUSES) + "')",
    )
    op.add_column("volunteer_campaign_enrollments", sa.Column("decision_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("volunteer_campaign_enrollments", "decision_notes")
    op.drop_constraint("ck_volunteer_campaign_enrollments_status", "volunteer_campaign_enrollments", type_="check")
    op.drop_column("volunteer_campaign_enrollments", "status")
