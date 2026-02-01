import os
from pydantic_settings import BaseSettings
from typing import Optional

# Prefer .env at project root (parent of backend/)
_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
if not os.path.isfile(_env_path):
    _env_path = ".env"

class Settings(BaseSettings):
    APP_NAME: str = "Paisatracker"
    DATABASE_URL: str

    # Email (SMTP) – for reset password and monthly summary
    MAIL_HOST: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USER: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None  # e.g. "Paisatracker <noreply@yourdomain.com>"
    MAIL_TLS: bool = True

    # Frontend URL for reset-password link, welcome email, etc.
    # Set FRONTEND_URL in .env: use https://paisaatracker.onrender.com for production so reset links use Paisatracker domain
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = _env_path
        env_file_encoding = "utf-8"

settings = Settings()
