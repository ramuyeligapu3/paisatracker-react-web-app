from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from .schemas import TransactionCreate, TransactionUpdate, TransactionListResponse
from .service import TransactionService
from .repository import TransactionRepository
from .export import csv_generator
from backend.app.common.utils import *
from datetime import datetime

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
    page: int = 1,
    limit: int = 10,
    service: TransactionService = Depends(get_transaction_service)
):
   
    return await service.list_transactions(user_id, search, category, account, page, limit)

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
@transaction_router.get("/transactions/monthly_summary/{userId}")
async def transactions_monthly_summary(userId: str, month: int = None, year: int = None, service: TransactionService = Depends(get_transaction_service)):
    res = await service.get_monthly_summary(userId, month, year)
    return ORJSONResponse(
        status_code=200,
        content=response(True, res, message="Monthly summary fetched")
    )
@transaction_router.get("/transactions/category_distribution/{userId}")
async def current_month_category_distribution(userId: str, month: int = None, year: int = None, service: TransactionService = Depends(get_transaction_service)):
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

    

