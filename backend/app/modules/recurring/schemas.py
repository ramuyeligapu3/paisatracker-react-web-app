from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RecurringCreate(BaseModel):
    description: str
    amount: float
    category: str
    account: Optional[str] = None
    frequency: str  # "weekly" | "monthly"
    next_date: datetime


class RecurringUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    account: Optional[str] = None
    frequency: Optional[str] = None
    next_date: Optional[datetime] = None
    is_active: Optional[bool] = None
