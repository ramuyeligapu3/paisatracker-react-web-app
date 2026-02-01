from datetime import datetime
from typing import Optional
from backend.app.modules.transactions.repository import TransactionRepository
from backend.app.common.utils import response
from backend.app.core.exceptions import AppException

class TransactionService:
    def __init__(self, repo: TransactionRepository):
        self.repo = repo

    async def create_transaction(self, user_id: str, data: dict):
        return await self.repo.create_transaction(user_id, data)
    async def list_transactions(
        self,
        user_id: str,
        search: str,
        category: str,
        account: str,
        start_date: Optional[datetime],
        end_date: Optional[datetime],
        page: int,
        limit: int,
    ):
        skip = (page - 1) * limit
        total, transactions = await self.repo.get_transactions(
            user_id, search, category, account, start_date, end_date, skip, limit
        )
        return {
            "total": total,
            "transactions": [
                {
                    "id": str(t.id),
                    "date": t.date,
                    "description": t.description,
                    "category": t.category,
                    "account": t.account,
                    "amount": t.amount
                } for t in transactions
            ]
        }

    async def update_transaction(self, id: str, data: dict):
        tx = await self.repo.get_transaction_by_id(id)
        if not tx:
            raise AppException("Transaction not found", 404)
        return await self.repo.update_transaction(tx, data)
        
    async def delete_transaction(self, id: str):
        tx = await self.repo.get_transaction_by_id(id)
        if not tx:
            raise AppException("Transaction not found", 404)
        return await self.repo.delete_transaction(tx)
    
    async def get_monthly_summary(self,user_id:str, month: int = None, year: int = None):
        summery=await self.repo.get_monthly_summary_with_change(user_id, month, year)
        if summery:
                return summery[0]
        else:
            return {
                "totalIncome": 0,
                "totalExpenses": 0,
                "netBalance": 0,
                "incomeChange": None,
                "expensesChange": None,
                "balanceChange": None,
            }
    async def get_current_month_category_distribution(self,user_id:str, month: int = None, year: int = None):
        summery=await self.repo.get_current_month_category_distribution(user_id, month, year)
        return summery

    DEFAULT_CATEGORIES = [
        "Food & Dining", "Income", "Transportation", "Entertainment",
        "Bills & Utilities", "Shopping", "Healthcare", "Travel", "Education", "Other",
    ]
    DEFAULT_ACCOUNTS = ["Checking Account", "Savings Account", "Credit Card", "Cash", "Other"]

    async def get_categories(self, user_id: str) -> list:
        used = await self.repo.get_distinct_categories(user_id)
        combined = list(dict.fromkeys(self.DEFAULT_CATEGORIES + [c for c in used if c not in self.DEFAULT_CATEGORIES]))
        return combined

    async def get_accounts(self, user_id: str) -> list:
        used = await self.repo.get_distinct_accounts(user_id)
        combined = list(dict.fromkeys(self.DEFAULT_ACCOUNTS + [a for a in used if a and a not in self.DEFAULT_ACCOUNTS]))
        return combined

