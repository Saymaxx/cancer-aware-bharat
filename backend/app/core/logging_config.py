"""Minimal structured logging setup.

Before this, the app had no `logging` calls anywhere -- an unhandled
exception vanished with no server-side trace at all. This configures the
root logger once at startup so every module can just do
`logger = logging.getLogger(__name__)` and have it actually go somewhere
(stdout, in a format a platform's log collector can parse), independent of
whether uvicorn's own access-log config is present.
"""
import logging
import sys

from app.core.config import settings

_LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s: %(message)s"


def configure_logging() -> None:
    root = logging.getLogger()
    if root.handlers:
        return  # already configured (e.g. re-imported under a test runner)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(_LOG_FORMAT))

    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    root.setLevel(level)
    root.addHandler(handler)
