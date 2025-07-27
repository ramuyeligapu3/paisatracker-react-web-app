from typing import List, Optional, Tuple
from bson import ObjectId
from beanie import PydanticObjectId
from beanie.operators import Or, RegEx
from backend.app.models.models import TransactionModel
import asyncio
from datetime import datetime
from bson import ObjectId
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


    async def get_monthly_summary_with_change(self, user_id: str):
            uid = ObjectId(user_id)

            now = datetime.now()
            this_month_start = datetime(now.year, now.month, 1)
            if now.month == 1:
                last_month_start = datetime(now.year - 1, 12, 1)
            else:
                last_month_start = datetime(now.year, now.month - 1, 1)

            pipeline = [
                {"$match": {"user_id.$id": uid}},  # Match by user_id ObjectId
                {
                    "$facet": {
                        "thisMonth": [
                            {"$match": {"date": {"$gte": this_month_start}}},
                            {
                                "$group": {
                                    "_id": None,
                                    "totalIncome": {
                                        "$sum": {
                                            "$cond": [{"$gt": ["$amount", 0]}, "$amount", 0]
                                        }
                                    },
                                    "totalExpenses": {
                                        "$sum": {
                                            "$cond": [{"$lt": ["$amount", 0]}, "$amount", 0]
                                        }
                                    },
                                }
                            },
                        ],
                        "lastMonth": [
                            {
                                "$match": {
                                    "date": {"$gte": last_month_start, "$lt": this_month_start}
                                }
                            },
                            {
                                "$group": {
                                    "_id": None,
                                    "totalIncome": {
                                        "$sum": {
                                            "$cond": [{"$gt": ["$amount", 0]}, "$amount", 0]
                                        }
                                    },
                                    "totalExpenses": {
                                        "$sum": {
                                            "$cond": [{"$lt": ["$amount", 0]}, "$amount", 0]
                                        }
                                    },
                                }
                            },
                        ],
                    }
                },
                {
                    "$project": {
                        "thisMonth": {"$arrayElemAt": ["$thisMonth", 0]},
                        "lastMonth": {"$arrayElemAt": ["$lastMonth", 0]},
                    }
                },
                {
                    "$addFields": {
                        "thisMonth": {
                            "$ifNull": ["$thisMonth", {"totalIncome": 0, "totalExpenses": 0}]
                        },
                        "lastMonth": {
                            "$ifNull": ["$lastMonth", {"totalIncome": 0, "totalExpenses": 0}]
                        },
                    }
                },
                {
                    "$project": {
                        "totalIncome": "$thisMonth.totalIncome",
                        "totalExpenses": "$thisMonth.totalExpenses",
                        "netBalance": {"$add": ["$thisMonth.totalIncome", "$thisMonth.totalExpenses"]},
                        "incomeChange": {
                            "$cond": [
                                {"$eq": ["$lastMonth.totalIncome", 0]},
                                None,  # If last month income is zero, change is null (you can put 100 if you want)
                                {
                                    "$multiply": [
                                        {
                                            "$divide": [
                                                {"$subtract": ["$thisMonth.totalIncome", "$lastMonth.totalIncome"]},
                                                {"$abs": "$lastMonth.totalIncome"}
                                            ]
                                        },
                                        100
                                    ]
                                }
                            ]
                        },
                        "expensesChange": {
                            "$cond": [
                                {"$eq": ["$lastMonth.totalExpenses", 0]},
                                None,  # If last month expenses is zero, change is null
                                {
                                    "$multiply": [
                                        {
                                            "$divide": [
                                                {"$subtract": ["$thisMonth.totalExpenses", "$lastMonth.totalExpenses"]},
                                                {"$abs": "$lastMonth.totalExpenses"}
                                            ]
                                        },
                                        100
                                    ]
                                }
                            ]
                        },
                        "balanceChange": {
                            "$let": {
                                "vars": {
                                    "thisBalance": {
                                        "$add": ["$thisMonth.totalIncome", "$thisMonth.totalExpenses"]
                                    },
                                    "lastBalance": {
                                        "$add": ["$lastMonth.totalIncome", "$lastMonth.totalExpenses"]
                                    },
                                },
                                "in": {
                                    "$cond": [
                                        {"$eq": ["$$lastBalance", 0]},
                                        None,  # If last balance is zero, change is null
                                        {
                                            "$multiply": [
                                                {
                                                    "$divide": [
                                                        {"$subtract": ["$$thisBalance", "$$lastBalance"]},
                                                        {"$abs": "$$lastBalance"}
                                                    ]
                                                },
                                                100
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                    }
                },
            ]


            collection = TransactionModel.get_pymongo_collection()
            cursor = collection.aggregate(pipeline)
            results = await cursor.to_list(length=1)
            return results
    async def get_current_month_category_distribution(self, user_id: str):
        uid = ObjectId(user_id)
        now = datetime.now()
        this_month_start = datetime(now.year, now.month, 1)
        pipeline = [
            {"$match": {"user_id.$id": uid, "date": {"$gte": this_month_start}}},
            {
                "$group": {
                    "_id": "$category",       # Group by category
                    "totalAmount": {"$sum": "$amount"},  # Sum amounts per category
                }
            },
            {
                "$project": {
                    "category": "$_id",
                    "totalAmount": 1,
                    "_id": 0,
                }
            },
            {
                "$sort": {"totalAmount": -1}  # Sort descending by amount
            },
        ]

        collection = TransactionModel.get_pymongo_collection()
        cursor = collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)

        return results