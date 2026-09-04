from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Debet.auto API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database: Supports PostgreSQL (postgresql+asyncpg://...) with fallback to SQLite for local development
    DATABASE_URL: str = "sqlite+aiosqlite:///./debet.db"
    
    # Security: JWT & Session
    SECRET_KEY: str = "debet-auto-super-secure-master-secret-key-2026-xyz789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days (one week session)
    
    # Master Password (can be overridden via .env)
    MASTER_PASSWORD: str = "010700GkO"
    
    # CORS Origins (Vite local dev + GitHub Pages production)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "https://tigarden.github.io"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
