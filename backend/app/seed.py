"""Dev-only seed data. Run with: python -m app.seed

Ports the hardcoded arrays from the frontend's src/data.ts so the API has
something to serve while the dashboards are wired up. Safe to re-run --
skips anything that already exists.

Every account this script creates uses the same publicly-documented password
("ChangeMe123!", see README). It refuses to run against a production
environment for that reason -- use `python -m app.create_superadmin` there
instead, which prompts for a real password interactively.
"""
import sys

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.hospital import Hospital
from app.models.user import User

HOSPITALS = [
    dict(
        name="Apex Oncology Institute", type="Center of Excellence", region="north",
        city="New Delhi", state="Delhi",
        specialties=["Radiation Therapy", "Surgical Oncology", "Palliative Care"],
        phone="+91 11 4055 9200", email="contact@apexoncology.in",
        address="Sector 7, Dwarka, New Delhi, Delhi 110075", lat=28.5921, lng=77.0460,
        description="Apex Oncology Institute is a world-class facility dedicated to advanced cancer care.",
        login_email="hospital1@awarebharat.local", password="ChangeMe123!",
    ),
    dict(
        name="CareWell Cancer Hospital", type="Community Partner", region="west",
        city="Mumbai", state="Maharashtra",
        specialties=["Chemotherapy", "Support Groups", "Immunotherapy"],
        phone="+91 22 2640 4500", email="care@carewellcancer.org",
        address="SV Road, Bandra West, Mumbai, Maharashtra 400050", lat=19.0596, lng=72.8295,
        description="CareWell Cancer Hospital specializes in patient-centric care models.",
        login_email="hospital2@awarebharat.local", password="ChangeMe123!",
    ),
]

STAFF = [
    dict(name="Dr. Ramesh Sharma", email="admin@awarebharat.local", password="ChangeMe123!", role="admin"),
    dict(name="Board Administrator", email="superadmin@awarebharat.local", password="ChangeMe123!", role="superadmin"),
]


def run() -> None:
    if settings.is_production:
        print(
            "Refusing to run: ENVIRONMENT=production. This script creates accounts "
            "with a password documented in this repo's README -- use "
            "`python -m app.create_superadmin` instead for a real deployment.",
            file=sys.stderr,
        )
        sys.exit(1)

    db = SessionLocal()
    try:
        for h in HOSPITALS:
            if db.query(Hospital).filter(Hospital.login_email == h["login_email"]).first():
                continue
            password = h.pop("password")
            db.add(Hospital(hashed_password=hash_password(password), **h))

        for s in STAFF:
            if db.query(User).filter(User.email == s["email"]).first():
                continue
            db.add(User(name=s["name"], email=s["email"], role=s["role"], hashed_password=hash_password(s["password"])))

        db.commit()
        print("Seed complete. Dev credentials use password: ChangeMe123!")
    finally:
        db.close()


if __name__ == "__main__":
    run()
