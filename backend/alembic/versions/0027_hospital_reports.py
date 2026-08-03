"""phase N4: hospital medical reports

Revision ID: 0027_hospital_reports
Revises: 0026_patient_hospital_intake
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0027_hospital_reports"
down_revision = "0026_patient_hospital_intake"
branch_labels = None
depends_on = None

REPORT_TYPES = ("Prescription", "Lab Test", "Biopsy", "CT/MRI Scan", "Discharge Summary")


def upgrade() -> None:
    op.create_table(
        "hospital_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_record_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_records.id"), nullable=False),
        sa.Column("patient_name", sa.String(200), nullable=False),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("report_type", sa.String(30), nullable=False),
        sa.Column("uploaded_by_doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospital_doctors.id"), nullable=True),
        sa.Column("uploaded_by_doctor_name", sa.String(200), nullable=True),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_size", sa.String(30), nullable=False),
        sa.Column("file_type", sa.String(100), nullable=False),
        sa.Column("storage_key", sa.String(1000), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "report_type IN ('" + "', '".join(REPORT_TYPES) + "')",
            name="ck_hospital_reports_report_type",
        ),
    )
    op.create_index("ix_hospital_reports_patient_record_id", "hospital_reports", ["patient_record_id"])
    op.create_index("ix_hospital_reports_hospital_id", "hospital_reports", ["hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_hospital_reports_hospital_id", table_name="hospital_reports")
    op.drop_index("ix_hospital_reports_patient_record_id", table_name="hospital_reports")
    op.drop_table("hospital_reports")
