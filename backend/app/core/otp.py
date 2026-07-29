"""OTP generation/verification for patient email verification and password
reset. No real email/SMS channel is wired up yet -- ConsoleOtpSender logs the
code server-side instead of sending it anywhere, the same "safe default that
needs no external account" pattern already used for object storage (see
app/core/storage.py). Swapping in a real sender later only touches the two
call sites of get_otp_sender() in app/routers/patients.py.
"""
import hashlib
import logging
import secrets

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


def get_otp_sender() -> ConsoleOtpSender:
    return ConsoleOtpSender()
