import cv2
import numpy as np
from typing import Tuple
from app.algorithms.types import Image

def equalize(
    image: Image,
    method: str = "clahe",
    clip_limit: float = 2.5,
    tile_grid_size: Tuple[int, int] = (8, 8)
) -> Image:
    """
    Enhances local contrast to reveal subtle topographic lunar crater rims.
    Outputs float32 in [0, 1].
    """
    u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)

    if method == "clahe":
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        eq = clahe.apply(u8)
    elif method == "hist_eq":
        eq = cv2.equalizeHist(u8)
    else:
        eq = u8

    return eq.astype(np.float32) / 255.0
