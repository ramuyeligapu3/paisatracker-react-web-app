from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    APP_NAME: str = "Paisatracker"
    DATABASE_URL: str = Field(..., description="MongoDB connection string")

    MAIL_HOST: str = Field("smtp.gmail.com")
    MAIL_PORT: int = Field(587,description="Port to send emails from")
    MAIL_USER: str = Field(...,description="Email address to send emails from")
    MAIL_PASSWORD: str = Field(...,description="Password for the email address")
    MAIL_FROM: str = Field(...,description="Email address to send emails from")
    MAIL_TLS: bool = Field(True,description="Whether to use TLS to send emails")

    FRONTEND_URL: str = Field("https://paisaatracker.onrender.com",description="URL of the frontend application")


settings = Settings()
