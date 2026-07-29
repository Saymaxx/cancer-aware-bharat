import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging_config import configure_logging
from app.deps import DbSession
from app.routers import auth, blogs, enquiries, events, hospitals, notifications, patients, volunteers

configure_logging()
logger = logging.getLogger(__name__)

# /docs, /redoc, and the raw /openapi.json schema are unauthenticated by
# FastAPI's default -- fine for development, but in production they hand an
# unauthenticated visitor a complete map of every route, request/response
# shape, and auth scheme. Disabling them there costs nothing (they're a dev
# convenience, not a runtime dependency) and closes that recon surface.
_docs_kwargs = {"docs_url": None, "redoc_url": None, "openapi_url": None} if settings.is_production else {}

app = FastAPI(title="Cancer Aware Bharat API", version="0.1.0", **_docs_kwargs)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Last-resort handler for anything that isn't already an HTTPException.

    Before this, an unexpected error (a DB constraint violation, a None
    fed into a non-optional field, etc.) vanished as a bare, unlogged 500
    with no server-side trace at all -- completely unobservable in
    production. This does not change behavior for any *handled* error:
    FastAPI's own HTTPException handler still takes precedence (it's
    registered for the more specific type), so every existing
    `{"detail": ...}` response is untouched. This only catches what would
    otherwise be a silent crash.
    """
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Docs/ReDoc load their JS/CSS from a CDN by default, so a strict CSP there
# would break them -- everything else in this app is a pure JSON API with
# no HTML/JS of its own to execute, so `default-src 'none'` is safe and
# meaningfully closes off any XSS-in-a-response-body concern.
_DOCS_PATHS = {"/docs", "/redoc"}


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    if request.url.path not in _DOCS_PATHS:
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    # No API response was ever given a caching directive at all, so an
    # intermediate proxy or the browser's own HTTP cache was free to decide
    # for itself -- including caching a patient-data response tied to one
    # session's Authorization header for a different visitor to reuse. This
    # sets a safe default everywhere; the handful of genuinely public,
    # non-personalized list/detail endpoints (hospitals/events/blogs) opt
    # into a short public max-age explicitly, overriding this default.
    response.headers.setdefault("Cache-Control", "no-store")
    return response

_ROUTERS = (auth.router, enquiries.router, hospitals.router, notifications.router, volunteers.router, patients.router, events.router, blogs.router)

for _router in _ROUTERS:
    app.include_router(_router)

# /v1 introduced now, before any future breaking change forces the issue --
# every route above stays reachable at its original unprefixed path too, so
# no existing deployment, bookmarked API doc link, or external consumer
# breaks. /v1 is the new canonical path going forward; the frontend already
# calls it (see src/api/client.ts). The unprefixed routes can be retired in
# a later phase once nothing depends on them anymore.
for _router in _ROUTERS:
    app.include_router(_router, prefix="/v1")


@app.get("/health")
def health_check(db: DbSession):
    """Reports unhealthy (503) if the database isn't reachable, instead of
    always returning 200 regardless of the app's actual ability to serve
    requests -- a load balancer/orchestrator relying on the old static
    {"status": "ok"} would never detect a database outage."""
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Health check failed: database unreachable")
        return JSONResponse(status_code=503, content={"status": "error", "detail": "database unreachable"})
    return {"status": "ok"}
