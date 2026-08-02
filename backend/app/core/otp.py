"""OTP generation/verification for patient email verification and password
reset. ConsoleOtpSender logs the code server-side instead of sending it
anywhere -- the safe default when EMAIL_BACKEND=console (see
app/core/config.py). Setting EMAIL_BACKEND=smtp with real SMTP_* credentials
switches get_otp_sender() to EmailOtpSender, which sends the code as a real
email via app/services/email.py. Swapping happens only inside
get_otp_sender() -- its two call sites in app/routers/patients.py never change.
"""
import hashlib
import logging
import secrets

from app.core.config import settings

logger = logging.getLogger(__name__)

OTP_LENGTH = 6
OTP_TTL_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


def generate_otp_code() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))


def hash_otp_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def verify_otp_hash(code: str, code_hash: str) -> bool:
    return secrets.compare_digest(hash_otp_code(code), code_hash)


class ConsoleOtpSender:
    def send(self, email: str, code: str, purpose: str) -> None:
        logger.info(
            "[DEV-ONLY] OTP for %s (%s): %s -- no real email/SMS channel is configured, this is only ever logged",
            email, purpose, code,
        )


class EmailOtpSender:
    def send(self, email: str, code: str, purpose: str) -> None:
        from app.services.email import get_email_sender

        get_email_sender().send(
            email,
            "Your Cancer Aware Bharat verification code",
            f"Your one-time code for {purpose} is: {code}\n\nThis code expires in {OTP_TTL_MINUTES} minutes.",
        )


def get_otp_sender():
    if settings.email_backend == "smtp":
        return EmailOtpSender()
    return ConsoleOtpSender()
