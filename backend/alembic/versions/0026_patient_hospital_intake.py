"""phase N3: hospital-side clinical intake fields on patient_records

Revision ID: 0026_patient_hospital_intake
Revises: 0025_ngo_referrals
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0026_patient_hospital_intake"
down_revision = "0025_ngo_referrals"
branch_labels = None
depends_on = None

TREATMENT_STATUSES = ("Under Review", "Under Treatment", "Completed", "Referred", "Emergency")


def upgrade() -> None:
    op.add_column("patient_records", sa.Column("ngo_referral_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("ngo_referrals.id"), nullable=True))
    op.add_column("patient_records", sa.Column("treatment_status", sa.String(30), nullable=False, server_default="Under Review"))
    op.add_column("patient_records", sa.Column("cancer_stage", sa.String(50), nullable=True))
    op.add_column("patient_records", sa.Column("assigned_doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospital_doctors.id"), nullable=True))
    op.add_column("patient_records", sa.Column("assigned_doctor_name", sa.String(200), nullable=True))
    op.add_column("patient_records", sa.Column("admission_date", sa.Date(), nullable=True))
    op.add_column("patient_records", sa.Column("remarks", sa.String(2000), nullable=False, server_default=""))
    op.add_column("patient_records", sa.Column("prescription_uploaded", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("patient_records", "treatment_status", server_default=None)
    op.alter_column("patient_records", "remarks", server_default=None)
    op.alter_column("patient_records", "prescription_uploaded", server_default=None)
    op.create_index("ix_patient_records_ngo_referral_id", "patient_records", ["ngo_referral_id"])
    op.create_check_constraint(
        "ck_patient_records_treatment_status",
        "patient_records",
        "treatment_status IN ('" + "', '".join(TREATMENT_STATUSES) + "')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_patient_records_treatment_status", "patient_records", type_="check")
    op.drop_index("ix_patient_records_ngo_referral_id", table_name="patient_records")
    op.drop_column("patient_records", "prescription_uploaded")
    op.drop_column("patient_records", "remarks")
    op.drop_column("patient_records", "admission_date")
    op.drop_column("patient_records", "assigned_doctor_name")
    op.drop_column("patient_records", "assigned_doctor_id")
    op.drop_column("patient_records", "cancer_stage")
    op.drop_column("patient_records", "treatment_status")
    op.drop_column("patient_records", "ngo_referral_id")
