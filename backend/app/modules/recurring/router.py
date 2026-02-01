from fastapi import APIRouter, Depends
from backend.app.common.utils import *
from backend.app.modules.recurring.service import RecurringService
from backend.app.modules.recurring.repository import RecurringRepository
from backend.app.modules.recurring.schemas import RecurringCreate, RecurringUpdate

recurring_router = APIRouter()


def get_recurring_service():
    return RecurringService(RecurringRepository())


@recurring_router.get("/recurring")
async def list_recurring(
    current_user: str = Depends(get_current_user),
    service: RecurringService = Depends(get_recurring_service),
):
    data = await service.list_by_user(current_user)
    return ORJSONResponse(status_code=200, content=response(True, data, "Recurring transactions fetched"))


@recurring_router.post("/recurring")
async def create_recurring(
    body: RecurringCreate,
    current_user: str = Depends(get_current_user),
    service: RecurringService = Depends(get_recurring_service),
):
    rec = await service.create(
        current_user,
        {
            "description": body.description,
            "amount": body.amount,
            "category": body.category,
            "account": body.account,
            "frequency": body.frequency,
            "next_date": body.next_date,
        },
    )
    return ORJSONResponse(status_code=200, content=response(True, {"id": str(rec.id)}, "Recurring created"))


@recurring_router.patch("/recurring/{rec_id}")
async def update_recurring(
    rec_id: str,
    body: RecurringUpdate,
    current_user: str = Depends(get_current_user),
    service: RecurringService = Depends(get_recurring_service),
):
    data = body.dict(exclude_unset=True)
    await service.update(current_user, rec_id, data)
    return ORJSONResponse(status_code=200, content=response(True, None, "Recurring updated"))


@recurring_router.delete("/recurring/{rec_id}")
async def delete_recurring(
    rec_id: str,
    current_user: str = Depends(get_current_user),
    service: RecurringService = Depends(get_recurring_service),
):
    await service.delete(current_user, rec_id)
    return ORJSONResponse(status_code=200, content=response(True, None, "Recurring deleted"))
