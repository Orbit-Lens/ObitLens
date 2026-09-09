import cv2
import numpy as np
from app.algorithms.types import Image

def sobel_gradient_magnitude(image: Image, ksize: int = 3) -> Image:
    """
    Computes normalized Sobel gradient magnitude, invariant to uniform illumination shifts.
    Output in [0, 1].
    """
    img = image.astype(np.float32)
    gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=ksize)
    gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=ksize)
    mag = cv2.magnitude(gx, gy)
    max_v = float(np.max(mag))
    if max_v > 1e-6:
        mag = mag / max_v
    return np.clip(mag, 0.0, 1.0)

def scharr_gradient_magnitude(image: Image) -> Image:
    """
    Computes Scharr gradient magnitude (more rotationally symmetric than 3x3 Sobel).
    """
    img = image.astype(np.float32)
    gx = cv2.Scharr(img, cv2.CV_32F, 1, 0)
    gy = cv2.Scharr(img, cv2.CV_32F, 0, 1)
    mag = cv2.magnitude(gx, gy)
    max_v = float(np.max(mag))
    if max_v > 1e-6:
        mag = mag / max_v
    return np.clip(mag, 0.0, 1.0)

def laplacian_response(image: Image, ksize: int = 3) -> Image:
    """
    Computes normalized Laplacian second-order response.
    """
    img = image.astype(np.float32)
    lap = cv2.Laplacian(img, cv2.CV_32F, ksize=ksize)
    lap_abs = np.abs(lap)
    max_v = float(np.max(lap_abs))
    if max_v > 1e-6:
        lap_abs = lap_abs / max_v
    return np.clip(lap_abs, 0.0, 1.0)
