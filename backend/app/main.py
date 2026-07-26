from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, blogs, enquiries, events, hospitals, notifications, volunteers

app = FastAPI(title="Cancer Aware Bharat API", version="0.1.0")

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
