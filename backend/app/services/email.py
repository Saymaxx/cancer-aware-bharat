"""General-purpose email sending, following the same "safe console default,
opt-in real backend" pattern as app/core/storage.py (S3) and app/core/otp.py.
Swapping EMAIL_BACKEND=smtp in .env (with real SMTP_* credentials) is the
only thing that turns this from logging into actually sending mail.
"""
import logging
import smtplib
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class ConsoleEmailSender:
    def send(self, to: str, subject: str, body: str) -> None:
        logger.info(
            "[DEV-ONLY] Email to %s -- subject: %s -- no real email channel is configured, this is only ever logged\n%s",
            to, subject, body,
        )


class SmtpEmailSender:
    def send(self, to: str, subject: str, body: str) -> None:
        message = MIMEText(body)
        message["Subject"] = subject
        message["From"] = settings.smtp_from_email or settings.smtp_username or ""
        message["To"] = to
        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_use_tls:
                    server.starttls()
                if settings.smtp_username and settings.smtp_password:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.sendmail(message["From"], [to], message.as_string())
        except Exception:
            # Best-effort: a failed send must never block the action that
            # triggered it (account creation, hospital approval, an OTP) --
            # those all already show/log the same information another way,
            # so email is a convenience channel, not the only path.
            logger.exception("Failed to send email to %s (subject: %s)", to, subject)


def get_email_sender():
    if settings.email_backend == "smtp":
        return SmtpEmailSender()
    return ConsoleEmailSender()
