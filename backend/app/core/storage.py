"""Storage backends for uploaded patient reports.

Local disk works fine for dev, tests, and a first low-volume launch, but
most container platforms wipe the filesystem on every deploy and a
multi-instance deployment only ever sees whatever landed on that one
instance -- neither is acceptable once real patient files are involved.
STORAGE_BACKEND=s3 swaps in any S3-compatible object store (AWS S3,
Cloudflare R2, MinIO, a platform's own blob storage) with no other code
changes; see app/core/config.py for the switch and app/routers/enquiries.py
for the only two call sites (upload_report, download_report).

UploadedReport.url stores whatever save() returns -- a local filesystem
path for the local backend, an object key for the s3 backend. Neither is
ever returned to a client directly (see UploadedReportOut.url in
schemas/enquiry.py); it's only ever fed back into open() here.
"""
import abc
import io
import uuid
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO
from uuid import UUID

from app.core.config import settings


class ReportStorage(abc.ABC):
    @abc.abstractmethod
    def save(self, enquiry_id: UUID, safe_filename: str, contents: bytes) -> str:
        """Persist contents and return an opaque key to store as UploadedReport.url."""

    @abc.abstractmethod
    def open(self, storage_key: str) -> BinaryIO:
        """Return a readable binary stream for storage_key.

        Raises FileNotFoundError if the object doesn't exist -- callers
        translate that into the same 404 regardless of backend.
        """


class LocalDiskStorage(ReportStorage):
    def save(self, enquiry_id: UUID, safe_filename: str, contents: bytes) -> str:
        upload_dir = Path(settings.upload_dir) / str(enquiry_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        stored_name = f"{uuid.uuid4()}_{safe_filename}"
        path = upload_dir / stored_name
        path.write_bytes(contents)
        return str(path)

    def open(self, storage_key: str) -> BinaryIO:
        path = Path(storage_key)
        if not path.is_file():
            raise FileNotFoundError(storage_key)
        return path.open("rb")


class S3Storage(ReportStorage):
    """Any S3-compatible endpoint -- boto3 doesn't care whether it's talking
    to real AWS S3 or a compatible store like Cloudflare R2/MinIO, only
    s3_endpoint_url changes."""

    def __init__(self) -> None:
        import boto3  # local import: only paid for when this backend is actually selected

        client_kwargs: dict[str, str] = {}
        if settings.s3_endpoint_url:
            client_kwargs["endpoint_url"] = settings.s3_endpoint_url
        if settings.s3_region:
            client_kwargs["region_name"] = settings.s3_region
        self._client = boto3.client("s3", **client_kwargs)
        self._bucket = settings.s3_bucket

    def save(self, enquiry_id: UUID, safe_filename: str, contents: bytes) -> str:
        key = f"reports/{enquiry_id}/{uuid.uuid4()}_{safe_filename}"
        self._client.upload_fileobj(io.BytesIO(contents), self._bucket, key)
        return key

    def open(self, storage_key: str) -> BinaryIO:
        from botocore.exceptions import ClientError

        try:
            obj = self._client.get_object(Bucket=self._bucket, Key=storage_key)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code in ("NoSuchKey", "404"):
                raise FileNotFoundError(storage_key) from exc
            raise
        return obj["Body"]  # botocore StreamingBody: supports .read(n) and .close(), same as a file object


@lru_cache
def get_storage() -> ReportStorage:
    """Cached so the S3 client (and its credential resolution) is built once
    per process, not on every request -- boto3 clients are safe to reuse
    across threads."""
    if settings.storage_backend == "s3":
        return S3Storage()
    return LocalDiskStorage()
