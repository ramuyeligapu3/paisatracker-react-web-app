from fastapi import APIRouter, Depends, Query
from .schemas import TransactionCreate, TransactionUpdate, TransactionListResponse
from .service import TransactionService
from .repository import TransactionRepository
from backend.app.common.utils import *

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
async def transactions_monthly_summary(userId: str, service: TransactionService = Depends(get_transaction_service)):
    res = await service.get_monthly_summary(userId)
    return ORJSONResponse(
        status_code=200,
        content=response(True, res, message="Monthly summary fetched")
    )
@transaction_router.get("/transactions/category_distribution/{userId}")
async def current_month_category_distribution(userId: str, service: TransactionService = Depends(get_transaction_service)):
    res = await service.get_current_month_category_distribution(userId)
    return ORJSONResponse(
        status_code=200,
        content=response(True, res, message="Monthly summary fetched")
    )

    

    

