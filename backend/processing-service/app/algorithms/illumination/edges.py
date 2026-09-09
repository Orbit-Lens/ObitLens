import cv2
import numpy as np
from app.algorithms.types import Image

def canny_edges(image: Image, low_thresh: float = 0.1, high_thresh: float = 0.3) -> Image:
    """
    Computes binary edge map via Canny detector on lunar crater rims.
    """
    u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)
    edges = cv2.Canny(u8, int(low_thresh * 255), int(high_thresh * 255))
    return (edges > 0).astype(np.float32)
