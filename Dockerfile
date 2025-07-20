# React build stage
FROM node:18 AS react-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.11-slim

WORKDIR /app
COPY backend/ ./backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy React build output (dist) to the location backend expects
COPY --from=react-build /app/frontend/dist ./frontend/dist

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

