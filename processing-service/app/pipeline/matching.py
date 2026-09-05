"""
processing-service/app/pipeline/matching.py
Feature matching — nearest-neighbour + Lowe ratio test (classical) or
dense correspondence merge (learned) across pyramid levels.
Blueprint §5 Stage 5.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import cv2
import numpy as np

from app.pipeline.detectors.classical import KeypointResult

logger = logging.getLogger(__name__)


@dataclass
class MatchResult:
    """Matched point arrays ready for geometric estimation."""
    src_pts: np.ndarray    # shape [N, 2] — (x, y) float32
    ref_pts: np.ndarray    # shape [N, 2] — (x, y) float32
    scores: np.ndarray     # shape [N]   — confidence [0, 1]


def match_classical(
    src_kp_result: KeypointResult,
    ref_kp_result: KeypointResult,
    ratio_threshold: float = 0.75,
) -> MatchResult:
    """
    Nearest-neighbour matching with Lowe's ratio test.
    Blueprint §5 — ratio test threshold configurable per job.
    A lower threshold (e.g. 0.70) is better for low-texture lunar imagery.
    """
    if len(src_kp_result.keypoints) == 0 or len(ref_kp_result.keypoints) == 0:
        return MatchResult(
            src_pts=np.empty((0, 2), dtype=np.float32),
            ref_pts=np.empty((0, 2), dtype=np.float32),
            scores=np.empty(0, dtype=np.float32),
        )

    # Choose matcher based on descriptor type
    detector = src_kp_result.detector_type
    if detector in ("ORB", "AKAZE"):
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        src_desc = src_kp_result.descriptors.astype(np.uint8)
        ref_desc = ref_kp_result.descriptors.astype(np.uint8)
    else:
        matcher = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
        src_desc = src_kp_result.descriptors
        ref_desc = ref_kp_result.descriptors

    # k=2 for ratio test
    try:
        knn_matches = matcher.knnMatch(src_desc, ref_desc, k=2)
    except cv2.error as e:
        logger.error("knnMatch failed: %s", e)
        return MatchResult(
            src_pts=np.empty((0, 2), dtype=np.float32),
            ref_pts=np.empty((0, 2), dtype=np.float32),
            scores=np.empty(0, dtype=np.float32),
        )

    good_src: list[tuple[float, float]] = []
    good_ref: list[tuple[float, float]] = []
    scores: list[float] = []

    for m, n in knn_matches:
        if m.distance < ratio_threshold * n.distance:
            good_src.append(src_kp_result.keypoints[m.queryIdx].pt)
            good_ref.append(ref_kp_result.keypoints[m.trainIdx].pt)
            # Score: normalized inverse distance (closer to 1 = better match)
            scores.append(1.0 - m.distance / n.distance)

    logger.info(
        "Ratio test: %d / %d matches retained (threshold=%.2f)",
        len(good_src), len(knn_matches), ratio_threshold,
    )

    if not good_src:
        return MatchResult(
            src_pts=np.empty((0, 2), dtype=np.float32),
            ref_pts=np.empty((0, 2), dtype=np.float32),
            scores=np.empty(0, dtype=np.float32),
        )

    return MatchResult(
        src_pts=np.array(good_src, dtype=np.float32),
        ref_pts=np.array(good_ref, dtype=np.float32),
        scores=np.array(scores, dtype=np.float32),
    )


def merge_pyramid_matches(
    level_matches: list[tuple[MatchResult, float]],
) -> MatchResult:
    """
    Merge matches from multiple pyramid levels.
    Each match is scaled back to the original image coordinates using
    the level's scale factor.

    Args:
        level_matches: List of (MatchResult, scale) tuples, coarsest first.
                       scale is the downscale factor for that level (e.g. 0.25).

    Returns:
        Combined MatchResult in full-resolution image coordinates.
    """
    all_src, all_ref, all_scores = [], [], []

    for match_result, scale in level_matches:
        if len(match_result.src_pts) == 0:
            continue
        # Scale coordinates back to full-resolution space
        all_src.append(match_result.src_pts / scale)
        all_ref.append(match_result.ref_pts / scale)
        all_scores.append(match_result.scores)

    if not all_src:
        return MatchResult(
            src_pts=np.empty((0, 2), dtype=np.float32),
            ref_pts=np.empty((0, 2), dtype=np.float32),
            scores=np.empty(0, dtype=np.float32),
        )

    return MatchResult(
        src_pts=np.vstack(all_src),
        ref_pts=np.vstack(all_ref),
        scores=np.concatenate(all_scores),
    )
