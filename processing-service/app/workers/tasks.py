"""
processing-service/app/workers/tasks.py
Celery tasks — the full registration pipeline + metadata extraction.
Blueprint §5 — Orchestration pattern; callbacks to web-backend on each stage transition.
"""
from __future__ import annotations

import json
import logging
import os
import shutil
import time
from pathlib import Path
from typing import Any, Optional

import httpx
from celery import Celery
from celery.signals import task_failure, task_success

from app.config import settings

logger = logging.getLogger(__name__)

# ── Celery app ─────────────────────────────────────────────────────────────────
celery_app = Celery(
    "orbitlens",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,           # Ack only after task completes — prevents data loss on crash
    worker_prefetch_multiplier=1,  # One task at a time per worker (large raster workloads)
    task_routes={
        "app.workers.tasks.run_registration_pipeline": {"queue": "registration"},
        "app.workers.tasks.extract_image_metadata": {"queue": "metadata"},
    },
)


# ── Job status store (Redis-backed via Celery result backend) ─────────────────

def get_job_status_from_store(job_id: str) -> Optional[dict]:
    """
    Retrieve job status from the Celery result backend.
    Returns None if the job is not found.
    """
    result = celery_app.AsyncResult(job_id)
    if result.state == "PENDING":
        return None
    return result.info if isinstance(result.info, dict) else None


# ── Callback to web-backend ───────────────────────────────────────────────────

def _post_callback(payload: dict) -> None:
    """
    POST a job update to the web-backend callback endpoint.
    Uses a short timeout — if it fails, the job continues and the web-backend
    can poll GET /internal/jobs/{id} as a fallback.
    Blueprint §4 — Callback URL driven by WEB_BACKEND_CALLBACK_URL env var.
    """
    try:
        resp = httpx.post(
            settings.web_backend_callback_url,
            json=payload,
            headers={"X-Internal-Key": settings.web_backend_callback_key},
            timeout=5.0,
        )
        resp.raise_for_status()
    except Exception as exc:
        logger.warning("Callback to web-backend failed (non-fatal): %s", exc)


def _update_status(
    job_id: str,
    status: str,
    progress: int,
    metrics: Optional[dict] = None,
    artifact_uris: Optional[dict] = None,
    algorithm_version: Optional[str] = None,
    error: Optional[dict] = None,
) -> None:
    payload: dict = {"jobId": job_id, "status": status, "progress": progress}
    if metrics:
        payload["metrics"] = metrics
    if artifact_uris:
        payload["artifactUris"] = artifact_uris
    if algorithm_version:
        payload["algorithmVersion"] = algorithm_version
    if error:
        payload["error"] = error
    _post_callback(payload)


