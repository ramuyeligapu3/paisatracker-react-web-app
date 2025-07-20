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
import os

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("MONGO_URI environment variable is missing")

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()  # picks `paisaatracker_db` from URI



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
