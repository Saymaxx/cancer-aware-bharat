import logging

from app.core.config import settings
from app.services.email import ConsoleEmailSender, SmtpEmailSender, get_email_sender


class TestGetEmailSender:
    def test_defaults_to_console(self, monkeypatch):
        monkeypatch.setattr(settings, "email_backend", "console")
        assert isinstance(get_email_sender(), ConsoleEmailSender)

    def test_smtp_backend_selects_smtp_sender(self, monkeypatch):
        monkeypatch.setattr(settings, "email_backend", "smtp")
        assert isinstance(get_email_sender(), SmtpEmailSender)


class TestConsoleEmailSender:
    def test_logs_instead_of_sending(self, caplog):
        with caplog.at_level(logging.INFO):
            ConsoleEmailSender().send("someone@example.com", "Test Subject", "Test Body")
        assert "someone@example.com" in caplog.text
        assert "Test Subject" in caplog.text


class TestSmtpEmailSender:
    def test_failed_send_is_caught_and_logged_not_raised(self, monkeypatch, caplog):
        monkeypatch.setattr(settings, "smtp_host", "smtp.does-not-exist.invalid")
        monkeypatch.setattr(settings, "smtp_port", 587)

        with caplog.at_level(logging.ERROR):
            # Must not raise -- a broken SMTP config should never block the
            # action (account creation, OTP issuance) that triggered it.
            SmtpEmailSender().send("someone@example.com", "Test Subject", "Test Body")
        assert "Failed to send email" in caplog.text
