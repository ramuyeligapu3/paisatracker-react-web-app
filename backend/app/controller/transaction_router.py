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


@transaction_router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    user_id: str = Query(...),
    search: str = "",
    category: str = "",
    account: str = "",
    page: int = 1,
    limit: int = 5
):
    skip = (page - 1) * limit

    filters = {"user_id": ObjectId(user_id)}  # ✅ Fix: correct Beanie user_id field

    # Optional regex search
    if search:
        filters["$or"] = [
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
            {"account": {"$regex": search, "$options": "i"}}
        ]
    if category:
        filters["category"] = category
    if account:
        filters["account"] = account

    transactions_cursor = (
        TransactionModel.find(filters)
        .sort("-date")
        .skip(skip)
        .limit(limit)
    )
    print("((((((((((((((((((((((transactions_cursor))))))))))))))))))))))",transactions_cursor)
    transactions = await transactions_cursor.to_list()
    print(transactions,"((((((((((((((((((((((((((((transactions))))))))))))))))))))))))))))")

    transactions = await TransactionModel.find_all().to_list()
    print("All Transactions:", transactions)

    return [
        TransactionResponse(
            id=str(t.id),
            user_id=str(t.user_id),
            date=t.date,
            description=t.description,
            category=t.category,
            account=t.account,
            amount=t.amount
        )
        for t in transactions
    ]



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
