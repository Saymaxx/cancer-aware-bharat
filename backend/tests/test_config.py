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
