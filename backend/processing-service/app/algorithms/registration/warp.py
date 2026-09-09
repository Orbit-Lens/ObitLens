import cv2
import numpy as np
from typing import Tuple, Union
from app.algorithms.types import Image, Transform

def warp_image(
    source_image: Image,
    transform: Union[Transform, np.ndarray],
    output_shape: Tuple[int, int],
    interpolation: int = cv2.INTER_CUBIC
) -> Image:
    """
    Sub-pixel resampling of source image onto the reference geometry (File 1 §3.10).
    output_shape: (height, width)
    """
    h, w = output_shape[:2]

    if isinstance(transform, Transform):
        matrix = transform.matrix
        tf_type = transform.type.lower()
    elif isinstance(transform, np.ndarray):
        matrix = transform
        tf_type = "affine" if matrix.shape == (2, 3) else "homography"
    else:
        raise TypeError(f"Unsupported transform type: {type(transform)}")

    if matrix is None:
        return np.zeros((h, w), dtype=source_image.dtype)

    src = source_image.astype(np.float32)

    if tf_type in ("affine", "similarity") or matrix.shape == (2, 3):
        warped = cv2.warpAffine(
            src,
            matrix[:2, :],
            (w, h),
            flags=interpolation,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=0.0
        )
    else:
        warped = cv2.warpPerspective(
            src,
            matrix,
            (w, h),
            flags=interpolation,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=0.0
        )

    return np.clip(warped, 0.0, 1.0)
