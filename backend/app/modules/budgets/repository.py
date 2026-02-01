from typing import List, Optional
from backend.app.models.models import BudgetModel
from beanie import PydanticObjectId
from bson import ObjectId


class BudgetRepository:
    async def get_budget(self, user_id: str, category: str, month: int, year: int) -> Optional[BudgetModel]:
        uid = ObjectId(user_id)
        return await BudgetModel.find_one(
            BudgetModel.user_id.id == uid,
            BudgetModel.category == category,
            BudgetModel.month == month,
            BudgetModel.year == year,
        )

    async def set_budget(self, user_id: str, category: str, month: int, year: int, amount: float) -> BudgetModel:
        existing = await self.get_budget(user_id, category, month, year)
        uid = PydanticObjectId(user_id)
        if existing:
            existing.amount = amount
            await existing.save()
            return existing
        budget = BudgetModel(user_id=uid, category=category, month=month, year=year, amount=amount)
        await budget.insert()
        return budget

    async def get_budgets_for_month(self, user_id: str, month: int, year: int) -> List[BudgetModel]:
        uid = ObjectId(user_id)
        return await BudgetModel.find(
            BudgetModel.user_id.id == uid,
            BudgetModel.month == month,
            BudgetModel.year == year,
        ).to_list()
