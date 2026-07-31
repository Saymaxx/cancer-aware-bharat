import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Volunteer(Base):
    __tablename__ = "volunteers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # e.g. V-2026-12345
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    # Deliberately not unique (unlike email above): a household phone shared
    # by two registering volunteers is a plausible real case, not obviously
    # a data-quality bug. Left open pending product confirmation -- add a
    # unique constraint here only once that's settled, since retrofitting
    # one onto existing data could reject a legitimate shared-phone record.
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    area: Mapped[str | None] = mapped_column(String(200))
    available_days: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    motivation: Mapped[str | None] = mapped_column(Text)
    # New registrations start Pending; the migration that added this column
    # backfilled every pre-existing volunteer to Approved so their login
    # access wasn't retroactively revoked by introducing this gate.
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Pending Approval")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
