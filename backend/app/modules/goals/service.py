from typing import List
from backend.app.modules.goals.repository import GoalRepository
from backend.app.core.exceptions import AppException


class GoalService:
    def __init__(self, repo: GoalRepository):
        self.repo = repo

    async def create_goal(self, user_id: str, data: dict):
        return await self.repo.create(user_id, data)

    async def list_goals(self, user_id: str) -> List[dict]:
        goals = await self.repo.list_by_user(user_id)
        return [
            {
                "id": str(g.id),
                "name": g.name,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "deadline": g.deadline.isoformat() if g.deadline else None,
                "progress_pct": round((g.current_amount / g.target_amount * 100), 1) if g.target_amount else 0,
            }
            for g in goals
        ]

    async def update_goal(self, user_id: str, goal_id: str, data: dict):
        goal = await self.repo.get_by_id(goal_id, user_id)
        if not goal:
            raise AppException("Goal not found", 404)
        return await self.repo.update(goal, {k: v for k, v in data.items() if v is not None})

    async def delete_goal(self, user_id: str, goal_id: str):
        goal = await self.repo.get_by_id(goal_id, user_id)
        if not goal:
            raise AppException("Goal not found", 404)
        await self.repo.delete(goal)
