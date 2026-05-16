from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title="Goal Tracking Portal API",
    description="API for AtomQuest Hackathon - Goal Setting & Tracking Portal",
    version="1.0.0"
)

# Custom CORS middleware to ensure headers are always added
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
        return response

# Add custom CORS middleware first
app.add_middleware(CustomCORSMiddleware)

# Configure CORS - MUST be before route definitions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Import routers
from app.api.endpoints import (
    auth,
    goals,
    manager,
    admin,
    checkins,
    reports,
    notifications,
    ai,
    templates,
    thrust_areas
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(manager.router, prefix="/api/manager", tags=["Manager"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(checkins.router, prefix="/api/checkins", tags=["Check-ins"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
app.include_router(thrust_areas.router, prefix="/api/thrust-areas", tags=["Thrust Areas"])

@app.get("/")
def root():
    return {
        "message": "Goal Tracking Portal API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
