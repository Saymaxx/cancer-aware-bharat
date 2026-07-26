from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_JWT_SECRET_DEFAULT = "dev-secret-change-me"
MIN_PRODUCTION_SECRET_LENGTH = 32

# Any value ever published as a placeholder in this repo (code default,
# .env.example, docs) is exactly as guessable as the code default itself --
# a length check alone doesn't catch someone copying .env.example verbatim.
INSECURE_JWT_SECRETS = {
    INSECURE_JWT_SECRET_DEFAULT,
    "change-me-to-a-long-random-string",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # "development" (default) | "production". Gates production-only startup
    # checks (JWT secret strength, refusing to run the demo seed script)
    # without changing behavior for anyone who hasn't set this explicitly.
    environment: str = "development"

    database_url: str = "postgresql+psycopg://cab_user:cab_password@localhost:5433/cancer_aware_bharat"
    jwt_secret_key: str = INSECURE_JWT_SECRET_DEFAULT
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    upload_dir: str = "./uploads"
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @model_validator(mode="after")
    def _reject_insecure_secret_in_production(self) -> "Settings":
        if not self.is_production:
            return self
        if self.jwt_secret_key in INSECURE_JWT_SECRETS:
            raise RuntimeError(
                "JWT_SECRET_KEY is still a placeholder value published in this repo's "
                "code/docs. Set a real secret "
                "(e.g. `python -c \"import secrets; print(secrets.token_urlsafe(48))\"`) "
                "before running with ENVIRONMENT=production."
            )
        if len(self.jwt_secret_key) < MIN_PRODUCTION_SECRET_LENGTH:
            raise RuntimeError(
                f"JWT_SECRET_KEY must be at least {MIN_PRODUCTION_SECRET_LENGTH} characters "
                "in production."
            )
        return self


settings = Settings()
