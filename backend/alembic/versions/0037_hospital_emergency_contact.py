"""hospital emergency phone + website (self-service profile fields)

Revision ID: 0037_hospital_emergency_contact
Revises: 0036_survivor_story_submissions
Create Date: 2026-08-05

"""
from alembic import op
import sqlalchemy as sa

revision = "0037_hospital_emergency_contact"
down_revision = "0036_survivor_story_submissions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("hospitals", sa.Column("emergency_phone", sa.String(30), nullable=True))
    op.add_column("hospitals", sa.Column("website", sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column("hospitals", "website")
    op.drop_column("hospitals", "emergency_phone")
