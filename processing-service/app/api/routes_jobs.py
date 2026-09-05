"""
processing-service/app/api/routes_jobs.py
Internal job management routes — NOT publicly exposed.
Blueprint §5 — Internal-only service; POST /internal/jobs, GET /internal/jobs/{id}.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Literal

from app.api.deps import verify_internal_key
from app.workers.tasks import run_registration_pipeline, get_job_status_from_store

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/internal", tags=["internal"])


# ── Request/Response schemas ──────────────────────────────────────────────────

class JobRequest(BaseModel):
    jobId: str
    sourceImageUri: str
    referenceImageUri: str
    algorithm: Literal["classical", "learned"] = "classical"
    transformModel: Literal["affine", "homography"] = "homography"
    coverageTargetCells: int = 64
    parameters: dict = {}


class MetadataRequest(BaseModel):
    imageId: str
    storageUri: str


class JobStatusResponse(BaseModel):
    jobId: str
    status: str
    progress: int
    metrics: Optional[dict] = None
    artifactUris: Optional[dict] = None
    error: Optional[dict] = None


# ── POST /internal/jobs ───────────────────────────────────────────────────────

@router.post("/jobs", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(verify_internal_key)])
async def enqueue_registration_job(request: JobRequest) -> dict:
    """
    Receive a registration job from the web-backend and dispatch it to
    the Celery worker pool.
    """
    try:
        task = run_registration_pipeline.apply_async(
            kwargs={
                "job_id": request.jobId,
                "source_image_uri": request.sourceImageUri,
                "reference_image_uri": request.referenceImageUri,
                "algorithm": request.algorithm,
                "transform_model": request.transformModel,
                "coverage_target_cells": request.coverageTargetCells,
                "parameters": request.parameters,
            },
            task_id=request.jobId,  # Use jobId as Celery task ID for easy lookup
        )
        logger.info("Job enqueued", extra={"job_id": request.jobId, "task_id": task.id})
        return {"jobId": request.jobId, "taskId": task.id}
    except Exception as exc:
        logger.error("Failed to enqueue job", extra={"job_id": request.jobId, "error": str(exc)})
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── GET /internal/jobs/{job_id} ───────────────────────────────────────────────

@router.get("/jobs/{job_id}", response_model=JobStatusResponse, dependencies=[Depends(verify_internal_key)])
async def get_job_status(job_id: str) -> JobStatusResponse:
    """
    Return the current status of a job. The web-backend polls this endpoint
    as a fallback when Socket.io is not available.
    """
    status_data = get_job_status_from_store(job_id)
    if not status_data:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": f"Job {job_id} not found"},
        )
    return JobStatusResponse(**status_data)


# ── POST /internal/metadata ───────────────────────────────────────────────────

@router.post("/metadata", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(verify_internal_key)])
async def extract_metadata(request: MetadataRequest) -> dict:
    """
    Trigger lightweight metadata extraction for a newly uploaded image.
    Extracts sun angle, resolution, footprint from PDS4 label or GeoTIFF headers.
    """
    from app.workers.tasks import extract_image_metadata
    task = extract_image_metadata.apply_async(
        kwargs={"image_id": request.imageId, "storage_uri": request.storageUri}
    )
    return {"imageId": request.imageId, "taskId": task.id}
