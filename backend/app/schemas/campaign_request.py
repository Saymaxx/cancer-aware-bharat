from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel
from app.schemas.enquiry import PHONE_PATTERN

OrgType = Literal["School", "College", "NGO", "Corporate", "Village Council"]


class CampaignRequestIn(CamelModel):
    organization_name: str = Field(min_length=1, max_length=255)
    org_type: OrgType
    contact_person: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(pattern=PHONE_PATTERN, max_length=30)
    requested_date: str = Field(min_length=1, max_length=50)
    location: str = Field(min_length=1, max_length=255)
    expected_attendees: int = Field(ge=1)


class CampaignRequestOut(CamelModel):
    id: UUID
    organization_name: str
    org_type: str
    contact_person: str
    email: str
    phone: str
    requested_date: str
    location: str
    expected_attendees: int
    status: str
    created_at: datetime
