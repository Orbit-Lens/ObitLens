import cv2
import numpy as np
from typing import List, Tuple, Optional
from app.algorithms.types import Image

def compute_pyramid_levels(scale_ratio: Optional[float], l_max: int = 6) -> int:
    """
    Computes required pyramid octaves per File 2 §2 and ALGORITHM_NOTES §1:
      L = min(L_max, floor(log2(ratio)) + 1)
    """
    if scale_ratio is None or scale_ratio <= 1.0:
        return 1
    levels = int(np.floor(np.log2(abs(scale_ratio))) + 1)
    return max(1, min(l_max, levels))

def build_gaussian_pyramid(
    image: Image,
    levels: int = 4,
    downscale: float = 2.0
) -> List[Tuple[Image, float]]:
    """
    Builds a Gaussian image pyramid.
    Ordering: Finest-to-coarsest:
      level 0 = full resolution (scale = 1.0)
      level k = downscaled by downscale^k (scale = 1.0 / downscale^k)
    Returns:
      List of (level_image, scale_relative_to_level_0)
    """
    pyramid: List[Tuple[Image, float]] = [(image, 1.0)]
    current = image

    for lvl in range(1, levels):
        h, w = current.shape[:2]
        new_w = max(16, int(round(w / downscale)))
        new_h = max(16, int(round(h / downscale)))
        if new_w <= 16 or new_h <= 16:
            break

        # Low-pass filter + decimation
        blurred = cv2.GaussianBlur(current, (5, 5), sigmaX=1.0)
        downsampled = cv2.resize(blurred, (new_w, new_h), interpolation=cv2.INTER_AREA)
        scale = 1.0 / (downscale ** lvl)
        pyramid.append((downsampled, float(scale)))
        current = downsampled

    return pyramid
