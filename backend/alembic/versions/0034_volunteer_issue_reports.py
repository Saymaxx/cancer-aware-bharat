"""volunteer issue reports: volunteer_issue_reports table

Revision ID: 0034_issue_reports
Revises: 0033_training_progress
Create Date: 2026-08-04

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0034_issue_reports"
down_revision = "0033_training_progress"
branch_labels = None
depends_on = None

ISSUE_REPORT_STATUSES = ("New", "Reviewed", "Resolved")


def upgrade() -> None:
    op.create_table(
        "volunteer_issue_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("volunteer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("volunteers.id"), nullable=False),
        sa.Column("volunteer_name", sa.String(200), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="New"),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('" + "', '".join(ISSUE_REPORT_STATUSES) + "')",
            name="ck_volunteer_issue_reports_status",
        ),
    )
    op.create_index("ix_volunteer_issue_reports_volunteer_id", "volunteer_issue_reports", ["volunteer_id"])


def downgrade() -> None:
    op.drop_index("ix_volunteer_issue_reports_volunteer_id", table_name="volunteer_issue_reports")
    op.drop_table("volunteer_issue_reports")
