import cv2
import numpy as np
from typing import Tuple
from app.algorithms.types import Image

def detect_shadow_mask(
    image: Image,
    threshold_method: str = "otsu"
) -> Tuple[Image, Image]:
    """
    Detects cast shadow regions in lunar craters to produce shadow mask and confidence map.
    Returns:
      (binary_mask: float32, confidence: float32)
    """
    u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)

    if threshold_method == "otsu":
        _, binary = cv2.threshold(u8, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    else:
        binary = cv2.adaptiveThreshold(
            u8, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 2
        )

    # Invert so 1 = non-shadow, 0 = deep shadow
    mask = ((255 - binary) / 255.0).astype(np.float32)
    confidence = cv2.GaussianBlur(mask, (5, 5), 1.0)

    return mask, confidence
