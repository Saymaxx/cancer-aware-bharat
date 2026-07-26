"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-26

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "hospitals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("logo", sa.String(1000)),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("region", sa.String(20), nullable=False),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("state", sa.String(120), nullable=False),
        sa.Column("specialties", postgresql.ARRAY(sa.String)),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("address", sa.String(500), nullable=False),
        sa.Column("lat", sa.Float, nullable=False),
        sa.Column("lng", sa.Float, nullable=False),
        sa.Column("description", sa.Text, server_default=""),
        sa.Column("login_email", sa.String(255)),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("is_active", sa.Boolean, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("login_email"),
    )

    op.create_table(
        "hospital_partner_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("hospital_name", sa.String(255), nullable=False),
        sa.Column("contact_name", sa.String(200), nullable=False),
        sa.Column("designation", sa.String(120)),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("specialties", sa.Text),
        sa.Column("motivation", sa.Text),
        sa.Column("status", sa.String(20), server_default="Pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("image", sa.String(500)),
        sa.Column("date", sa.String(50), nullable=False),
        sa.Column("time", sa.String(50), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, server_default=""),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("registered_count", sa.Integer, server_default="0"),
        sa.Column("capacity", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "blog_articles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text, server_default=""),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("author", sa.String(200), nullable=False),
        sa.Column("role", sa.String(200)),
        sa.Column("date", sa.String(50), nullable=False),
        sa.Column("read_time", sa.String(30)),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("image", sa.String(500)),
        sa.Column("tags", postgresql.ARRAY(sa.String)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "volunteers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("volunteer_id", sa.String(50), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("area", sa.String(200)),
        sa.Column("available_days", postgresql.ARRAY(sa.String)),
        sa.Column("motivation", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("volunteer_id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_volunteers_email", "volunteers", ["email"])

    op.create_table(
        "patient_enquiries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("enquiry_id", sa.String(50), nullable=False),
        sa.Column("reference_number", sa.String(50), nullable=False),
        sa.Column("patient_name", sa.String(200), nullable=False),
        sa.Column("age", sa.Integer, nullable=False),
        sa.Column("gender", sa.String(20), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("address", sa.String(500)),
        sa.Column("city", sa.String(120), nullable=False),
        sa.Column("state", sa.String(120)),
        sa.Column("preferred_location", sa.String(120)),
        sa.Column("reason", sa.String(255), nullable=False),
        sa.Column("cancer_type", sa.String(255)),
        sa.Column("symptoms", sa.Text),
        sa.Column("notes", sa.Text),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id")),
        sa.Column("preferred_hospital_name", sa.String(255)),
        sa.Column("assigned_hospital_name", sa.String(255)),
        sa.Column("preferred_date", sa.String(30)),
        sa.Column("status", sa.String(50), nullable=False, server_default="Pending Admin Review"),
        sa.Column("priority", sa.String(20), nullable=False, server_default="Normal"),
        sa.Column("admin_decided_by", sa.String(200)),
        sa.Column("admin_decided_at", sa.String(50)),
        sa.Column("admin_action", sa.String(20)),
        sa.Column("admin_remarks", sa.Text),
        sa.Column("super_admin_assigned_by", sa.String(200)),
        sa.Column("super_admin_assigned_at", sa.String(50)),
        sa.Column("super_admin_remarks", sa.Text),
        sa.Column("hospital_decided_by", sa.String(200)),
        sa.Column("hospital_decided_at", sa.String(50)),
        sa.Column("hospital_action", sa.String(20)),
        sa.Column("hospital_remarks", sa.Text),
        sa.Column("date", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("enquiry_id"),
        sa.UniqueConstraint("reference_number"),
    )
    op.create_index("ix_patient_enquiries_enquiry_id", "patient_enquiries", ["enquiry_id"])
    op.create_index("ix_patient_enquiries_reference_number", "patient_enquiries", ["reference_number"])
    op.create_index("ix_patient_enquiries_phone", "patient_enquiries", ["phone"])

    op.create_table(
        "timeline_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("enquiry_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_enquiries.id"), nullable=False),
        sa.Column("stage", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("actor", sa.String(200)),
        sa.Column("remarks", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "uploaded_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("enquiry_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_enquiries.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("size", sa.String(30)),
        sa.Column("type", sa.String(100)),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "appointments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("appointment_id", sa.String(50), nullable=False),
        sa.Column("enquiry_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_enquiries.id"), nullable=False),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("hospital_name", sa.String(255), nullable=False),
        sa.Column("patient_name", sa.String(200), nullable=False),
        sa.Column("date", sa.String(30), nullable=False),
        sa.Column("time", sa.String(30), nullable=False),
        sa.Column("doctor", sa.String(200), nullable=False),
        sa.Column("status", sa.String(30), server_default="Appointment Confirmed"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("appointment_id"),
        sa.UniqueConstraint("enquiry_id"),
    )

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("target_role", sa.String(20), nullable=False),
        sa.Column("target_hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("enquiry_id", sa.String(50)),
        sa.Column("read", sa.Boolean, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("appointments")
    op.drop_table("uploaded_reports")
    op.drop_table("timeline_events")
    op.drop_table("patient_enquiries")
    op.drop_table("volunteers")
    op.drop_table("blog_articles")
    op.drop_table("events")
    op.drop_table("hospital_partner_requests")
    op.drop_table("hospitals")
    op.drop_table("users")
