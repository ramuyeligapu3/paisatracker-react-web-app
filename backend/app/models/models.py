import os
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from beanie import Document, init_beanie, Link
from pymongo import IndexModel, ASCENDING, DESCENDING

# ---------------- Models ----------------

class UserModel(Document):
    email: EmailStr
    password_hash: str
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    display_name: Optional[str] = None
    currency: Optional[str] = "INR"
    email_digest: Optional[bool] = True

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True)
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
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("date", DESCENDING)]),
            IndexModel([("category", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("date", DESCENDING)])
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
            IndexModel([
                ("user_id", ASCENDING),
                ("month", ASCENDING),
                ("year", ASCENDING),
                ("category", ASCENDING)
            ], unique=True)
        ]


class SavingsGoalModel(Document):
    user_id: Link[UserModel]
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[datetime] = None

    class Settings:
        name = "savings_goals"
        indexes = [
            IndexModel([("user_id", ASCENDING)])
        ]


class RecurringTransactionModel(Document):
    user_id: Link[UserModel]
    description: str
    amount: float
    category: str
    account: Optional[str] = None
    frequency: str
    next_date: datetime
    is_active: bool = True

    class Settings:
        name = "recurring_transactions"
        indexes = [
            IndexModel([("user_id", ASCENDING)])
        ]


# ✅ Register Beanie models
document_models = [
    UserModel,
    TransactionModel,
    BudgetModel,
    SavingsGoalModel,
    RecurringTransactionModel,
]
