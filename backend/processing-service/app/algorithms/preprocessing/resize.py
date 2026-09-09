import cv2
import numpy as np
from typing import Optional
from app.algorithms.types import Image

def resize_to_scale(
    image: Image,
    target_mpp: Optional[float] = None,
    current_mpp: Optional[float] = None,
    scale_factor: Optional[float] = None
) -> Image:
    """
    Resolution normalization using meters per pixel (mpp) or manual scale factor.
    """
    if scale_factor is None:
        if target_mpp and current_mpp and current_mpp > 0 and target_mpp > 0:
            scale_factor = current_mpp / target_mpp
        else:
            scale_factor = 1.0

    if abs(scale_factor - 1.0) < 1e-4:
        return image.copy()

    h, w = image.shape[:2]
    new_w = max(1, int(round(w * scale_factor)))
    new_h = max(1, int(round(h * scale_factor)))

    interp = cv2.INTER_AREA if scale_factor < 1.0 else cv2.INTER_CUBIC
    resized = cv2.resize(image, (new_w, new_h), interpolation=interp)
    return resized
