"""
processing-service/app/pipeline/metrics.py
Registration quality metric computation.
Blueprint §5 Stage 9 — RMSE, inlier count, inlier ratio, coverage score,
per-point reprojection error.
"""
from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from typing import Optional

import numpy as np

from app.pipeline.geometry import GeometryResult

logger = logging.getLogger(__name__)


@dataclass
class RegistrationMetrics:
    """All quality metrics for one registration job."""
    rmse: float                        # RMSE of inlier residuals (pixels)
    inlier_count: int
    inlier_ratio: float                # 0–1
    coverage_score: float              # 0–1 (fraction of grid cells occupied)
    per_point_errors: list[float]      # reprojection error per inlier
    mean_reprojection_error: float
    median_reprojection_error: float
    # Confidence flag (Blueprint §6 — 422 REGISTRATION_LOW_CONFIDENCE)
    low_confidence: bool
    low_confidence_reason: Optional[str] = None


LOW_CONFIDENCE_INLIER_RATIO = 0.05    # < 5% inliers → low confidence
LOW_CONFIDENCE_INLIER_COUNT = 8       # < 8 inliers  → low confidence
LOW_CONFIDENCE_COVERAGE_SCORE = 0.1   # < 10% cells occupied → low confidence


def compute_metrics(
    geometry: GeometryResult,
    coverage_score: float,
    covered_src_pts: np.ndarray,
    covered_ref_pts: np.ndarray,
) -> RegistrationMetrics:
    """
    Compute registration quality metrics from the geometry result and
    coverage-enforced inlier sets.
    Blueprint §5 — RMSE, inlier count, inlier ratio, coverage score,
    per-tie-point residual map.

    Args:
        geometry:         Geometric estimation result (full inlier set).
        coverage_score:   Fraction of NxN grid cells occupied [0, 1].
        covered_src_pts:  Coverage-filtered source inlier points [K, 2].
        covered_ref_pts:  Coverage-filtered reference inlier points [K, 2].

    Returns:
        RegistrationMetrics dataclass.
    """
    T = geometry.transform_matrix

    if len(covered_src_pts) == 0:
        return RegistrationMetrics(
            rmse=float("inf"),
            inlier_count=0,
            inlier_ratio=0.0,
            coverage_score=coverage_score,
            per_point_errors=[],
            mean_reprojection_error=float("inf"),
            median_reprojection_error=float("inf"),
            low_confidence=True,
            low_confidence_reason="No inliers after coverage enforcement",
        )

    # Project source points through the transform
    if geometry.transform_model == "homography":
        src_h = np.hstack([covered_src_pts, np.ones((len(covered_src_pts), 1))])
        proj = (T @ src_h.T).T
        projected = proj[:, :2] / proj[:, 2:3]
    else:
        projected = (T[:, :2] @ covered_src_pts.T).T + T[:, 2]

    # Per-point reprojection errors
    errors = np.linalg.norm(projected - covered_ref_pts, axis=1)
    per_point_errors = errors.tolist()

    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mean_err = float(np.mean(errors))
    median_err = float(np.median(errors))

    inlier_count = geometry.inlier_count
    inlier_ratio = geometry.inlier_ratio

    # Determine low-confidence flag
    low_confidence = False
    reason: Optional[str] = None

    if inlier_count < LOW_CONFIDENCE_INLIER_COUNT:
        low_confidence = True
        reason = f"Inlier count {inlier_count} below minimum {LOW_CONFIDENCE_INLIER_COUNT}"
    elif inlier_ratio < LOW_CONFIDENCE_INLIER_RATIO:
        low_confidence = True
        reason = f"Inlier ratio {inlier_ratio:.3f} below threshold {LOW_CONFIDENCE_INLIER_RATIO}"
    elif coverage_score < LOW_CONFIDENCE_COVERAGE_SCORE:
        low_confidence = True
        reason = f"Coverage score {coverage_score:.3f} below threshold {LOW_CONFIDENCE_COVERAGE_SCORE}"

    logger.info(
        "Metrics: RMSE=%.4fpx, inliers=%d (%.3f), coverage=%.3f%s",
        rmse, inlier_count, inlier_ratio, coverage_score,
        f" [LOW CONFIDENCE: {reason}]" if low_confidence else "",
    )

    return RegistrationMetrics(
        rmse=rmse,
        inlier_count=inlier_count,
        inlier_ratio=inlier_ratio,
        coverage_score=coverage_score,
        per_point_errors=per_point_errors,
        mean_reprojection_error=mean_err,
        median_reprojection_error=median_err,
        low_confidence=low_confidence,
        low_confidence_reason=reason,
    )


def metrics_to_json(metrics: RegistrationMetrics) -> str:
    """Serialize metrics to a JSON string for the metrics report artifact."""
    d = asdict(metrics)
    return json.dumps(d, indent=2)


def match_points_to_geojson(
    src_pts: np.ndarray,
    ref_pts: np.ndarray,
    per_point_errors: list[float],
) -> str:
    """
    Convert match point pairs to a GeoJSON FeatureCollection.
    Each feature represents one tie-point pair with reprojection error as a property.
    """
    features = []
    for i, (src, ref, err) in enumerate(zip(src_pts, ref_pts, per_point_errors)):
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "MultiPoint",
                "coordinates": [[float(src[0]), float(src[1])], [float(ref[0]), float(ref[1])]],
            },
            "properties": {
                "id": i,
                "reprojection_error_px": round(err, 4),
                "type": "tie_point",
            },
        })

    return json.dumps({
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "inlier_count": len(src_pts),
            "coordinate_system": "image_pixels",
        },
    }, indent=2)
