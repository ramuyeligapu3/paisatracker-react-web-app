from typing import List, Optional
from bson import ObjectId
from beanie import PydanticObjectId
from backend.app.models.models import SavingsGoalModel


class GoalRepository:
    async def create(self, user_id: str, data: dict) -> SavingsGoalModel:
        goal = SavingsGoalModel(user_id=PydanticObjectId(user_id), **data)
        await goal.insert()
        return goal

    async def list_by_user(self, user_id: str) -> List[SavingsGoalModel]:
        uid = ObjectId(user_id)
        return await SavingsGoalModel.find(SavingsGoalModel.user_id.id == uid).sort("deadline").to_list()

    async def get_by_id(self, goal_id: str, user_id: str) -> Optional[SavingsGoalModel]:
        goal = await SavingsGoalModel.find_one({
            "_id": PydanticObjectId(goal_id),
            "user_id.$id": ObjectId(user_id)
        })
        if not goal:
            return None
        return goal

    async def update(self, goal: SavingsGoalModel, data: dict) -> SavingsGoalModel:
        await goal.set(data)
        return goal

    async def delete(self, goal: SavingsGoalModel) -> None:
        await goal.delete()