# ── Registration pipeline task ────────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.workers.tasks.run_registration_pipeline",
    max_retries=3,
    default_retry_delay=60,
    soft_time_limit=3600,   # 1h soft limit (sends SIGTERM)
    time_limit=3900,        # Hard kill after 65min
)
def run_registration_pipeline(
    self: Any,
    job_id: str,
    source_image_uri: str,
    reference_image_uri: str,
    algorithm: str = "classical",
    transform_model: str = "homography",
    coverage_target_cells: int = 64,
    parameters: Optional[dict] = None,
) -> dict:
    """
    Full multi-stage registration pipeline.
    Blueprint §5 stages: Ingest → Preprocess → Pyramid → Detect → Match →
    Geometry → Coverage → Warp → Metrics → Upload artifacts → Callback.
    """
    from app.pipeline.ingest import ingest_image
    from app.pipeline.preprocess import preprocess
    from app.pipeline.pyramid import build_pyramid, compute_pyramid_levels
    from app.pipeline.detectors.classical import detect_and_describe
    from app.pipeline.matching import match_classical, merge_pyramid_matches, MatchResult
    from app.pipeline.geometry import estimate_transform
    from app.pipeline.coverage import enforce_coverage
    from app.pipeline.warp import warp_image
    from app.pipeline.metrics import compute_metrics, metrics_to_json, match_points_to_geojson
    from app.storage.s3_client import download_to_file, upload_file, make_temp_dir

    params = parameters or {}
    ratio_threshold = float(params.get("ratioThreshold", 0.75))
    ransac_reproj_threshold = float(params.get("ransacReprojThreshold", 3.0))
    max_keypoints = int(params.get("maxKeypoints", 8000))
    stage_timings: dict[str, float] = {}
    tmp_dir = make_temp_dir()

    def _stage_time(stage: str, fn, *args, **kwargs):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        stage_timings[stage] = round((time.perf_counter() - t0) * 1000, 1)
        return result

    try:
        t_start = time.perf_counter()

        # ── Stage 1: Download ──────────────────────────────────────────────
        _update_status(job_id, "preprocessing", 5)

        src_local = os.path.join(tmp_dir, "source.tif")
        ref_local = os.path.join(tmp_dir, "reference.tif")

        _stage_time("download_source", download_to_file, source_image_uri, src_local)
        _stage_time("download_reference", download_to_file, reference_image_uri, ref_local)

        # ── Stage 2: Ingest ────────────────────────────────────────────────
        src_desc = _stage_time("ingest_source", ingest_image, src_local)
        ref_desc = _stage_time("ingest_reference", ingest_image, ref_local)

        _update_status(job_id, "preprocessing", 15)

        # ── Stage 3: Pyramid ───────────────────────────────────────────────
        n_levels = compute_pyramid_levels(src_desc.resolution_mpp, ref_desc.resolution_mpp)
        src_overview = src_desc.read_overview(target_size=2048)
        ref_overview = ref_desc.read_overview(target_size=2048)

        src_preproc = _stage_time("preprocess_source", preprocess, src_overview)
        ref_preproc = _stage_time("preprocess_reference", preprocess, ref_overview)

        src_pyramid = _stage_time("pyramid_source", build_pyramid, src_preproc, n_levels)
        ref_pyramid = _stage_time("pyramid_reference", build_pyramid, ref_preproc, n_levels)

        _update_status(job_id, "matching", 30)

        # ── Stage 4–5: Detect + Match at each pyramid level ───────────────
        level_matches = []
        for i, (src_lvl, ref_lvl) in enumerate(zip(src_pyramid, ref_pyramid)):
            src_kp = detect_and_describe(src_lvl.image, "SIFT", max_keypoints)
            ref_kp = detect_and_describe(ref_lvl.image, "SIFT", max_keypoints)
            match_result = match_classical(src_kp, ref_kp, ratio_threshold)
            level_matches.append((match_result, src_lvl.scale))
            progress = 30 + int((i + 1) / n_levels * 20)
            _update_status(job_id, "matching", progress)

        # Learned matcher (if requested and available)
        if algorithm == "learned":
            try:
                from app.pipeline.detectors.learned import match_learned
                learned_result = match_learned(src_preproc, ref_preproc, settings.use_gpu, max_keypoints)
                # Convert to MatchResult and append as if it were a pyramid level
                from app.pipeline.matching import MatchResult as MR
                mr = MR(src_pts=learned_result.src_pts, ref_pts=learned_result.ref_pts, scores=learned_result.scores)
                level_matches.append((mr, 1.0))
                logger.info("Learned matcher results merged with pyramid matches")
            except (ImportError, RuntimeError) as e:
                logger.warning("Learned matcher unavailable, using classical only: %s", e)

        merged_matches = _stage_time("merge_matches", merge_pyramid_matches, level_matches)

        _update_status(job_id, "estimating_transform", 55)

        # ── Stage 6: Geometry estimation ───────────────────────────────────
        if len(merged_matches.src_pts) < 4:
            raise ValueError(f"Insufficient matches for geometry estimation: {len(merged_matches.src_pts)}")

        geometry = _stage_time(
            "geometry",
            estimate_transform,
            merged_matches,
            transform_model,
            ransac_reproj_threshold,
        )

        _update_status(job_id, "warping", 65)

        # ── Stage 7: Coverage enforcement ─────────────────────────────────
        covered_src, covered_ref, _, coverage_score = _stage_time(
            "coverage",
            enforce_coverage,
            geometry,
            ref_desc.width,
            ref_desc.height,
            coverage_target_cells,
        )

        # ── Stage 8: Warp ──────────────────────────────────────────────────
        warped_path = os.path.join(tmp_dir, "registered.tif")
        _stage_time("warp", warp_image, src_desc, ref_desc, geometry, warped_path)

        _update_status(job_id, "scoring", 80)

        # ── Stage 9: Metrics ───────────────────────────────────────────────
        metrics_obj = _stage_time(
            "metrics",
            compute_metrics,
            geometry,
            coverage_score,
            covered_src,
            covered_ref,
        )

        total_ms = round((time.perf_counter() - t_start) * 1000, 1)
        stage_timings["total"] = total_ms

        metrics_dict = {
            "rmse": metrics_obj.rmse,
            "inlierCount": metrics_obj.inlier_count,
            "inlierRatio": metrics_obj.inlier_ratio,
            "coverageScore": metrics_obj.coverage_score,
            "processingTimeMs": total_ms,
            "perStageTimingsMs": stage_timings,
        }

        # ── Stage 10: Upload artifacts ─────────────────────────────────────
        artifact_base = f"jobs/{job_id}"

        registered_uri = upload_file(warped_path, f"{artifact_base}/registered.tif")

        match_geojson = match_points_to_geojson(
            covered_src, covered_ref, metrics_obj.per_point_errors
        )
        match_geojson_path = os.path.join(tmp_dir, "match_points.geojson")
        Path(match_geojson_path).write_text(match_geojson)
        match_pts_uri = upload_file(match_geojson_path, f"{artifact_base}/match_points.geojson")

        metrics_report_path = os.path.join(tmp_dir, "metrics.json")
        Path(metrics_report_path).write_text(metrics_to_json(metrics_obj))
        metrics_report_uri = upload_file(metrics_report_path, f"{artifact_base}/metrics.json")

        # Determine final status (low confidence → still complete, but flagged)
        final_status = "complete"
        algorithm_version = f"SIFT-opencv-{cv_version()}"
        if algorithm == "learned":
            algorithm_version += "+LightGlue-kornia"

        _update_status(
            job_id,
            final_status,
            100,
            metrics=metrics_dict,
            artifact_uris={
                "registeredImageUri": registered_uri,
                "matchPointsUri": match_pts_uri,
                "metricsReportUri": metrics_report_uri,
            },
            algorithm_version=algorithm_version,
        )

        return {"jobId": job_id, "status": "complete"}

    except Exception as exc:
        error_code = "REGISTRATION_FAILED"
        if "Insufficient matches" in str(exc):
            error_code = "REGISTRATION_LOW_CONFIDENCE"
        error_payload = {"code": error_code, "message": str(exc)}
        logger.error("Pipeline failed for job %s: %s", job_id, exc, exc_info=True)
        _update_status(job_id, "failed", 0, error=error_payload)
        raise  # Let Celery handle retries

    finally:
        # Always clean up temp files
        shutil.rmtree(tmp_dir, ignore_errors=True)


