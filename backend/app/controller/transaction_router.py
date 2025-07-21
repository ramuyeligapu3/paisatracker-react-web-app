from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from beanie import PydanticObjectId
from backend.app.models.models import TransactionModel
from bson import ObjectId
transaction_router = APIRouter()

# ----------- Schemas -----------

class TransactionBase(BaseModel):
    date: date
    description: str
    category: str
    account: str
    amount: float

class TransactionCreate(TransactionBase):
    user_id: str  # Will be passed from frontend

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    category: Optional[str] = None
    account: Optional[str] = None
    amount: Optional[float] = None

class TransactionResponse(TransactionBase):
    id: str

    class Config:
        orm_mode = True
class TransactionListResponse(BaseModel):
    total: int
    transactions: List[TransactionResponse]

# ----------- Utility Response Wrapper -----------

def response(success: bool, data=None, message: str = ""):
    return {"success": success, "data": data, "message": message}

# ----------- Routes -----------

@transaction_router.post("/transactions")
async def create_transaction(tx: TransactionCreate):
    new_tx = TransactionModel(
        **tx.dict(exclude={"user_id"}),
        user_id=PydanticObjectId(tx.user_id)
    )
    await new_tx.insert()
    return {
        "success": True,
        "message": "Transaction created",
        "data": {"id": str(new_tx.id)}
    }

from beanie.operators import Or, RegEx
from bson import ObjectId

@transaction_router.get("/transactions", response_model=TransactionListResponse)
async def get_transactions(
    user_id: str = Query(...),
    search: str = "",
    category: str = "",
    account: str = "",
    page: int = 1,
    limit: int = 5
):
    skip = (page - 1) * limit

    print("((((((((((((((((user_id))))))))))))))))",user_id)

    # ✅ Correct filter for Linked field
    base_filter = TransactionModel.user_id.id == ObjectId(user_id)
    query_filters = [base_filter]

    if search:
        query_filters.append(
            Or(
                RegEx(TransactionModel.description, search, options="i"),
                RegEx(TransactionModel.category, search, options="i"),
                RegEx(TransactionModel.account, search, options="i")
            )
        )

    if category:
        query_filters.append(TransactionModel.category == category)
    if account:
        query_filters.append(TransactionModel.account == account)

    total = await TransactionModel.find(*query_filters).count()

    transactions_cursor = (
        TransactionModel.find(*query_filters)
        .sort("-date")
        .skip(skip)
        .limit(limit)
    )

    transactions = await transactions_cursor.to_list()

    return {
    "total": total,
    "transactions": [
        TransactionResponse(
            id=str(t.id),
            user_id=str(t.user_id.ref.id),
            date=t.date,
            description=t.description,
            category=t.category,
            account=t.account,
            amount=t.amount
        )
        for t in transactions
    ]
}



@transaction_router.put("/transactions/{id}")
async def update_transaction(id: str, tx: TransactionUpdate):
    transaction = await TransactionModel.get(PydanticObjectId(id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await transaction.set(tx.dict(exclude_unset=True))
    return response(True, message="Transaction updated")


@transaction_router.delete("/transactions/{id}")
async def delete_transaction(id: str):
    transaction = await TransactionModel.get(PydanticObjectId(id))
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await transaction.delete()
    return response(True, message="Transaction deleted")
