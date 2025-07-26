from backend.app.models.models import UserModel

class UserRepository:
    async def get_by_email(self, email: str) -> UserModel | None:
        return await UserModel.find_one(UserModel.email == email)

    async def create_user(self, email: str, password_hash: str) -> UserModel:
        user = UserModel(email=email, password_hash=password_hash)
        await user.insert()
        return user