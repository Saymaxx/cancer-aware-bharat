from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class AdminOut(CamelModel):
    id: UUID
    name: str
    email: str
    phone: str | None = None
    region: str | None = None
    is_active: bool
    created_at: datetime


# Plain str, not EmailStr -- staff accounts use the @awarebharat.local dev
# domain throughout this codebase (see LoginIn), which EmailStr's
# reserved-TLD check rejects.
class AdminIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    region: str | None = Field(default=None, max_length=120)


class AdminUpdateIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=30)
    region: str | None = Field(default=None, max_length=120)


class AdminCreateResult(CamelModel):
    admin: AdminOut
    # Shown once, same pattern as HospitalApprovalResult -- never stored in
    # plaintext, never logged, never re-fetchable after this response.
    login_email: str
    temp_password: str
