from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.core.config import settings


def get_client_ip(request: Request) -> str:
    # Behind a real reverse proxy, request.client.host is the proxy's own
    # address for every request -- one attacker's failed logins would then
    # share a rate-limit bucket with every legitimate user. Only trusted
    # when explicitly enabled (see Settings.trust_proxy_headers), since
    # X-Forwarded-For is otherwise a client-controlled header.
    if settings.trust_proxy_headers:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(
    key_func=get_client_ip,
    # Every route is now mounted twice (its original unprefixed path and
    # again under /v1 -- see main.py) using the exact same endpoint
    # function. slowapi's default key_style="url" tracks each mount as a
    # separate rate-limit bucket, which would let an attacker double every
    # limit for free by alternating between the two paths. "endpoint" keys
    # on the view function's own identity instead, so both mounts of the
    # same function share one bucket regardless of which path was hit.
    key_style="endpoint",
)
