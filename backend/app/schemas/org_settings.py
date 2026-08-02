from pydantic import Field

from app.schemas.base import CamelModel


class OrgSettingsOut(CamelModel):
    ngo_name: str
    tagline: str
    registration_no: str
    address: str
    phone: str
    email: str
    website: str


class IntegrationStatusOut(CamelModel):
    email_configured: bool
    email_backend: str
    payment_gateway_configured: bool


class OrgSettingsIn(CamelModel):
    ngo_name: str = Field(min_length=1, max_length=200)
    tagline: str = Field(min_length=1, max_length=200)
    registration_no: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=500)
    phone: str = Field(min_length=1, max_length=30)
    email: str = Field(min_length=3, max_length=255)
    website: str = Field(min_length=1, max_length=255)
