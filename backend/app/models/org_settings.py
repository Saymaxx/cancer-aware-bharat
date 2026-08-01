from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


# Single-row settings table (SuperAdmin System Settings tab -- NGO
# Information section only; SMTP/payment-gateway fields aren't modeled here
# since no real email delivery or payment integration exists to configure).
# id is always 1 -- there is exactly one organization.
class OrgSettings(Base):
    __tablename__ = "org_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    ngo_name: Mapped[str] = mapped_column(String(200), nullable=False, default="Cancer Aware Bharat Trust")
    tagline: Mapped[str] = mapped_column(String(200), nullable=False, default="Early Detection Saves Lives")
    registration_no: Mapped[str] = mapped_column(String(100), nullable=False, default="NGO-DL-2024-0892")
    address: Mapped[str] = mapped_column(String(500), nullable=False, default="B-42, Sector 12, Dwarka, New Delhi — 110078")
    phone: Mapped[str] = mapped_column(String(30), nullable=False, default="+91 11 4567 8901")
    email: Mapped[str] = mapped_column(String(255), nullable=False, default="info@awarebharat.org")
    website: Mapped[str] = mapped_column(String(255), nullable=False, default="www.cancerawarebharat.org")
