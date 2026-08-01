"""phase E: patient records (Patients Manager)

Revision ID: 0011_patient_records
Revises: 0010_volunteer_approval_status
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0011_patient_records"
down_revision = "0010_volunteer_approval_status"
branch_labels = None
depends_on = None

FINANCIAL_AID_STATUSES = ("Not Requested", "Pending Review", "Approved", "Disbursed", "Rejected")
CASE_STATUSES = ("Under Treatment", "Recovered", "Screened - Healthy", "Follow-up")


def upgrade() -> None:
    op.create_table(
        "patient_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("record_id", sa.String(50), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(20), nullable=False),
        sa.Column("diagnosis", sa.String(500), nullable=False),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=True),
        sa.Column("hospital_name", sa.String(255), nullable=True),
        sa.Column("assigned_volunteer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("volunteers.id"), nullable=True),
        sa.Column("assigned_volunteer_name", sa.String(200), nullable=True),
        sa.Column("financial_aid_status", sa.String(30), nullable=False),
        sa.Column("financial_aid_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("report_url", sa.String(1000), nullable=True),
        sa.Column("case_status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("record_id"),
        sa.CheckConstraint(
            "financial_aid_status IN ('" + "', '".join(FINANCIAL_AID_STATUSES) + "')",
            name="ck_patient_records_financial_aid_status",
        ),
        sa.CheckConstraint(
            "case_status IN ('" + "', '".join(CASE_STATUSES) + "')",
            name="ck_patient_records_case_status",
        ),
    )
    op.create_index("ix_patient_records_hospital_id", "patient_records", ["hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_patient_records_hospital_id", table_name="patient_records")
    op.drop_table("patient_records")
