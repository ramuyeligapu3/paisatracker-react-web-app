from pydantic import BaseModel
from typing import Optional


class BudgetSet(BaseModel):
    category: str
    month: int
    year: int
    amount: float


class BudgetWithSpent(BaseModel):
    category: str
    budget_amount: float
    spent_amount: float
