import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles

app = FastAPI()

# Adjust this to point to your Vite build output folder
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

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
