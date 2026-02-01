import os
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from beanie import Document, init_beanie, Link

# # 🌱 Load environment variables
# load_dotenv()

# # 🔗 MongoDB connection
# MONGO_URI = os.getenv("MONGO_URI", "").strip()
# if not MONGO_URI:
#     raise Exception("MONGO_URI environment variable is missing")

# client = AsyncIOMotorClient(
#     MONGO_URI,
#     connectTimeoutMS=5000
# )


# db = client.get_default_database()  # will be `paisaatracker_db` if specified in URI

# ---------------- Models ----------------

class UserModel(Document):
    email: EmailStr
    password_hash: str
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    display_name: Optional[str] = None
    currency: Optional[str] = "INR"
    email_digest: Optional[bool] = True  # monthly summary emails

    class Settings:
        name = "users"
        indexes = [
            "email",  # 📌 Index for faster login lookup
        ]


class TransactionModel(Document):
    user_id: Link[UserModel]
    amount: float
    category: str
    account: Optional[str] = None
    date: datetime
    description: Optional[str] = None

    class Settings:
        name = "transactions"
        indexes = [
            "user_id",           # 🔍 for user filtering
            "date",              # 📅 for sorting
            "category",          # 🗂 for filtering
            [("user_id", 1), ("date", -1)]  # 🧠 compound: get user transactions by date desc
        ]

class BudgetModel(Document):
    user_id: Link[UserModel]
    category: str
    month: int
    year: int
    amount: float

    class Settings:
        name = "budgets"
        indexes = [
            [("user_id", 1), ("month", 1), ("year", 1), ("category", 1)],  # unique per user/month/year/category
        ]


# ✅ Register Beanie models
document_models = [UserModel, TransactionModel, BudgetModel]
