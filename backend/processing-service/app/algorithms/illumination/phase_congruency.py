import cv2
import numpy as np
from app.algorithms.types import Image

def phase_congruency(image: Image, nscale: int = 4, norient: int = 6) -> Image:
    """
    Phase congruency representation for illumination and contrast invariance.
    Uses multi-scale directional frequency gradient response as robust fallback.
    """
    img = image.astype(np.float32)
    responses = []
    for scale in range(1, nscale + 1):
        sigma = float(2 ** (scale - 1))
        ksize = int(2 * np.ceil(2 * sigma) + 1)
        blur = cv2.GaussianBlur(img, (ksize, ksize), sigma)
        gx = cv2.Sobel(blur, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(blur, cv2.CV_32F, 0, 1, ksize=3)
        mag = cv2.magnitude(gx, gy)
        responses.append(mag)

    combined = np.mean(responses, axis=0)
    max_v = float(np.max(combined))
    if max_v > 1e-6:
        combined = combined / max_v

    return np.clip(combined, 0.0, 1.0)
