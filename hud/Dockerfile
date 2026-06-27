# ==========================================
# Stage 1: Build Frontend (Angular)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Set CI=true so pnpm doesn't prompt for interactive confirmation
ENV CI=true

# Install pnpm
RUN corepack enable pnpm

# Copy package.json and install dependencies
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./frontend/
WORKDIR /app/frontend
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY frontend/ /app/frontend/
RUN pnpm run build

# ==========================================
# Stage 2: Production Backend (FastAPI)
# ==========================================
FROM python:3.12-slim-bookworm

# Set environment variables for performance and security
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ /app/

# Copy built frontend from Stage 1 into the backend's static directory
COPY --from=builder /app/frontend/dist/frontend/browser /app/static

# Switch to a non-root user for security
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Run Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
