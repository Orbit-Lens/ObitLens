import cv2
import numpy as np
from app.algorithms.types import Image

def denoise(
    image: Image,
    method: str = "bilateral",
    d: int = 5,
    sigma_color: float = 35.0,
    sigma_space: float = 35.0,
    ksize: int = 3
) -> Image:
    """
    Denoises lunar imagery.
    - 'bilateral': preserves sharp crater rim gradients while smoothing regolith noise.
    - 'gaussian': classic isotropic gaussian blur.
    - 'median': removes salt-and-pepper sensor artefacts.
    """
    if method == "none" or method is None:
        return image.copy()

    # Convert to float32 [0, 1]
    img = image.astype(np.float32)

    if method == "bilateral":
        # OpenCV bilateralFilter supports float32
        out = cv2.bilateralFilter(img, d=d, sigmaColor=sigma_color / 255.0, sigmaSpace=sigma_space)
    elif method == "gaussian":
        out = cv2.GaussianBlur(img, (ksize, ksize), 0)
    elif method == "median":
        u8 = (np.clip(img, 0.0, 1.0) * 255.0).astype(np.uint8)
        med = cv2.medianBlur(u8, ksize)
        out = med.astype(np.float32) / 255.0
    else:
        out = img.copy()

    return np.clip(out, 0.0, 1.0)
