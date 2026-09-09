import cv2
import numpy as np
from typing import List
from app.algorithms.types import Image
from app.algorithms.pyramid.gaussian_pyramid import build_gaussian_pyramid

def build_laplacian_pyramid(image: Image, levels: int = 4) -> List[Image]:
    """
    Builds a Laplacian pyramid: band-pass filtered representations across scales.
    Level 0 = finest band-pass residual.
    """
    gauss_pyr = [img for img, _ in build_gaussian_pyramid(image, levels=levels)]
    laplacian_pyr: List[Image] = []

    for i in range(len(gauss_pyr) - 1):
        h, w = gauss_pyr[i].shape[:2]
        expanded = cv2.resize(gauss_pyr[i + 1], (w, h), interpolation=cv2.INTER_LINEAR)
        expanded = cv2.GaussianBlur(expanded, (5, 5), 1.0)
        lap = gauss_pyr[i] - expanded
        laplacian_pyr.append(lap)

    laplacian_pyr.append(gauss_pyr[-1])
    return laplacian_pyr
