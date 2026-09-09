import cv2
import numpy as np
from typing import Tuple
from app.algorithms.types import Image

def compute_retinex_reflectance(image: Image, sigma: float = 25.0) -> Image:
    """
    Retinex Log-Domain Decomposition (ALGORITHM_NOTES §2):
      log I(x, y) = log L(x, y) + log R(x, y)
    Large Gaussian spatial filter estimates illumination L(x, y).
    Subtracting it yields illumination-invariant reflectance R(x, y).
    """
    img = np.clip(image.astype(np.float32), 0.0, 1.0) + (1.0 / 255.0)
    log_img = np.log(img)

    ksize = int(max(15, int(sigma * 4) | 1))
    illumination_field = cv2.GaussianBlur(log_img, (ksize, ksize), sigma)
    reflectance = log_img - illumination_field

    min_v = float(np.min(reflectance))
    max_v = float(np.max(reflectance))
    if max_v > min_v:
        norm_r = (reflectance - min_v) / (max_v - min_v)
    else:
        norm_r = np.zeros_like(reflectance)

    return np.clip(norm_r, 0.0, 1.0)

def illumination_invariant_representation(
    image: Image,
    method: str = "retinex",
    clip_limit: float = 2.5,
    tile_grid_size: Tuple[int, int] = (8, 8),
    retinex_sigma: float = 25.0
) -> Image:
    """
    Generates illumination-invariant representation for feature extraction.
    Combines Retinex log-domain decomposition with localized CLAHE.
    """
    if method == "retinex":
        refl = compute_retinex_reflectance(image, sigma=retinex_sigma)
        u8 = (refl * 255.0).clip(0, 255).astype(np.uint8)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        enhanced = clahe.apply(u8)
        return enhanced.astype(np.float32) / 255.0
    elif method == "clahe_only":
        u8 = (image * 255.0).clip(0, 255).astype(np.uint8)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        enhanced = clahe.apply(u8)
        return enhanced.astype(np.float32) / 255.0
    else:
        return image.copy()
