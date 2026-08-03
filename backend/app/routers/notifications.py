from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin, get_current_claims
from app.models.hospital import Hospital
from app.models.notification import Notification
from app.models.notification_read import NotificationRead
from app.schemas.notification import NotificationBroadcastIn, NotificationBroadcastResult, NotificationOut
from app.services.audit import record_event
from app.services.notifications import notify

router = APIRouter(prefix="/notifications", tags=["notifications"])

# "Hospitals" has no single role-wide recipient the way admin/superadmin/
# volunteer/patient do -- every hospital notification needs its own
# target_hospital_id (see list_notifications' scoping below), so broadcasting
# to it fans out to one row per active hospital instead of one shared row.
AUDIENCE_ROLES: dict[str, tuple[str, ...]] = {
    "All Users": ("admin", "superadmin", "volunteer", "hospital", "patient"),
    "Admins": ("admin", "superadmin"),
    "Volunteers": ("volunteer",),
    "Hospitals": ("hospital",),
    "Patients": ("patient",),
}


def _to_out(notification: Notification, read: bool) -> NotificationOut:
    return NotificationOut(
        id=notification.id,
        target_role=notification.target_role,
        target_hospital_id=notification.target_hospital_id,
        title=notification.title,
        message=notification.message,
        enquiry_id=notification.enquiry_id,
        read=read,
        created_at=notification.created_at,
    )


@router.get("", response_model=list[NotificationOut])
@limiter.limit("60/minute")
def list_notifications(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(get_current_claims)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
):
    role = claims["role"]
    user_id = UUID(claims["sub"])
    query = db.query(Notification).filter(Notification.target_role == role)
    if role == "hospital":
        query = query.filter(Notification.target_hospital_id == user_id)
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    # read state is per-recipient (see NotificationRead), not the shared
    # Notification.read column -- one broadcast row is visible to every
    # user with the target role, so that column can't tell "I read it"
    # apart from "someone with my role read it".
    read_ids = {
        row.notification_id
        for row in db.query(NotificationRead.notification_id).filter(
            NotificationRead.user_id == user_id,
            NotificationRead.notification_id.in_([n.id for n in notifications]),
        )
    } if notifications else set()

    return [_to_out(n, n.id in read_ids) for n in notifications]


@router.post("/broadcast", response_model=NotificationBroadcastResult, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def broadcast_notification(
    request: Request,
    payload: NotificationBroadcastIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    recipient_count = 0
    for role in AUDIENCE_ROLES[payload.audience]:
        if role == "hospital":
            hospital_ids = [hid for (hid,) in db.query(Hospital.id).filter(Hospital.is_active.is_(True)).all()]
            for hospital_id in hospital_ids:
                notify(db, "hospital", payload.title, payload.message, target_hospital_id=hospital_id)
            recipient_count += len(hospital_ids)
        else:
            notify(db, role, payload.title, payload.message)
            recipient_count += 1
    record_event(db, "notification_broadcast", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{payload.audience}: {payload.title}")
    db.commit()
    return NotificationBroadcastResult(recipient_count=recipient_count)


@router.post("/{notification_id}/read", response_model=NotificationOut)
@limiter.limit("30/minute")
def mark_read(request: Request, notification_id: UUID, db: DbSession, claims: Annotated[dict, Depends(get_current_claims)]):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    if notification.target_role != claims["role"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your notification")
    # Mirrors list_notifications' scoping: target_role alone isn't enough for
    # hospital accounts, since every hospital shares the "hospital" role --
    # without this a hospital could mark-read (and thus silently read) any
    # other hospital's notification by guessing/enumerating its UUID.
    if claims["role"] == "hospital" and notification.target_hospital_id != UUID(claims["sub"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your notification")

    user_id = UUID(claims["sub"])
    already_read = db.query(NotificationRead).filter(
        NotificationRead.notification_id == notification.id,
        NotificationRead.user_id == user_id,
    ).first()
    if already_read is None:
        db.add(NotificationRead(notification_id=notification.id, user_id=user_id))
        db.commit()
    return _to_out(notification, read=True)
