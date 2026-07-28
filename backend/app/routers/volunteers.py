from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request

from app.core.limiter import limiter
from app.deps import DbSession, require_volunteer
from app.models.volunteer import Volunteer
from app.schemas.volunteer import VolunteerOut

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.get("/me", response_model=VolunteerOut)
@limiter.limit("60/minute")
def get_my_profile(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    return db.query(Volunteer).filter(Volunteer.id == UUID(claims["sub"])).first()
