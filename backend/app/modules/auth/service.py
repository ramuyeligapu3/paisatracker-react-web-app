from backend.app.common.utils import *
from .repository import UserRepository
from .schemas import UserCreate, UserLogin
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