import calendar
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from backend.app.common.utils import *
from backend.app.core.config import settings
from backend.app.core.email import send_email_async, render_monthly_summary_html
from backend.app.modules.auth.repository import UserRepository
from .export import csv_generator
from .repository import TransactionRepository
from .schemas import TransactionCreate, TransactionUpdate, TransactionListResponse
from .service import TransactionService

transaction_router = APIRouter()

def get_transaction_service():
    return TransactionService(TransactionRepository())

@transaction_router.post("/transactions")
async def create_transaction(
    tx: TransactionCreate,
    service: TransactionService = Depends(get_transaction_service)
):
    user_id=tx.user_id
    new_tx=await service.create_transaction(user_id, tx.dict(exclude={"user_id"}))
    return ORJSONResponse(
            status_code=200,
            content=response(True, {"id": str(new_tx.id)}, "Transaction created")

        )

@transaction_router.get("/transactions", response_model=TransactionListResponse)
async def list_transactions(
    user_id: str = Query(...),
    search: str = "",
    category: str = "",
    account: str = "",
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = 1,
    limit: int = 10,
    service: TransactionService = Depends(get_transaction_service),
):
    start_dt = None
    end_dt = None
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
        except ValueError:
            pass
    return await service.list_transactions(
        user_id, search, category, account, start_dt, end_dt, page, limit
    )

@transaction_router.post("/transactions/{id}")
async def update_transaction(
    id: str,
    tx: TransactionUpdate,
    service: TransactionService = Depends(get_transaction_service)
):
    await service.update_transaction(id, tx.dict(exclude_unset=True))
    return ORJSONResponse(
            status_code=200,
            content=response(True, message="Transaction updated")
        )

@transaction_router.delete("/transactions/{id}")
async def delete_transaction(
    id: str,
    service: TransactionService = Depends(get_transaction_service)
):
    await service.delete_transaction(id)
    return ORJSONResponse(
            status_code=200,
            content=response(True, message="Transaction deleted")
        )
@transaction_router.get("/categories")
async def list_categories(
    current_user: str = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    categories = await service.get_categories(current_user)
    return ORJSONResponse(status_code=200, content=response(True, categories, "Categories fetched"))


@transaction_router.get("/accounts")
async def list_accounts(
    current_user: str = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    accounts = await service.get_accounts(current_user)
    return ORJSONResponse(status_code=200, content=response(True, accounts, "Accounts fetched"))


@transaction_router.get("/transactions/monthly_summary/{userId}")
async def transactions_monthly_summary(
    userId: str,
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    service: TransactionService = Depends(get_transaction_service),
):
    res = await service.get_monthly_summary(userId, month, year)
    return ORJSONResponse(
        status_code=200,
        content=response(True, res, message="Monthly summary fetched")
    )


@transaction_router.get("/transactions/category_distribution/{userId}")
async def current_month_category_distribution(
    userId: str,
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    service: TransactionService = Depends(get_transaction_service),
):
    res = await service.get_current_month_category_distribution(userId, month, year)
    return ORJSONResponse(
        status_code=200,
        content=response(True, res, message="Monthly summary fetched")
    )

@transaction_router.get("/export-transactions")
async def export_transactions(
    current_user: str = Depends(get_current_user),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    start_dt = None
    end_dt = None
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    return StreamingResponse(
        csv_generator(current_user, start_dt, end_dt),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )


@transaction_router.post("/send-monthly-summary")
async def send_monthly_summary_email(
    current_user: str = Depends(get_current_user),
    month: int = Query(None),
    year: int = Query(None),
    transaction_service: TransactionService = Depends(get_transaction_service),
):
    user_repo = UserRepository()
    user = await user_repo.get_by_id(current_user)
    if not user:
        return ORJSONResponse(status_code=404, content=response(False, message="User not found"))
    now = datetime.now()
    m = month or now.month
    y = year or now.year
    summary = await transaction_service.get_monthly_summary(current_user, m, y)
    category_dist = await transaction_service.get_current_month_category_distribution(current_user, m, y)
    month_name = f"{calendar.month_name[m]} {y}"
    html = render_monthly_summary_html(
        user_email=user.email,
        month_name=month_name,
        total_income=summary.get("totalIncome", 0) or 0,
        total_expenses=summary.get("totalExpenses", 0) or 0,
        net_balance=summary.get("netBalance", 0) or 0,
        income_change=summary.get("incomeChange"),
        expenses_change=summary.get("expensesChange"),
        balance_change=summary.get("balanceChange"),
        category_rows=category_dist or [],
        app_name=settings.APP_NAME,
    )
    sent = await send_email_async(
        user.email,
        f"Your {month_name} summary – {settings.APP_NAME}",
        html,
    )
    if not sent:
        return ORJSONResponse(
            status_code=503,
            content=response(False, message="Email is not configured or could not be sent. Please set MAIL_* in .env.")
        )
    return ORJSONResponse(
        status_code=200,
        content=response(True, message="Monthly summary sent to your email.")
    )


