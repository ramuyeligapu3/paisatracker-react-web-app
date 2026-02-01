from typing import List
from backend.app.modules.recurring.repository import RecurringRepository
from backend.app.core.exceptions import AppException


class RecurringService:
    def __init__(self, repo: RecurringRepository):
        self.repo = repo

    async def create(self, user_id: str, data: dict):
        return await self.repo.create(user_id, data)

    async def list_by_user(self, user_id: str) -> List[dict]:
        items = await self.repo.list_by_user(user_id)
        return [
            {
                "id": str(r.id),
                "description": r.description,
                "amount": r.amount,
                "category": r.category,
                "account": r.account,
                "frequency": r.frequency,
                "next_date": r.next_date.isoformat() if r.next_date else None,
                "is_active": r.is_active,
            }
            for r in items
        ]

    async def update(self, user_id: str, rec_id: str, data: dict):
        rec = await self.repo.get_by_id(rec_id, user_id)
        if not rec:
            raise AppException("Recurring transaction not found", 404)
        return await self.repo.update(rec, {k: v for k, v in data.items() if v is not None})

    async def delete(self, user_id: str, rec_id: str):
        rec = await self.repo.get_by_id(rec_id, user_id)
        if not rec:
            raise AppException("Recurring transaction not found", 404)
        await self.repo.delete(rec)
