"""
processing-service/app/main.py
FastAPI application — internal-only service.
Blueprint §5 — processing service exposes only /internal/* routes;
no public access; authenticated via X-Internal-Key header.
"""
from __future__ import annotations

import logging
import sys

import sentry_sdk
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes_jobs import router as jobs_router

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.env == "development" else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

# ── Sentry (optional) ─────────────────────────────────────────────────────────
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.env,
        traces_sample_rate=0.1,
    )
    logger.info("Sentry initialised")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="OrbitLens Processing Service",
    version="1.0.0",
    description="Internal-only CV/ML registration pipeline service.",
    # Disable the auto-generated public docs in production
    docs_url="/docs" if settings.env != "production" else None,
    redoc_url="/redoc" if settings.env != "production" else None,
    openapi_url="/openapi.json" if settings.env != "production" else None,
)

# CORS: only accept from web-backend in internal network — no public origins
# In a real deployment this would be locked to the internal Docker network.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],   # No browser-facing CORS needed for an internal service
    allow_methods=["GET", "POST"],
    allow_headers=["X-Internal-Key", "Content-Type"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(jobs_router)


# ── Health endpoints ──────────────────────────────────────────────────────────

@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """Liveness — always 200 when the process is alive."""
    return {"status": "ok", "service": "processing-service"}


@app.get("/ready", tags=["health"])
async def readiness_check() -> dict:
    """Readiness — checks Redis and S3 reachability."""
    checks: dict[str, str] = {}

    # Redis ping
    try:
        import redis
        r = redis.from_url(settings.redis_url, socket_timeout=2)
        r.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "unreachable"

    # S3/MinIO HeadBucket
    try:
        import boto3
        client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
            region_name=settings.s3_region,
        )
        client.head_bucket(Bucket=settings.s3_bucket)
        checks["storage"] = "ok"
    except Exception:
        checks["storage"] = "unreachable"

    all_ok = all(v == "ok" for v in checks.values())
    return {
        "status": "ok" if all_ok else "degraded",
        "checks": checks,
    }


# ── Dev entrypoint ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.env == "development",
        log_level="debug" if settings.env == "development" else "info",
    )
