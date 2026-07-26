from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.routers import auth, blogs, enquiries, events, hospitals, notifications, volunteers

app = FastAPI(title="Cancer Aware Bharat API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
def health_check():
    return {"status": "ok"}
