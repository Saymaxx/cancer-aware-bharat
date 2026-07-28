import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RevokedToken(Base):
    """Denylist of logged-out/revoked access-token IDs (JWT `jti` claims).

    Tokens issued before this table existed have no `jti` claim and simply
    can't be revoked -- they still expire naturally on their own TTL, so
    this is purely additive and doesn't break already-issued sessions.
    """

    __tablename__ = "revoked_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jti: Mapped[str] = mapped_column(String(36), unique=True, nullable=False, index=True)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
