"""phase A: patient accounts + OTP codes

Revision ID: 0007_patient_accounts
Revises: 0006_notification_indexes
Create Date: 2026-07-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0007_patient_accounts"
down_revision = "0006_notification_indexes"
branch_labels = None
depends_on = None

OTP_PURPOSES = ("verify_email", "password_reset")


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_ref_id", sa.String(50), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("email_verified", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("patient_ref_id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_patients_email", "patients", ["email"])
    op.create_index("ix_patients_phone", "patients", ["phone"])

    op.create_table(
        "otp_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("purpose", sa.String(20), nullable=False),
        sa.Column("code_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint(
            "purpose IN ('" + "', '".join(OTP_PURPOSES) + "')",
            name="ck_otp_codes_purpose",
        ),
    )
    op.create_index("ix_otp_codes_patient_id", "otp_codes", ["patient_id"])


def downgrade() -> None:
    op.drop_index("ix_otp_codes_patient_id", table_name="otp_codes")
    op.drop_table("otp_codes")
    op.drop_index("ix_patients_phone", table_name="patients")
    op.drop_index("ix_patients_email", table_name="patients")
    op.drop_table("patients")
