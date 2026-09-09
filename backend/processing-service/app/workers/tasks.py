import time
import os
import tempfile
import logging
import httpx
import cv2
import numpy as np
from typing import Dict, Any, Optional

from app.config import settings
from app.storage.s3_client import download_file_to_temp, upload_file, upload_json
from app.pipeline.ingest import read_raster_image
from app.pipeline.preprocess import preprocess_image
from app.pipeline.pyramid import calculate_pyramid_levels, build_gaussian_pyramid
from app.pipeline.detectors.classical import extract_classical_features
from app.pipeline.detectors.learned import extract_learned_features
from app.pipeline.matching import match_descriptors, extract_match_points
from app.pipeline.geometry import estimate_transform
from app.pipeline.coverage import filter_uniform_coverage
from app.pipeline.warp import warp_source_to_reference, create_preview_composite, save_geotiff
from app.pipeline.metrics import (
    compute_metrics,
    format_match_points_geojson,
    compute_image_similarity_metrics,
    generate_difference_map,
)

logger = logging.getLogger("orbitlens.worker")

async def report_progress_to_backend(
    job_id: str,
    status: str,
    progress: int,
    status_message: str,
    metrics: Optional[Dict[str, Any]] = None,
    artifacts: Optional[Dict[str, Any]] = None,
    error_code: Optional[str] = None,
    error_message: Optional[str] = None
):
    """
    Sends internal authenticated progress/results callback to Node.js backend.
    """
    url = f"{settings.web_backend_url}/api/v1/jobs/{job_id}/status-internal"
    payload = {
        "status": status,
        "progress": progress,
        "statusMessage": status_message,
        "metrics": metrics,
        "artifacts": artifacts,
        "errorCode": error_code,
        "errorMessage": error_message,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                json=payload,
                headers={"X-Internal-Key": settings.internal_api_key},
            )
            if response.status_code != 200:
                logger.warning(f"Backend status update returned status {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"Failed to post progress to web backend: {e}")

async def run_registration_pipeline(job_payload: Dict[str, Any]):
    """
    Executes the full 10-stage Chandrayaan-2 lunar image registration pipeline.
    """
    job_id = job_payload["jobId"]
    start_time = time.time()
    temp_files_to_clean = []

    try:
        logger.info(f"Starting registration pipeline for job {job_id}")

        # ── Stage 1: Ingestion & Download (15%) ──────────────────────────────
        await report_progress_to_backend(job_id, "preprocessing", 15, "Downloading imagery and parsing PDS4/raster metadata")
        
        src_temp = download_file_to_temp(job_payload["sourceImageStorageKey"])
        ref_temp = download_file_to_temp(job_payload["referenceImageStorageKey"])
        temp_files_to_clean.extend([src_temp, ref_temp])

        src_raw, src_meta = read_raster_image(src_temp, max_dimension=4096)
        ref_raw, ref_meta = read_raster_image(ref_temp, max_dimension=4096)

        # ── Stage 2: Preprocessing & Illumination Normalization (30%) ───────
        await report_progress_to_backend(job_id, "preprocessing", 30, "Applying radiometric CLAHE and illumination correction")
        
        illumination_corr = job_payload.get("parameters", {}).get("illuminationCorrection", True)
        src_clean = preprocess_image(src_raw, illumination_correction=illumination_corr)
        ref_clean = preprocess_image(ref_raw, illumination_correction=illumination_corr)

        # ── Stage 3: Multi-Scale Pyramid & Feature Matching (50%) ───────────
        await report_progress_to_backend(job_id, "matching", 50, "Extracting features across multi-scale pyramids")
        
        algorithm = job_payload.get("algorithm", "classical")
        ratio_threshold = job_payload.get("parameters", {}).get("ratioThreshold", 0.75)
        max_levels = job_payload.get("parameters", {}).get("maxPyramidLevels", 4)

        src_pyramid = build_gaussian_pyramid(src_clean, levels=max_levels)
        ref_pyramid = build_gaussian_pyramid(ref_clean, levels=max_levels)

        all_src_pts = []
        all_ref_pts = []

        # Coarse-to-fine matching across pyramid levels
        for level_idx in range(len(src_pyramid)):
            s_img, s_scale = src_pyramid[level_idx]
            r_img, r_scale = ref_pyramid[level_idx]

            if algorithm == "learned":
                kp_s, desc_s = extract_learned_features(s_img)
                kp_r, desc_r = extract_learned_features(r_img)
            else:
                kp_s, desc_s = extract_classical_features(s_img, method="sift")
                kp_r, desc_r = extract_classical_features(r_img, method="sift")

            matches = match_descriptors(desc_s, desc_r, ratio_threshold=ratio_threshold)
            p_src, p_ref = extract_match_points(kp_s, kp_r, matches, scale_src=s_scale, scale_ref=r_scale)

            if len(p_src) > 0:
                all_src_pts.append(p_src)
                all_ref_pts.append(p_ref)

        if all_src_pts:
            cand_src = np.vstack(all_src_pts)
            cand_ref = np.vstack(all_ref_pts)
        else:
            cand_src = np.empty((0, 2), dtype=np.float32)
            cand_ref = np.empty((0, 2), dtype=np.float32)

        total_candidates = len(cand_src)
        logger.info(f"Found {total_candidates} total candidate correspondences across all pyramid levels.")

        if total_candidates < 4:
            await report_progress_to_backend(
                job_id,
                "failed",
                100,
                "Insufficient keypoint matches found between images",
                error_code="REGISTRATION_LOW_CONFIDENCE",
                error_message="Could not find sufficient correspondence points in the overlapping region."
            )
            return

        # ── Stage 4: Geometric Estimation & RANSAC (70%) ─────────────────────
        await report_progress_to_backend(job_id, "estimating_transform", 70, "Estimating geometric transform via robust RANSAC")

        transform_model = job_payload.get("transformModel", "homography")
        ransac_thresh = job_payload.get("parameters", {}).get("ransacReprojThreshold", 3.0)

        matrix, inlier_mask, inlier_src, inlier_ref, residuals = estimate_transform(
            cand_src,
            cand_ref,
            transform_model=transform_model,
            ransac_threshold=ransac_thresh
        )

        if matrix is None or len(inlier_src) < 4:
            await report_progress_to_backend(
                job_id,
                "failed",
                100,
                "RANSAC geometric model fitting failed",
                error_code="REGISTRATION_LOW_CONFIDENCE",
                error_message="Could not reliably fit a geometric transformation with sufficient inliers."
            )
            return

        # ── Stage 5: Uniform Coverage Grid Filtering (80%) ──────────────────
        target_cells = job_payload.get("parameters", {}).get("coverageTargetCells", 64)
        filt_src, filt_ref, inlier_residuals, coverage_score = filter_uniform_coverage(
            inlier_src,
            inlier_ref,
            residuals[inlier_mask],
            ref_width=ref_raw.shape[1],
            ref_height=ref_raw.shape[0],
            target_cells=target_cells,
        )

        # ── Stage 6: Sub-pixel Warping & Artifact Generation (90%) ──────────
        await report_progress_to_backend(job_id, "warping", 90, "Warping source raster with sub-pixel interpolation")

        warped_src = warp_source_to_reference(
            src_raw,
            matrix,
            ref_shape=ref_raw.shape[:2],
            transform_model=transform_model,
            interpolation=cv2.INTER_CUBIC
        )

        preview_img = create_preview_composite(warped_src, ref_raw, filt_src, filt_ref)

        # Save artifacts locally in temp directory
        temp_dir = tempfile.mkdtemp()
        warped_path = os.path.join(temp_dir, f"registered_{job_id}.tif")
        preview_path = os.path.join(temp_dir, f"preview_{job_id}.png")
        diff_path = os.path.join(temp_dir, f"diff_{job_id}.png")
        reg_disp_path = os.path.join(temp_dir, f"reg_disp_{job_id}.png")

        save_geotiff(warped_src, warped_path)
        cv2.imwrite(preview_path, preview_img)

        # Real difference map generator
        diff_img = generate_difference_map(warped_src, ref_raw)
        cv2.imwrite(diff_path, diff_img)

        # Real web-displayable registered image preview (8-bit grayscale/RGB)
        reg_disp_uint8 = np.clip(warped_src * 255.0, 0, 255).astype(np.uint8)
        cv2.imwrite(reg_disp_path, reg_disp_uint8)

        # Upload artifacts to Object Storage
        reg_s3_key = f"artifacts/{job_id}/registered_product.tif"
        reg_disp_s3_key = f"artifacts/{job_id}/registered_preview.png"
        diff_s3_key = f"artifacts/{job_id}/difference_map.png"
        prev_s3_key = f"artifacts/{job_id}/preview_overlay.png"
        points_s3_key = f"artifacts/{job_id}/match_points.geojson"
        report_s3_key = f"artifacts/{job_id}/metrics_report.json"

        upload_file(warped_path, reg_s3_key, content_type="image/tiff")
        upload_file(reg_disp_path, reg_disp_s3_key, content_type="image/png")
        upload_file(diff_path, diff_s3_key, content_type="image/png")
        upload_file(preview_path, prev_s3_key, content_type="image/png")

        # ── Stage 7: Quantitative Evaluation Metrics (98%) ──────────────────
        elapsed_ms = (time.time() - start_time) * 1000.0
        metrics = compute_metrics(
            inlier_residuals,
            total_candidates=total_candidates,
            coverage_score=coverage_score,
            processing_time_ms=elapsed_ms,
            src_meta=src_meta,
            ref_meta=ref_meta,
        )

        # Compute live SSIM, MI, and PSNR image similarity metrics
        sim_metrics = compute_image_similarity_metrics(warped_src, ref_raw)
        metrics.update(sim_metrics)

        # Transformation matrix serialization
        if hasattr(matrix, "tolist"):
            metrics["transformationMatrix"] = matrix.tolist()

        geojson_points = format_match_points_geojson(filt_src, filt_ref, inlier_residuals)
        upload_json(geojson_points, points_s3_key)
        upload_json(metrics, report_s3_key)

        artifacts = {
            "registeredImageStorageKey": reg_s3_key,
            "registeredPreviewStorageKey": reg_disp_s3_key,
            "differenceMapStorageKey": diff_s3_key,
            "previewOverlayStorageKey": prev_s3_key,
            "matchPointsStorageKey": points_s3_key,
            "metricsReportStorageKey": report_s3_key,
        }

        # ── Stage 8: Complete Job & Notify (100%) ───────────────────────────
        await report_progress_to_backend(
            job_id,
            "complete",
            100,
            f"Registration successfully completed (RMSE: {metrics['rmse']} px, {metrics['inlierCount']} inliers)",
            metrics=metrics,
            artifacts=artifacts
        )
        logger.info(f"Job {job_id} completed successfully in {elapsed_ms:.1f}ms. RMSE: {metrics['rmse']} px")

    except Exception as e:
        logger.exception(f"Unhandled error in registration pipeline for job {job_id}: {e}")
        await report_progress_to_backend(
            job_id,
            "failed",
            100,
            "Pipeline error occurred during registration",
            error_code="INTERNAL_ERROR",
            error_message=str(e),
        )
    finally:
        # Clean up temporary disk files
        for p in temp_files_to_clean:
            if os.path.exists(p):
                try:
                    os.unlink(p)
                except Exception:
                    pass
