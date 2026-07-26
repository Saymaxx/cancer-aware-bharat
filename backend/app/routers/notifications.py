from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import DbSession, get_current_claims
from app.models.notification import Notification
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(db: DbSession, claims: Annotated[dict, Depends(get_current_claims)]):
    role = claims["role"]
    query = db.query(Notification).filter(Notification.target_role == role)
    if role == "hospital":
        query = query.filter(Notification.target_hospital_id == UUID(claims["sub"]))
    return query.order_by(Notification.created_at.desc()).limit(100).all()


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: UUID, db: DbSession, claims: Annotated[dict, Depends(get_current_claims)]):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    if notification.target_role != claims["role"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your notification")
    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification
