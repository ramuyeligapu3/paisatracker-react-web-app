from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class TransactionBase(BaseModel):
    date: date
    description: str
    category: str
    account: str
    amount: float

class TransactionCreate(TransactionBase):
    user_id: str

class TransactionUpdate(BaseModel):
    date: date
    description: Optional[str] = None
    category: Optional[str] = None
    account: Optional[str] = None
    amount: Optional[float] = None

class TransactionResponse(TransactionBase):
    id: str

    class Config:
        orm_mode = True

class TransactionListResponse(BaseModel):
    total: int
    transactions: List[TransactionResponse]
