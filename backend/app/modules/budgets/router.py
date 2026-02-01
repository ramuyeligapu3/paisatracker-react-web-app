from fastapi import APIRouter, Depends, Query
from typing import Optional

from backend.app.common.utils import *
from backend.app.modules.budgets.service import BudgetService
from backend.app.modules.budgets.repository import BudgetRepository
from backend.app.modules.budgets.schemas import BudgetSet
from backend.app.modules.transactions.repository import TransactionRepository

budget_router = APIRouter()


def get_budget_service():
    return BudgetService(BudgetRepository(), TransactionRepository())


@budget_router.get("/budgets")
async def list_budgets(
    current_user: str = Depends(get_current_user),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    service: BudgetService = Depends(get_budget_service),
):
    from datetime import datetime
    now = datetime.now()
    m = month or now.month
    y = year or now.year
    data = await service.get_budgets_with_spent(current_user, m, y)
    return ORJSONResponse(status_code=200, content=response(True, data, "Budgets fetched"))


@budget_router.put("/budgets")
async def set_budget(
    body: BudgetSet,
    current_user: str = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service),
):
    await service.set_budget(current_user, body.category, body.month, body.year, body.amount)
    return ORJSONResponse(status_code=200, content=response(True, None, "Budget updated"))
