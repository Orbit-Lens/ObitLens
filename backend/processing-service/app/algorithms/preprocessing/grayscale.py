import cv2
import numpy as np
from app.algorithms.types import Image

def to_grayscale(image: Image, band_index: int = 0) -> Image:
    """
    Converts multi-band image or hyperspectral cube to single-band grayscale.
    Returns float32 single-band image.
    """
    if image.ndim == 2:
        return image.astype(np.float32)
    elif image.ndim == 3:
        if image.shape[2] == 3:
            # Standard BGR/RGB to Gray
            gray = cv2.cvtColor((image * 255.0).clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
            return gray.astype(np.float32) / 255.0
        elif image.shape[2] == 4:
            gray = cv2.cvtColor((image[:, :, :3] * 255.0).clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
            return gray.astype(np.float32) / 255.0
        else:
            # Hyperspectral cube: pick requested band
            idx = min(max(0, band_index), image.shape[2] - 1)
            return image[:, :, idx].astype(np.float32)
    return image.astype(np.float32)
