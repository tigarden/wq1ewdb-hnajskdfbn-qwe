# Dockerfile for deploying Debet.auto FastAPI Backend to Cloud (Render, Railway, Fly.io, etc.)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg / build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend ./backend
COPY alembic ./alembic
COPY alembic.ini .
COPY scripts ./scripts

# Expose port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
