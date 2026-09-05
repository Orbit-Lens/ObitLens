"""
processing-service/app/pipeline/preprocess.py
Radiometric normalization, shadow suppression, and denoising.
Blueprint §5 Stage 2 — preprocessing with swappable strategy pattern.
"""
from __future__ import annotations

import logging
from typing import Callable

import cv2
import numpy as np

logger = logging.getLogger(__name__)

# A preprocessing step is a callable: (image: np.ndarray, config: dict) -> np.ndarray
PreprocessStep = Callable[[np.ndarray, dict], np.ndarray]


# ── Individual preprocessing steps ───────────────────────────────────────────

def normalize_clahe(image: np.ndarray, config: dict) -> np.ndarray:
    """
    CLAHE (Contrast Limited Adaptive Histogram Equalization) normalization.
    Improves local contrast — more effective than global histogram stretch
    for lunar imagery with high dynamic range (bright highlands vs dark maria).
    """
    clip_limit = config.get("clahe_clip_limit", 2.0)
    tile_grid = config.get("clahe_tile_grid", (8, 8))

    img_u8 = _to_uint8(image)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid)
    result = clahe.apply(img_u8)
    return result.astype(np.float32) / 255.0


def normalize_minmax(image: np.ndarray, _config: dict) -> np.ndarray:
    """Simple min-max stretch to [0, 1]."""
    min_val = image.min()
    max_val = image.max()
    if max_val == min_val:
        return np.zeros_like(image, dtype=np.float32)
    return ((image - min_val) / (max_val - min_val)).astype(np.float32)


def suppress_shadows(image: np.ndarray, config: dict) -> np.ndarray:
    """
    Gradient-domain shadow suppression using a log-transform approach.
    Reduces the effect of cast shadows by operating on the gradient domain.
    Suitable for high-oblique lunar images with pronounced shadow boundaries.
    """
    epsilon = config.get("shadow_epsilon", 1e-6)
    # Log transform attenuates large intensity differences (e.g. shadows)
    log_img = np.log1p(image.clip(min=0) + epsilon)
    return normalize_minmax(log_img, {})


def denoise_bilateral(image: np.ndarray, config: dict) -> np.ndarray:
    """
    Bilateral filter denoising — preserves edges while smoothing flat regions.
    Better than Gaussian blur for lunar imagery where crater edges are
    important feature boundaries.
    """
    d = config.get("bilateral_d", 9)
    sigma_color = config.get("bilateral_sigma_color", 75)
    sigma_space = config.get("bilateral_sigma_space", 75)
    img_u8 = _to_uint8(image)
    result = cv2.bilateralFilter(img_u8, d, sigma_color, sigma_space)
    return result.astype(np.float32) / 255.0


# ── Strategy registry ─────────────────────────────────────────────────────────

STEP_REGISTRY: dict[str, PreprocessStep] = {
    "clahe": normalize_clahe,
    "minmax": normalize_minmax,
    "shadow_suppress": suppress_shadows,
    "bilateral_denoise": denoise_bilateral,
}


# ── Pipeline runner ───────────────────────────────────────────────────────────

def preprocess(
    image: np.ndarray,
    steps: list[str] | None = None,
    config: dict | None = None,
) -> np.ndarray:
    """
    Run the preprocessing pipeline on a floating-point image array.

    Args:
        image:  Input array (any numeric dtype, single-band).
        steps:  Ordered list of step names from STEP_REGISTRY.
                Defaults to ['clahe', 'bilateral_denoise'].
        config: Config dict passed to each step.

    Returns:
        Preprocessed float32 array in range [0, 1].
    """
    if steps is None:
        steps = ["clahe", "bilateral_denoise"]
    if config is None:
        config = {}

    result = image.astype(np.float32)
    for step_name in steps:
        fn = STEP_REGISTRY.get(step_name)
        if fn is None:
            logger.warning("Unknown preprocessing step '%s' — skipping", step_name)
            continue
        result = fn(result, config)
        logger.debug("Preprocessing step '%s' applied", step_name)

    return result


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_uint8(image: np.ndarray) -> np.ndarray:
    """Convert any float/uint16 image to uint8 for OpenCV functions."""
    if image.dtype == np.uint8:
        return image
    min_val, max_val = image.min(), image.max()
    if max_val == min_val:
        return np.zeros_like(image, dtype=np.uint8)
    scaled = (image - min_val) / (max_val - min_val) * 255
    return scaled.astype(np.uint8)
