# processing-service/Dockerfile
# Multi-stage build: builder installs Python deps, runner is lean.

FROM python:3.12-slim AS builder

# Install GDAL/GEOS system libs required by rasterio
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runner stage ───────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runner

# Re-install only runtime system libs (not build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgdal32 \
    libgeos-c1v5 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

# Non-root user for security
RUN groupadd -r orbitlens && useradd -r -g orbitlens orbitlens
USER orbitlens

EXPOSE 8000

# Default: start FastAPI (override CMD to start Celery worker instead)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

# To start Celery worker instead:
# CMD ["celery", "-A", "app.workers.tasks.celery_app", "worker", \
#      "--queues", "registration,metadata", "--concurrency", "2", "--loglevel", "info"]
