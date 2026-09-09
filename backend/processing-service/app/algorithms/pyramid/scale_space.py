import cv2
import numpy as np
from typing import List
from app.algorithms.types import Image

def scale_space_extrema(image: Image, sigmas: List[float]) -> List[Image]:
    """
    Computes scale-space smoothed slices across arbitrary sigma values.
    """
    img = image.astype(np.float32)
    slices = []
    for s in sigmas:
        ksize = int(2 * np.ceil(2 * s) + 1)
        blur = cv2.GaussianBlur(img, (ksize, ksize), s)
        slices.append(blur)
    return slices
