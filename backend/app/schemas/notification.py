from datetime import datetime
from uuid import UUID

from app.schemas.base import CamelModel


class NotificationOut(CamelModel):
    id: UUID
    target_role: str
    target_hospital_id: UUID | None = None
    title: str
    message: str
    enquiry_id: str | None = None
    read: bool
    created_at: datetime
