"""Test fixtures.

Runs against the same dev Postgres database (see backend/.env), but each
test executes inside a SAVEPOINT that's rolled back afterwards -- nothing
a test does is ever actually persisted. This is the standard SQLAlchemy
"join a session into an external transaction" pattern, which lets our
service layer call session.commit() freely without tests leaking into
each other or into your local dev data.

Assumes `python -m app.seed` has already been run against this database,
since several fixtures log in as the seeded admin/superadmin/hospital
accounts rather than re-creating them.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.main import app

engine = create_engine(settings.database_url)
TestingSessionLocal = sessionmaker(bind=engine)

ADMIN_CREDENTIALS = ("admin@awarebharat.local", "ChangeMe123!")
SUPERADMIN_CREDENTIALS = ("superadmin@awarebharat.local", "ChangeMe123!")
HOSPITAL1_CREDENTIALS = ("hospital1@awarebharat.local", "ChangeMe123!")
HOSPITAL2_CREDENTIALS = ("hospital2@awarebharat.local", "ChangeMe123!")


@pytest.fixture()
def db_session():
    connection = engine.connect()
    outer_transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    outer_transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    limiter.reset()  # each test gets a fresh rate-limit bucket, independent of other tests
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_token(client):
    resp = client.post("/auth/staff/login", json={"email": ADMIN_CREDENTIALS[0], "password": ADMIN_CREDENTIALS[1]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


@pytest.fixture()
def superadmin_token(client):
    resp = client.post("/auth/staff/login", json={"email": SUPERADMIN_CREDENTIALS[0], "password": SUPERADMIN_CREDENTIALS[1]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


@pytest.fixture()
def hospital1_token(client):
    resp = client.post("/auth/hospital/login", json={"email": HOSPITAL1_CREDENTIALS[0], "password": HOSPITAL1_CREDENTIALS[1]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


@pytest.fixture()
def hospital2_token(client):
    resp = client.post("/auth/hospital/login", json={"email": HOSPITAL2_CREDENTIALS[0], "password": HOSPITAL2_CREDENTIALS[1]})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


@pytest.fixture()
def hospitals(client):
    resp = client.get("/hospitals")
    assert resp.status_code == 200, resp.text
    return resp.json()


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def extract_otp_code(caplog_text: str, email: str | None = None) -> str:
    """ConsoleOtpSender (app/core/otp.py) logs the code instead of sending it
    anywhere real -- tests read it back out of the log the same way a real
    email/SMS provider would deliver it to the user.

    caplog accumulates every log line for the whole test, so with more than
    one registration/reset in a test there can be several OTP lines --
    always returns the *most recent* match (optionally scoped to a specific
    email) rather than the first, so callers get the code that's actually
    still valid.
    """
    import re
    pattern = rf"OTP for {re.escape(email)} \([^)]+\): (\d{{6}})" if email else r"OTP for [^:]+: (\d{6})"
    matches = re.findall(pattern, caplog_text)
    assert matches, f"no OTP code found in captured logs for {email!r}: {caplog_text!r}"
    return matches[-1]


def submit_sample_enquiry(client, **overrides) -> dict:
    payload = {
        "patientName": "Pytest Patient",
        "age": 40,
        "gender": "Female",
        "phone": "+91 90000 11111",
        "city": "Chennai",
        "reason": "Free Cancer Screening",
    }
    payload.update(overrides)
    resp = client.post("/enquiries", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()