def cv_version() -> str:
    try:
        import cv2
        return cv2.__version__
    except ImportError:
        return "unknown"


# ── Metadata extraction task ───────────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.workers.tasks.extract_image_metadata",
    max_retries=2,
    soft_time_limit=120,
    time_limit=180,
)
def extract_image_metadata(self: Any, image_id: str, storage_uri: str) -> dict:
    """
    Lightweight metadata extraction — downloads image, reads PDS4/GeoTIFF tags,
    posts metadata back to the web-backend via the job callback.
    """
    from app.pipeline.ingest import ingest_image
    from app.storage.s3_client import download_to_file, make_temp_dir

    tmp_dir = make_temp_dir()
    try:
        local_path = os.path.join(tmp_dir, "image.tif")
        download_to_file(storage_uri, local_path)
        descriptor = ingest_image(local_path)

        # Post metadata back to web-backend
        try:
            httpx.post(
                f"{settings.web_backend_callback_url.rstrip('/').replace('/jobs/callback', '')}/images/{image_id}/metadata",
                json={
                    "status": "ready",
                    "sunAzimuth": descriptor.sun_azimuth,
                    "sunElevation": descriptor.sun_elevation,
                    "resolutionMPP": descriptor.resolution_mpp,
                },
                headers={"X-Internal-Key": settings.web_backend_callback_key},
                timeout=5.0,
            )
        except Exception as e:
            logger.warning("Metadata callback failed: %s", e)

        return {
            "imageId": image_id,
            "sun_azimuth": descriptor.sun_azimuth,
            "sun_elevation": descriptor.sun_elevation,
            "resolution_mpp": descriptor.resolution_mpp,
        }
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
