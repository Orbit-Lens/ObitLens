"""
processing-service/app/pipeline/geometry.py
Robust geometric model estimation using RANSAC / MAGSAC++.
Blueprint §5 Stage 6 — RANSAC/MAGSAC, affine/homography (configurable per job).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Literal

import cv2
import numpy as np

from app.pipeline.matching import MatchResult

logger = logging.getLogger(__name__)

TransformModel = Literal["affine", "homography"]


@dataclass
class GeometryResult:
    """Output of geometric model estimation."""
    transform_matrix: np.ndarray   # 2x3 (affine) or 3x3 (homography)
    transform_model: str
    inlier_mask: np.ndarray        # bool array of shape [N]
    inlier_src_pts: np.ndarray     # inlier source points [K, 2]
    inlier_ref_pts: np.ndarray     # inlier reference points [K, 2]
    inlier_count: int
    inlier_ratio: float


def estimate_transform(
    matches: MatchResult,
    transform_model: TransformModel = "homography",
    ransac_reproj_threshold: float = 3.0,
    confidence: float = 0.995,
    use_magsac: bool = True,
) -> GeometryResult:
    """
    Fit a geometric model (affine or homography) to match points using
    RANSAC or MAGSAC++ for outlier rejection.

    Blueprint §5 — RANSAC/MAGSAC; affine/homography configurable per job.

    Args:
        matches:                  Candidate correspondences.
        transform_model:          'affine' or 'homography'.
        ransac_reproj_threshold:  Max reprojection error for inlier (pixels).
        confidence:               RANSAC confidence level.
        use_magsac:               Use MAGSAC++ (cv2.USAC_MAGSAC) if available.

    Returns:
        GeometryResult with transform, inlier mask, and inlier pts.

    Raises:
        ValueError: If fewer than the minimum required points are provided.
    """
    src_pts = matches.src_pts
    ref_pts = matches.ref_pts
    total = len(src_pts)

    min_pts = 4 if transform_model == "homography" else 3

    if total < min_pts:
        raise ValueError(
            f"Not enough matches for {transform_model} estimation: "
            f"need ≥{min_pts}, got {total}"
        )

    # Select RANSAC method
    if use_magsac:
        # MAGSAC++ is available in OpenCV 4.5+; gracefully fall back to RANSAC
        method = getattr(cv2, "USAC_MAGSAC", cv2.RANSAC)
    else:
        method = cv2.RANSAC

    if transform_model == "homography":
        matrix, mask = cv2.findHomography(
            src_pts.reshape(-1, 1, 2),
            ref_pts.reshape(-1, 1, 2),
            method,
            ransac_reproj_threshold,
            confidence=confidence,
        )
    else:  # affine
        matrix, mask = cv2.estimateAffine2D(
            src_pts.reshape(-1, 1, 2),
            ref_pts.reshape(-1, 1, 2),
            method=method,
            ransacReprojThreshold=ransac_reproj_threshold,
            confidence=confidence,
        )

    if matrix is None or mask is None:
        logger.warning("Geometric estimation failed — no transform found")
        return GeometryResult(
            transform_matrix=np.eye(3, dtype=np.float64),
            transform_model=transform_model,
            inlier_mask=np.zeros(total, dtype=bool),
            inlier_src_pts=np.empty((0, 2)),
            inlier_ref_pts=np.empty((0, 2)),
            inlier_count=0,
            inlier_ratio=0.0,
        )

    bool_mask = mask.ravel().astype(bool)
    inlier_src = src_pts[bool_mask]
    inlier_ref = ref_pts[bool_mask]
    inlier_count = bool_mask.sum()
    inlier_ratio = inlier_count / total if total > 0 else 0.0

    logger.info(
        "Geometric estimation (%s): %d / %d inliers (ratio=%.3f)",
        transform_model, inlier_count, total, inlier_ratio,
    )

    return GeometryResult(
        transform_matrix=matrix,
        transform_model=transform_model,
        inlier_mask=bool_mask,
        inlier_src_pts=inlier_src,
        inlier_ref_pts=inlier_ref,
        inlier_count=int(inlier_count),
        inlier_ratio=float(inlier_ratio),
    )
