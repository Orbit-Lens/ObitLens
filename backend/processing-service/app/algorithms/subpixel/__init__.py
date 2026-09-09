import cv2
import numpy as np
from typing import Tuple, Optional
from app.algorithms.types import Keypoints, Image, Transform
from app.algorithms.subpixel.ecc_refine import ecc_refine_patch
from app.algorithms.subpixel.lucas_kanade import lucas_kanade_refine, phase_correlation_refine
from app.algorithms.registration.warp import warp_image

def refine_matches(
    kp_src: Keypoints,
    kp_ref: Keypoints,
    src_image: Image,
    ref_image: Image,
    transform: Optional[Transform] = None,
    warped_src: Optional[Image] = None,
    patch_size: int = 21,
    method: str = "phase_corr"
) -> Keypoints:
    """
    Sub-pixel refinement applied per-point on the final inlier set (File 1 §3.11).
    Aligns locally by evaluating residual sub-pixel displacement against reference.
    """
    n = len(kp_src)
    if n == 0:
        return np.empty((0, 2), dtype=np.float32)

    half = patch_size // 2
    r_h, r_w = ref_image.shape[:2]

    # Pre-warp source image so orientation and scale are aligned
    if warped_src is None and transform is not None:
        warped_src = warp_image(src_image, transform, output_shape=(r_h, r_w))
    elif warped_src is None:
        warped_src = src_image

    refined_ref = kp_ref.copy().astype(np.float32)

    for i in range(n):
        rx, ry = int(round(kp_ref[i, 0])), int(round(kp_ref[i, 1]))

        # Check boundary in reference grid
        if (rx - half < 0 or rx + half >= r_w or ry - half < 0 or ry + half >= r_h):
            continue

        s_patch = warped_src[ry - half : ry + half + 1, rx - half : rx + half + 1]
        r_patch = ref_image[ry - half : ry + half + 1, rx - half : rx + half + 1]

        if s_patch.shape != (patch_size, patch_size) or r_patch.shape != (patch_size, patch_size):
            continue

        if method == "phase_corr":
            dx, dy = phase_correlation_refine(s_patch, r_patch)
            if abs(dx) < 1.5 and abs(dy) < 1.5:
                refined_ref[i, 0] = kp_ref[i, 0] - dx
                refined_ref[i, 1] = kp_ref[i, 1] - dy
        elif method == "ecc":
            dx, dy = ecc_refine_patch(s_patch, r_patch)
            if abs(dx) < 1.5 and abs(dy) < 1.5:
                refined_ref[i, 0] = kp_ref[i, 0] - dx
                refined_ref[i, 1] = kp_ref[i, 1] - dy
        elif method == "lucas_kanade":
            rx_ref, ry_ref = lucas_kanade_refine(kp_src[i], kp_ref[i], src_image, ref_image)
            refined_ref[i, 0] = rx_ref
            refined_ref[i, 1] = ry_ref

    return refined_ref
