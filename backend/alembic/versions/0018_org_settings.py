"""org settings: single-row NGO info for the System Settings tab

Revision ID: 0018_org_settings
Revises: 0017_backup_records
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0018_org_settings"
down_revision = "0017_backup_records"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "org_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ngo_name", sa.String(200), nullable=False),
        sa.Column("tagline", sa.String(200), nullable=False),
        sa.Column("registration_no", sa.String(100), nullable=False),
        sa.Column("address", sa.String(500), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("website", sa.String(255), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("org_settings")
