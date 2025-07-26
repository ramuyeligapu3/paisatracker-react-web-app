from typing import List, Optional, Tuple
from bson import ObjectId
from beanie import PydanticObjectId
from beanie.operators import Or, RegEx
from backend.app.models.models import TransactionModel
import asyncio

class TransactionRepository:

    async def create_transaction(self, user_id: str, data: dict) -> TransactionModel:
        new_tx = TransactionModel(**data, user_id=PydanticObjectId(user_id))
        await new_tx.insert()
        return new_tx

    async def get_transactions(
        self,
        user_id: str,
        search: Optional[str],
        category: Optional[str],
        account: Optional[str],
        skip: int,
        limit: int
    ) -> Tuple[int, List[TransactionModel]]:
        filters = [TransactionModel.user_id.id == ObjectId(user_id)]

        if search:
            filters.append(
                Or(
                    RegEx(TransactionModel.description, search, options="i"),
                    RegEx(TransactionModel.category, search, options="i"),
                    RegEx(TransactionModel.account, search, options="i")
                )
            )
        if category:
            filters.append(TransactionModel.category == category)
        if account:
            filters.append(TransactionModel.account == account)

        total_task = TransactionModel.find(*filters).count()
        transactions_task = (
            TransactionModel.find(*filters)
            .sort("-date")
            .skip(skip)
            .limit(limit)
            .to_list()
        )

        return await asyncio.gather(total_task, transactions_task)

    async def get_transaction_by_id(self, id: str) -> Optional[TransactionModel]:
        return await TransactionModel.get(PydanticObjectId(id))

    async def update_transaction(self, transaction: TransactionModel, data: dict) -> None:
        await transaction.set(data)

    async def delete_transaction(self, transaction: TransactionModel) -> None:
        await transaction.delete()
