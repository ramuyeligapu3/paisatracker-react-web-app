from fastapi import APIRouter, Depends
from backend.app.common.utils import *
from backend.app.modules.goals.service import GoalService
from backend.app.modules.goals.repository import GoalRepository
from backend.app.modules.goals.schemas import GoalCreate, GoalUpdate

goal_router = APIRouter()


def get_goal_service():
    return GoalService(GoalRepository())


@goal_router.get("/goals")
async def list_goals(
    current_user: str = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    data = await service.list_goals(current_user)
    return ORJSONResponse(status_code=200, content=response(True, data, "Goals fetched"))


@goal_router.post("/goals")
async def create_goal(
    body: GoalCreate,
    current_user: str = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    goal = await service.create_goal(
        current_user,
        {
            "name": body.name,
            "target_amount": body.target_amount,
            "current_amount": body.current_amount,
            "deadline": body.deadline,
        },
    )
    return ORJSONResponse(status_code=200, content=response(True, {"id": str(goal.id)}, "Goal created"))


@goal_router.patch("/goals/{goal_id}")
async def update_goal(
    goal_id: str,
    body: GoalUpdate,
    current_user: str = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    data = body.dict(exclude_unset=True)
    await service.update_goal(current_user, goal_id, data)
    return ORJSONResponse(status_code=200, content=response(True, None, "Goal updated"))


@goal_router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: str = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service),
):
    await service.delete_goal(current_user, goal_id)
    return ORJSONResponse(status_code=200, content=response(True, None, "Goal deleted"))
