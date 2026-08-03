"""phase N5: hospital financial aid cost verification on patient_records

Revision ID: 0028_patient_cost_verification
Revises: 0027_hospital_reports
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa

revision = "0028_patient_cost_verification"
down_revision = "0027_hospital_reports"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("patient_records", sa.Column("estimated_cost", sa.Numeric(12, 2), nullable=True))
    op.add_column("patient_records", sa.Column("verified_cost", sa.Numeric(12, 2), nullable=True))


def downgrade() -> None:
    op.drop_column("patient_records", "verified_cost")
    op.drop_column("patient_records", "estimated_cost")
