from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title="Goal Tracking Portal API",
    description="API for AtomQuest Hackathon - Goal Setting & Tracking Portal",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
