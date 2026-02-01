import secrets
from datetime import datetime, timedelta

from backend.app.common.utils import *
from backend.app.core.config import settings
from backend.app.core.email import send_email, render_reset_password_html
from .repository import UserRepository
from .schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from backend.app.models.models import UserModel

class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register(self, user_data: UserCreate) -> UserModel:
        if await self.repo.get_by_email(user_data.email):
            raise AppException(message="Email already exist", status_code=400)
        
        return await self.repo.create_user(
            email=user_data.email,
            password_hash=hash_password(user_data.password)
        )

    async def authenticate(self, credentials: UserLogin) -> UserModel:
        user = await self.repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.password_hash):
           raise AppException(message="Invalid credentilas", status_code=400)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=timedelta(minutes=2)
        )
        refresh_token = create_refresh_token({"sub": str(user.id)})

        return {
            "userId": str(user.id),
            "accessToken": access_token,
            "refreshToken": refresh_token
        }

    async def forgot_password(self, email: str) -> None:
        user = await self.repo.get_by_email(email)
        if not user:
            return
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=1)
        await self.repo.set_reset_token(email, token, expires)
        reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"
        html = render_reset_password_html(reset_link, settings.APP_NAME)
        send_email(user.email, f"Reset your password – {settings.APP_NAME}", html)

    async def reset_password(self, token: str, new_password: str) -> None:
        user = await self.repo.get_by_reset_token(token)
        if not user:
            raise AppException(message="Invalid or expired reset link", status_code=400)
        if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
            raise AppException(message="Reset link has expired", status_code=400)
        await self.repo.update_password(user, hash_password(new_password))