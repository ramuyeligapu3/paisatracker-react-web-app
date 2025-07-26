from backend.app.modules.transactions.repository import TransactionRepository
from backend.app.common.utils import response
from backend.app.core.exceptions import AppException

class TransactionService:
    def __init__(self, repo: TransactionRepository):
        self.repo = repo

    async def create_transaction(self, user_id: str, data: dict):
        return await self.repo.create_transaction(user_id, data)
    async def list_transactions(self, user_id: str, search: str, category: str, account: str, page: int, limit: int):
        skip = (page - 1) * limit
        total, transactions = await self.repo.get_transactions(user_id, search, category, account, skip, limit)
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
       
