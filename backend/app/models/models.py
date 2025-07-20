from pydantic import BaseModel, EmailStr
from beanie import Document, init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import EmailStr
from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId


from beanie import Document, Link
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import PydanticObjectId

# --- MongoDB Setup ---
MONGO_URI = "mongodb+srv://ramuyeligapu6:Kr1pn4c8NjMp7eTM@cluster0.zrru1.mongodb.net/"
DATABASE_NAME = "paisaatracker_db"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

# --- Models ---

class UserModel(Document):
    email: EmailStr
    password_hash: str

    class Settings:
        collection = "users"


class TransactionModel(Document):
    user_id: Link[UserModel]  # 🟢 Use Link for reference
    amount: float
    category: str
    account: Optional[str] = None
    date: datetime
    description: Optional[str] = None

    class Settings:
        collection = "transactions"

# --- Register Models ---
document_models = [UserModel, TransactionModel]
