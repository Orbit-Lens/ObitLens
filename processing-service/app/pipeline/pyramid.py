"""
processing-service/app/pipeline/pyramid.py
Multi-scale image pyramid construction.
Blueprint §5 Stage 3 — build a multi-scale pyramid on both source and reference
to bridge sensor resolution gaps (e.g. OHRC ~25cm vs IIRS ~80m).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import cv2
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class PyramidLevel:
    """One level of a multi-scale pyramid."""
    image: np.ndarray   # Downsampled float32 image
    scale: float        # Downscale factor relative to original (1.0 = full res)
    level: int          # Level index (0 = finest)


def compute_pyramid_levels(
    src_resolution_mpp: float | None,
    ref_resolution_mpp: float | None,
    max_levels: int = 6,
) -> int:
    """
    Compute the number of pyramid levels needed to bridge the resolution gap
    between source and reference sensors.
    Blueprint §5 — number of levels derived from resolution ratio (not hardcoded).

    Args:
        src_resolution_mpp: Source sensor resolution in metres/pixel.
        ref_resolution_mpp: Reference sensor resolution in metres/pixel.
        max_levels:         Upper bound on pyramid depth.

    Returns:
        Number of levels (at least 1 for a trivial single-level pyramid).
    """
    if src_resolution_mpp is None or ref_resolution_mpp is None:
        logger.info("Resolution metadata unavailable — using default 4-level pyramid")
        return 4

    ratio = max(src_resolution_mpp, ref_resolution_mpp) / min(
        src_resolution_mpp, ref_resolution_mpp
    )
    # Each pyramid level halves the resolution — need log2(ratio) levels
    import math
    levels = max(1, min(max_levels, math.ceil(math.log2(ratio + 1))))
    logger.info(
        "Resolution ratio %.1fx → %d pyramid levels", ratio, levels
    )
    return levels


def build_pyramid(
    image: np.ndarray,
    n_levels: int,
) -> list[PyramidLevel]:
    """
    Build a Gaussian image pyramid.
    Level 0 is the original (or a downsample to a manageable working size);
    each subsequent level halves the previous.

    Args:
        image:    Float32 image array [H, W].
        n_levels: Number of levels to generate.

    Returns:
        List of PyramidLevel from coarsest (index 0) to finest (last).
    """
    img = image.astype(np.float32)
    levels: list[PyramidLevel] = []

    # Build from fine to coarse, then reverse so index 0 = coarsest
    current = img
    raw_levels = [current]
    for _ in range(n_levels - 1):
        current = cv2.pyrDown(current)
        raw_levels.append(current)

    raw_levels.reverse()  # coarsest first

    for i, lvl_img in enumerate(raw_levels):
        scale = 1.0 / (2 ** (len(raw_levels) - 1 - i))
        levels.append(PyramidLevel(image=lvl_img, scale=scale, level=i))
        logger.debug(
            "Pyramid level %d: %dx%d (scale=%.4f)",
            i, lvl_img.shape[1], lvl_img.shape[0], scale,
        )

    return levels
