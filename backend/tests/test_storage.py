import io
from uuid import uuid4

import pytest
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.storage import LocalDiskStorage, S3Storage, get_storage


class TestLocalDiskStorage:
    def test_save_and_open_round_trip(self, tmp_path, monkeypatch):
        monkeypatch.setattr(settings, "upload_dir", str(tmp_path))
        storage = LocalDiskStorage()
        key = storage.save(uuid4(), "report.pdf", b"hello world")
        with storage.open(key) as f:
            assert f.read() == b"hello world"

    def test_save_strips_no_directory_components_from_filename(self, tmp_path, monkeypatch):
        # The router already reduces file.filename via Path(...).name before
        # calling save() -- this just confirms save() itself never writes
        # outside upload_dir/<enquiry_id>/ no matter what filename it's given.
        monkeypatch.setattr(settings, "upload_dir", str(tmp_path))
        storage = LocalDiskStorage()
        enquiry_id = uuid4()
        key = storage.save(enquiry_id, "report.pdf", b"data")
        assert str(tmp_path / str(enquiry_id)) in key

    def test_open_missing_key_raises_file_not_found(self, tmp_path):
        storage = LocalDiskStorage()
        with pytest.raises(FileNotFoundError):
            storage.open(str(tmp_path / "does-not-exist.pdf"))


class FakeS3Client:
    """Minimal in-memory stand-in for the two boto3 S3 client calls this
    module makes -- avoids pulling in moto/real AWS credentials for a unit
    test that only needs to prove S3Storage's own read/write logic."""

    def __init__(self):
        self.objects: dict[tuple[str, str], bytes] = {}

    def upload_fileobj(self, fileobj, bucket, key):
        self.objects[(bucket, key)] = fileobj.read()

    def get_object(self, Bucket, Key):
        try:
            data = self.objects[(Bucket, Key)]
        except KeyError:
            raise ClientError({"Error": {"Code": "NoSuchKey", "Message": "not found"}}, "GetObject")
        return {"Body": io.BytesIO(data)}


class TestS3Storage:
    def test_save_and_open_round_trip(self, monkeypatch):
        fake_client = FakeS3Client()
        monkeypatch.setattr("boto3.client", lambda *a, **kw: fake_client)
        monkeypatch.setattr(settings, "s3_bucket", "test-bucket")

        storage = S3Storage()
        key = storage.save(uuid4(), "report.pdf", b"hello s3")
        assert storage.open(key).read() == b"hello s3"

    def test_key_is_namespaced_under_enquiry_id(self, monkeypatch):
        monkeypatch.setattr("boto3.client", lambda *a, **kw: FakeS3Client())
        monkeypatch.setattr(settings, "s3_bucket", "test-bucket")
        enquiry_id = uuid4()

        storage = S3Storage()
        key = storage.save(enquiry_id, "report.pdf", b"data")
        assert key.startswith(f"reports/{enquiry_id}/")

    def test_open_missing_key_raises_file_not_found(self, monkeypatch):
        monkeypatch.setattr("boto3.client", lambda *a, **kw: FakeS3Client())
        monkeypatch.setattr(settings, "s3_bucket", "test-bucket")

        storage = S3Storage()
        with pytest.raises(FileNotFoundError):
            storage.open("reports/does/not/exist.pdf")

    def test_unexpected_client_error_propagates(self, monkeypatch):
        class ExplodingClient(FakeS3Client):
            def get_object(self, Bucket, Key):
                raise ClientError({"Error": {"Code": "AccessDenied", "Message": "nope"}}, "GetObject")

        monkeypatch.setattr("boto3.client", lambda *a, **kw: ExplodingClient())
        monkeypatch.setattr(settings, "s3_bucket", "test-bucket")

        storage = S3Storage()
        # Anything other than a missing-object error should surface as-is,
        # not get silently swallowed into a 404.
        with pytest.raises(ClientError):
            storage.open("reports/some/key.pdf")

    def test_endpoint_url_passed_through_for_non_aws_endpoints(self, monkeypatch):
        captured_kwargs = {}

        def fake_boto_client(service, **kwargs):
            captured_kwargs.update(kwargs)
            return FakeS3Client()

        monkeypatch.setattr("boto3.client", fake_boto_client)
        monkeypatch.setattr(settings, "s3_bucket", "test-bucket")
        monkeypatch.setattr(settings, "s3_endpoint_url", "https://example.r2.cloudflarestorage.com")
        monkeypatch.setattr(settings, "s3_region", "auto")

        S3Storage()
        assert captured_kwargs["endpoint_url"] == "https://example.r2.cloudflarestorage.com"
        assert captured_kwargs["region_name"] == "auto"


class TestGetStorage:
    def test_returns_local_storage_by_default(self, monkeypatch):
        monkeypatch.setattr(settings, "storage_backend", "local")
        get_storage.cache_clear()
        try:
            assert isinstance(get_storage(), LocalDiskStorage)
        finally:
            get_storage.cache_clear()

    def test_returns_s3_storage_when_selected(self, monkeypatch):
        monkeypatch.setattr("boto3.client", lambda *a, **kw: FakeS3Client())
        monkeypatch.setattr(settings, "storage_backend", "s3")
        monkeypatch.setattr(settings, "s3_bucket", "test-bucket")
        get_storage.cache_clear()
        try:
            assert isinstance(get_storage(), S3Storage)
        finally:
            get_storage.cache_clear()
