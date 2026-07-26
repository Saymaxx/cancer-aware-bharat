from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification


def notify(
    db: Session,
    target_role: str,
    title: str,
    message: str,
    enquiry_id: str | None = None,
    target_hospital_id: UUID | None = None,
) -> Notification:
    notification = Notification(
        target_role=target_role,
        target_hospital_id=target_hospital_id,
        title=title,
        message=message,
        enquiry_id=enquiry_id,
    )
    db.add(notification)
    return notification
