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
from app.models.blog import BlogArticle
from app.models.campaign_request import CampaignRequest
from app.models.event import Event
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

EVENTS = [
    dict(
        title="Mega Rural Cancer Screening & Blood Drive", type="Screening Camp",
        image="/events/event-1.jpeg", date="Sat, 15 Oct 2024", time="9:00 AM",
        location="City Hospital Community Hall, New Delhi",
        description="Free mammography screening, oral examination, and blood donation drive supported by specialized oncologists and certified caseworkers.",
        category="Screening Camps", registered_count=184, capacity=250,
    ),
    dict(
        title="Free Early Detection & Pap Screening Camp", type="Screening Camp",
        image="/events/event-2.jpeg", date="Sun, 22 Oct 2024", time="10:00 AM",
        location="Lions Club Grounds, Mumbai",
        description="Comprehensive screening for oral, breast, and cervical cancers entirely free of charge with on-spot specialist consultations.",
        category="Screening Camps", registered_count=145, capacity=200,
    ),
    dict(
        title="Nutrition Post-Treatment & Holistic Recovery Workshop", type="Workshop",
        image="/events/event-3.jpeg", date="Wed, 25 Oct 2024", time="4:00 PM",
        location="District Health Center Auditorium, Varanasi",
        description="Interactive workshop focusing on post-chemotherapy dietary guidance, yoga, and holistic patient recovery.",
        category="Workshops", registered_count=68, capacity=100,
    ),
    dict(
        title="Mobile Mammography & Oral Health Rally", type="Screening Camp",
        image="/events/event-4.jpeg", date="Sun, 05 Nov 2024", time="8:30 AM",
        location="Panchayat Bhavan, Pune Rural",
        description="Mobile diagnostic van screening over 300 village residents for early warning signs with direct referral slips.",
        category="Screening Camps", registered_count=210, capacity=300,
    ),
    dict(
        title="Volunteer First-Aid & Patient Navigation Seminar", type="Workshop",
        image="/events/event-5.jpeg", date="Sat, 18 Nov 2024", time="11:00 AM",
        location="Community Hall, Lucknow",
        description="Orientation and safety protocol training for grassroot volunteer advocates on guiding rural patients.",
        category="Workshops", registered_count=95, capacity=150,
    ),
    dict(
        title="District Blood & Platelet Donor Drive", type="Blood Donation",
        image="/events/event-6.jpeg", date="Sun, 26 Nov 2024", time="9:00 AM",
        location="Civil Hospital Grounds, Jaipur",
        description="Blood and platelet collection drive for chemotherapy units. Health checkup certificates provided for all donors.",
        category="Blood Donation", registered_count=130, capacity=200,
    ),
]

BLOGS = [
    dict(
        title="5 Warning Signs of Breast Cancer You Should Never Ignore",
        summary="Breast cancer is the most common cancer in Indian women. Early identification can increase survival rates to over 90%. Learn how to conduct self-exams.",
        content="Breast cancer is currently the leading cancer among women in India, accounting for nearly 14% of all cancer cases. However, the most important truth is this: early detection saves lives.",
        author="Dr. Ramesh Sharma", role="Founder & Chief Medical Advisor",
        date="July 12, 2026", read_time="5 min read", category="Prevention",
        image="/events/event-2.jpeg", tags=["Breast Cancer", "Self-Exam", "Women's Health", "Prevention"],
    ),
    dict(
        title="Healing Foods: Designing a Chemo-Friendly Diet",
        summary="How targeted nutrition can rebuild strength, manage side effects like nausea, and support cellular healing during and after chemotherapy sessions.",
        content="Chemotherapy is a powerful tool in dismantling cancer cells, but it also places a significant toll on the healthy, fast-growing cells of your body. Correct nutrition is an active partner in your recovery.",
        author="Dr. Anjali Deshmukh", role="Lead Oncological Nutritionist",
        date="July 15, 2026", read_time="8 min read", category="Nutrition",
        image="/events/event-3.jpeg", tags=["Nutrition", "Chemotherapy", "Dietary Care", "Wellness"],
    ),
    dict(
        title="The Victory Within: Rajeshwar's Triumph Over Stage III Lymphoma",
        summary="A moving testament to early intervention, familial support, and the relentless spirit of a 34-year-old software engineer who became an advocate.",
        content="Meet Rajeshwar Sen. In November 2024, he was a busy 34-year-old software developer in Pune. What followed was a whirlwind of diagnostic tests culminating in a Stage III Hodgkin Lymphoma diagnosis -- and, ultimately, complete remission.",
        author="Amit Kumar", role="Patient Navigation Lead",
        date="July 18, 2026", read_time="12 min read", category="Survivors",
        image="/events/event-8.jpeg", tags=["Lymphoma", "Survivor Story", "Patient Navigator", "Remission"],
    ),
]

CAMPAIGN_REQUESTS = [
    dict(
        organization_name="IIT Delhi NSS Unit", org_type="College", contact_person="Prof. S. R. Bose",
        email="nss@iitd.ac.in", phone="+91 11 2659 1000", requested_date="Aug 10, 2026",
        location="Dogra Hall, IIT Delhi Campus", expected_attendees=400, status="Pending Scheduling",
    ),
    dict(
        organization_name="Asha Deep Foundation", org_type="NGO", contact_person="Savita Devi",
        email="ashadeep@ngo.org", phone="+91 98112 34567", requested_date="Aug 15, 2026",
        location="Sanjay Colony Community Hall, Okhla", expected_attendees=250, status="Pending Scheduling",
    ),
    dict(
        organization_name="Wipro Technologies Office", org_type="Corporate", contact_person="HR Employee Engagement",
        email="engage@wipro.com", phone="+91 80 2844 0011", requested_date="Aug 22, 2026",
        location="Electronic City Wipro Campus", expected_attendees=500, status="Pending Scheduling",
    ),
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

        for e in EVENTS:
            if db.query(Event).filter(Event.title == e["title"]).first():
                continue
            db.add(Event(**e))

        for b in BLOGS:
            if db.query(BlogArticle).filter(BlogArticle.title == b["title"]).first():
                continue
            db.add(BlogArticle(**b))

        for c in CAMPAIGN_REQUESTS:
            if db.query(CampaignRequest).filter(CampaignRequest.organization_name == c["organization_name"]).first():
                continue
            db.add(CampaignRequest(**c))

        db.commit()
        print("Seed complete. Dev credentials use password: ChangeMe123!")
    finally:
        db.close()


if __name__ == "__main__":
    run()
