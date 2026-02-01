from typing import List
from backend.app.modules.budgets.repository import BudgetRepository
from backend.app.modules.transactions.repository import TransactionRepository


class BudgetService:
    def __init__(self, budget_repo: BudgetRepository, tx_repo: TransactionRepository):
        self.budget_repo = budget_repo
        self.tx_repo = tx_repo

    async def get_budgets_with_spent(self, user_id: str, month: int, year: int) -> List[dict]:
        budgets = await self.budget_repo.get_budgets_for_month(user_id, month, year)
        category_dist = await self.tx_repo.get_current_month_category_distribution(user_id, month, year)
        spent_by_cat = {c["category"]: abs(c["totalAmount"]) for c in (category_dist or [])}
        result = []
        for b in budgets:
            spent = spent_by_cat.get(b.category, 0)
            result.append({
                "category": b.category,
                "budget_amount": b.amount,
                "spent_amount": spent,
            })
        return result

    async def set_budget(self, user_id: str, category: str, month: int, year: int, amount: float):
        return await self.budget_repo.set_budget(user_id, category, month, year, amount)
