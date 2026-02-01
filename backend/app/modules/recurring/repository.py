from typing import List, Optional
from bson import ObjectId
from beanie import PydanticObjectId
from backend.app.models.models import RecurringTransactionModel


class RecurringRepository:
    async def create(self, user_id: str, data: dict) -> RecurringTransactionModel:
        rec = RecurringTransactionModel(user_id=PydanticObjectId(user_id), **data)
        await rec.insert()
        return rec

    async def list_by_user(self, user_id: str) -> List[RecurringTransactionModel]:
        uid = ObjectId(user_id)
        return await RecurringTransactionModel.find(RecurringTransactionModel.user_id.id == uid).sort("next_date").to_list()

    async def get_by_id(self, rec_id: str, user_id: str):
        rec_obj_id = PydanticObjectId(rec_id)
        rec = await RecurringTransactionModel.find_one({
            "_id": rec_obj_id,
            "user_id.$id": ObjectId(user_id)
        })
        if not rec:
            return None
        return rec
    

    async def update(self, rec: RecurringTransactionModel, data: dict) -> RecurringTransactionModel:
        await rec.set(data)
        return rec

    async def delete(self, rec: RecurringTransactionModel) -> None:
        await rec.delete()
