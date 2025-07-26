
from backend.app import app
from fastapi import FastAPI
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles
import os
# === API Test Route ===
@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

# === Frontend Path ===
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
# === Static Assets (JS, CSS, etc.) ===
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

# === Catch-All Route for React SPA ===
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join(frontend_path, "index.html")
    return FileResponse(index_path)