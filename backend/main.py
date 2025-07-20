import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles
from app.models.models import *

app = FastAPI()
from app.controller.auth_router import auth_router
from app.controller.transaction_router import transaction_router


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(transaction_router, prefix="/api", tags=["auth"])
# Adjust this to point to your Vite build output folder
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000","http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def init_db():
    await init_beanie(
        database=db,
        document_models=document_models  # ← clean and easy
    )
# Serve static assets (JS, CSS, images) that Vite puts directly in dist or dist/assets
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

# Catch-all route to serve React app for all other routes
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join(frontend_path, "index.html")
    return FileResponse(index_path)
