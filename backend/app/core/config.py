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

DEV_ONLY_CORS_ORIGINS = "http://localhost:3000,http://localhost:5173"


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
    cors_origins: str = DEV_ONLY_CORS_ORIGINS
    upload_dir: str = "./uploads"
    # Local-disk destination for the logical (row-level JSON) DB dumps the
    # Database Backup tab triggers -- deliberately not routed through the S3
    # object-storage backend above, which is scoped to user-uploaded medical
    # reports, not ops backups.
    backup_dir: str = "./backups"
    log_level: str = "INFO"

    # "local" (default -- writes to upload_dir on this machine's disk, fine
    # for dev/tests/a first low-volume launch) or "s3" (any S3-compatible
    # object store: AWS S3, Cloudflare R2, MinIO, a platform's own blob
    # storage -- all speak the same API boto3 already knows). Credentials are
    # deliberately *not* Settings fields: boto3's own default chain (env vars
    # AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, an IAM role, ECS/EC2 instance
    # metadata) is the standard way to hand a process S3 credentials, and
    # reusing it here means one less place secrets get duplicated or logged.
    storage_backend: str = "local"
    s3_bucket: str | None = None
    s3_region: str | None = None
    # Only needed for a non-AWS S3-compatible endpoint (R2, MinIO, etc.);
    # leave unset against real AWS S3.
    s3_endpoint_url: str | None = None

    # Off by default: trusting X-Forwarded-For only makes sense when a real
    # reverse proxy/load balancer sits in front of the app and sets that
    # header itself. Turning this on without such a proxy would let any
    # client spoof the header to dodge rate limiting entirely.
    trust_proxy_headers: bool = False

    # "console" (default -- logs the email instead of sending it, same safe
    # no-external-account pattern as storage_backend="local") or "smtp" (a
    # real mailbox or transactional-email service's SMTP endpoint). Used for
    # both app/services/email.py and the OTP sender in app/core/otp.py.
    email_backend: str = "console"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None
    smtp_use_tls: bool = True

    # Razorpay checkout integration for public donations (see
    # app/routers/donations.py's /checkout and /verify endpoints). Both
    # unset by default -- those endpoints return 503 "not configured" until
    # real keys are set, rather than the app pretending to take payments it
    # can't actually process.
    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def payment_gateway_configured(self) -> bool:
        return bool(self.razorpay_key_id and self.razorpay_key_secret)

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
        if self.cors_origins.strip() == DEV_ONLY_CORS_ORIGINS:
            raise RuntimeError(
                "CORS_ORIGINS is still the localhost-only development default. Set it to "
                "your real production origin(s) (comma-separated) before running with "
                "ENVIRONMENT=production -- otherwise no browser-based frontend will be able "
                "to call this API at all."
            )
        return self

    @model_validator(mode="after")
    def _validate_storage_backend(self) -> "Settings":
        if self.storage_backend not in ("local", "s3"):
            raise RuntimeError(f"STORAGE_BACKEND must be 'local' or 's3', got {self.storage_backend!r}.")
        if self.storage_backend == "s3" and not self.s3_bucket:
            raise RuntimeError(
                "STORAGE_BACKEND=s3 requires S3_BUCKET to be set -- the bucket/container "
                "uploaded patient reports are written to."
            )
        return self


settings = Settings()
