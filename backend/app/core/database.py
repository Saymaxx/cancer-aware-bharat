from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# pool_pre_ping already guards against a stale pooled connection being
# handed out (it does a lightweight liveness check first and transparently
# reconnects) -- pool_recycle is the other half of that: most managed
# Postgres providers (RDS, Supabase, etc.) drop idle server-side connections
# after a timeout of their own, and without an app-side recycle a connection
# can go stale in a way pre_ping doesn't always catch cleanly. Recycling
# every 30 minutes keeps pooled connections well under any provider's idle
# cutoff.
engine = create_engine(settings.database_url, pool_pre_ping=True, pool_recycle=1800)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
