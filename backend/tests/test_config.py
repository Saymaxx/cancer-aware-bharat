import pytest

from app.core.config import DEV_ONLY_CORS_ORIGINS, Settings

VALID_PROD_SECRET = "a" * 40


class TestCorsProdGuard:
    def test_production_rejects_default_cors_origins(self):
        with pytest.raises(RuntimeError, match="CORS_ORIGINS"):
            Settings(environment="production", jwt_secret_key=VALID_PROD_SECRET, cors_origins=DEV_ONLY_CORS_ORIGINS)

    def test_production_accepts_real_cors_origins(self):
        settings = Settings(environment="production", jwt_secret_key=VALID_PROD_SECRET, cors_origins="https://awarebharat.org")
        assert settings.cors_origin_list == ["https://awarebharat.org"]

    def test_development_does_not_validate_cors(self):
        # Should not raise even though this is the dev-only default -- the
        # guard only fires under ENVIRONMENT=production.
        Settings(environment="development", cors_origins=DEV_ONLY_CORS_ORIGINS)


class TestStorageBackendGuard:
    def test_s3_backend_without_bucket_rejected(self):
        with pytest.raises(RuntimeError, match="S3_BUCKET"):
            Settings(storage_backend="s3", s3_bucket=None)

    def test_s3_backend_with_bucket_accepted(self):
        settings = Settings(storage_backend="s3", s3_bucket="cab-reports")
        assert settings.storage_backend == "s3"
        assert settings.s3_bucket == "cab-reports"

    def test_unknown_backend_rejected(self):
        with pytest.raises(RuntimeError, match="STORAGE_BACKEND"):
            Settings(storage_backend="azure-blob")

    def test_local_backend_is_the_default(self):
        settings = Settings()
        assert settings.storage_backend == "local"


class TestRateLimitStorage:
    def test_memory_is_the_default(self):
        settings = Settings()
        assert settings.rate_limit_storage_uri == "memory://"

    def test_accepts_a_redis_uri(self):
        settings = Settings(rate_limit_storage_uri="redis://localhost:6379")
        assert settings.rate_limit_storage_uri == "redis://localhost:6379"
