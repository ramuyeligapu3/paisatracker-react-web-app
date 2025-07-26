import os
from fastapi import FastAPI,Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.responses import ORJSONResponse
from backend.app.common.utils import *

# from backend.app.models.models import init_beanie, db, document_models, client
from backend.app.core.database import init_db,client
from backend.app.modules.auth.router import auth_router
from backend.app.modules.transactions.router import transaction_router
from backend.app.core.exceptions import *
import traceback
# from backend.app.controller.auth_router import auth_router
# from backend.app.controller.transaction_router import transaction_router



# === Lifespan for startup/shutdown ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    # await init_beanie(database=db, document_models=document_models)
    await init_db()
    print("✅ Beanie initialized")
    yield
    client.close()
    print("🛑 MongoDB client closed")


# === FastAPI App ===
app = FastAPI(lifespan=lifespan)
# app = FastAPI()

# @app.on_event("startup")
# async def start_db():
#     await init_db()

# === Middleware ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
        # "http://localhost:5173",
        # "http://localhost:8000",
        # "https://paisaatracker.onrender.com",
        #  "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Routers ===
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(transaction_router, prefix="/api", tags=["transactions"], dependencies=[Depends(get_current_user)])


def response(success: bool,message: str = ""):
    return {"success": success,"message": message}


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return ORJSONResponse(
        status_code=exc.status_code,
        content=response(False, exc.message)
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # print("Full Traceback:\n", traceback.format_exc())
    return ORJSONResponse(status_code=500, content=response(False,"Internal Server Error"))

