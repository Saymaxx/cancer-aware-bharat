from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel
from app.schemas.enquiry import PHONE_PATTERN


class PatientRegisterIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(pattern=PHONE_PATTERN, max_length=30)
    password: str = Field(min_length=8, max_length=128)


class PatientOut(CamelModel):
    id: UUID
    patient_ref_id: str
    name: str
    email: EmailStr
    phone: str
    email_verified: bool
    created_at: datetime


class VerifyEmailIn(CamelModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class RequestPasswordResetIn(CamelModel):
    email: EmailStr


class ResetPasswordIn(CamelModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)


class PatientProfileUpdateIn(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = Field(default=None, pattern=PHONE_PATTERN, max_length=30)


class MessageOut(CamelModel):
    message: str
