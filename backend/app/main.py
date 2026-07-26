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
from app.routers import auth, blogs, enquiries, events, hospitals, notifications, volunteers

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="Cancer Aware Bharat API", version="0.1.0")

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

app.include_router(auth.router)
app.include_router(enquiries.router)
app.include_router(hospitals.router)
app.include_router(notifications.router)
app.include_router(volunteers.router)
app.include_router(events.router)
app.include_router(blogs.router)


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
