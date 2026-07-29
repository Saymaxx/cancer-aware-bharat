"""phase A: link patient_enquiries to patient accounts

Revision ID: 0008_enquiry_patient_fk
Revises: 0007_patient_accounts
Create Date: 2026-07-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0008_enquiry_patient_fk"
down_revision = "0007_patient_accounts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "patient_enquiries",
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=True),
    )
    op.create_index("ix_patient_enquiries_patient_id", "patient_enquiries", ["patient_id"])


def downgrade() -> None:
    op.drop_index("ix_patient_enquiries_patient_id", table_name="patient_enquiries")
    op.drop_column("patient_enquiries", "patient_id")
