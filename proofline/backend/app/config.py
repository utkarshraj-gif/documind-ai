import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    APP_NAME: str = "Proofline"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field(default="sqlite:///./proofline.db")

    # JWT Authentication
    JWT_SECRET: str = Field(default="proofline_super_secret_jwt_key_2026_dev_mode")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI Configuration
    AI_PROVIDER: str = Field(default="gemini")
    GEMINI_API_KEY: str = Field(default="")
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # File Uploads
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = Field(default="./storage/uploads")

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
