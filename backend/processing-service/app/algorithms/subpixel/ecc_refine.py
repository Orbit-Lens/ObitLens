import cv2
import numpy as np
from typing import Tuple

def ecc_refine_patch(
    src_patch: np.ndarray,
    ref_patch: np.ndarray,
    n_iters: int = 40,
    eps: float = 1e-5
) -> Tuple[float, float]:
    """
    Sub-pixel alignment of patch using Enhanced Correlation Coefficient (ECC).
    Returns (dx, dy) translation shift.
    """
    warp_matrix = np.eye(2, 3, dtype=np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, n_iters, eps)

    s_u8 = (np.clip(src_patch, 0.0, 1.0) * 255.0).astype(np.uint8)
    r_u8 = (np.clip(ref_patch, 0.0, 1.0) * 255.0).astype(np.uint8)

    try:
        _, warp_matrix = cv2.findTransformECC(
            s_u8,
            r_u8,
            warp_matrix,
            motionType=cv2.MOTION_TRANSLATION,
            criteria=criteria
        )
        dx = float(warp_matrix[0, 2])
        dy = float(warp_matrix[1, 2])
        # Sanity limit: shift should be small within patch (< 3px)
        if abs(dx) < 3.0 and abs(dy) < 3.0:
            return dx, dy
    except Exception:
        pass

    return 0.0, 0.0
