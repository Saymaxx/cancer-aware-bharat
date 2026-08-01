from datetime import datetime
from uuid import UUID

from app.schemas.base import CamelModel


class BackupRecordOut(CamelModel):
    id: UUID
    size_bytes: int
    duration_ms: int
    initiated_by: str
    created_at: datetime


class DatabaseHealthOut(CamelModel):
    total_size_bytes: int
    tables_count: int
    total_records: int
    uptime_seconds: int
