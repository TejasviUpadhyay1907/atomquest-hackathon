from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Force reload .env file to get latest values
load_dotenv(override=True)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External Services
    RESEND_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",  # Allow all Vercel deployments
        "https://*.onrender.com",  # Allow Render
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance and clean DATABASE_URL
settings = Settings()
# Strip any whitespace, newlines, or special characters from DATABASE_URL
settings.DATABASE_URL = settings.DATABASE_URL.strip().replace('\n', '').replace('\r', '')
