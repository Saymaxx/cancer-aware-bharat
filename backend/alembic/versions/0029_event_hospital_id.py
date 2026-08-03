"""phase N6: nullable hospital_id on events for hospital-hosted campaigns

Revision ID: 0029_event_hospital_id
Revises: 0028_patient_cost_verification
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0029_event_hospital_id"
down_revision = "0028_patient_cost_verification"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("events", sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=True))
    op.create_index("ix_events_hospital_id", "events", ["hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_events_hospital_id", table_name="events")
    op.drop_column("events", "hospital_id")
