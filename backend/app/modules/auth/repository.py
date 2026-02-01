from datetime import datetime
from backend.app.models.models import UserModel

class UserRepository:
    async def get_by_email(self, email: str) -> UserModel | None:
        return await UserModel.find_one(UserModel.email == email)

    async def get_by_id(self, user_id: str) -> UserModel | None:
        try:
            from beanie import PydanticObjectId
            return await UserModel.get(PydanticObjectId(user_id))
        except Exception:
            return None

    async def get_by_reset_token(self, token: str) -> UserModel | None:
        return await UserModel.find_one(UserModel.reset_token == token)

    async def create_user(self, email: str, password_hash: str) -> UserModel:
        user = UserModel(email=email, password_hash=password_hash)
        await user.insert()
        return user

    async def set_reset_token(self, email: str, token: str, expires: datetime) -> UserModel | None:
        user = await self.get_by_email(email)
        if not user:
            return None
        user.reset_token = token
        user.reset_token_expires = expires
        await user.save()
        return user

    async def clear_reset_token(self, user: UserModel) -> None:
        user.reset_token = None
        user.reset_token_expires = None
        await user.save()

    async def update_password(self, user: UserModel, password_hash: str) -> None:
        user.password_hash = password_hash
        user.reset_token = None
        user.reset_token_expires = None
        await user.save()