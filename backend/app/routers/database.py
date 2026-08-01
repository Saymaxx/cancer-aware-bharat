import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base
from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.backup_record import BackupRecord
from app.models.user import User
from app.schemas.database import BackupRecordOut, DatabaseHealthOut
from app.services.audit import record_event

router = APIRouter(prefix="/database", tags=["database"])

# Logical (row-level JSON) dump rather than a pg_dump binary dump -- portable
# across dev machines that may not have the postgres client tools on PATH,
# and needs no shell subprocess. There's deliberately no restore endpoint:
# restoring is a destructive, one-shot action better left to a human running
# an explicit ops procedure than a one-click web button.
BACKUP_DIR = Path(settings.backup_dir)


def _json_default(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


@router.get("/health", response_model=DatabaseHealthOut)
@limiter.limit("30/minute")
def get_database_health(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    total_size = db.execute(text("SELECT pg_database_size(current_database())")).scalar_one()
    tables_count = db.execute(
        text("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
    ).scalar_one()
    total_records = db.execute(
        text("SELECT COALESCE(SUM(n_live_tup), 0)::bigint FROM pg_stat_user_tables")
    ).scalar_one()
    uptime_seconds = db.execute(
        text("SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))")
    ).scalar_one()
    return DatabaseHealthOut(
        total_size_bytes=int(total_size),
        tables_count=int(tables_count),
        total_records=int(total_records),
        uptime_seconds=int(uptime_seconds),
    )


@router.get("/backups", response_model=list[BackupRecordOut])
@limiter.limit("30/minute")
def list_backups(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    return db.query(BackupRecord).order_by(BackupRecord.created_at.desc()).limit(50).all()


@router.post("/backups", response_model=BackupRecordOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def create_backup(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()

    dump: dict[str, list[dict]] = {}
    for table_name, table in Base.metadata.tables.items():
        rows = db.execute(table.select()).mappings().all()
        dump[table_name] = [dict(row) for row in rows]

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    file_path = BACKUP_DIR / f"backup_{timestamp}.json"
    file_path.write_text(json.dumps(dump, default=_json_default), encoding="utf-8")

    duration_ms = int((time.monotonic() - started) * 1000)
    size_bytes = file_path.stat().st_size
    actor = db.query(User).filter(User.id == UUID(claims["sub"])).first()

    record = BackupRecord(
        file_path=str(file_path),
        size_bytes=size_bytes,
        duration_ms=duration_ms,
        initiated_by=actor.email if actor else claims["role"],
    )
    db.add(record)
    record_event(db, "backup_created", role=claims["role"], actor_id=UUID(claims["sub"]), detail=f"{size_bytes} bytes")
    db.commit()
    db.refresh(record)
    return record
