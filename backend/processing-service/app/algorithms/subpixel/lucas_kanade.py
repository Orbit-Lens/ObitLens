import cv2
import numpy as np
from typing import Tuple

def phase_correlation_refine(src_patch: np.ndarray, ref_patch: np.ndarray) -> Tuple[float, float]:
    """
    Sub-pixel shift via Fourier phase correlation.
    """
    s = src_patch.astype(np.float32)
    r = ref_patch.astype(np.float32)

    try:
        (dx, dy), response = cv2.phaseCorrelate(s, r)
        if abs(dx) < 3.0 and abs(dy) < 3.0 and response > 0.1:
            return float(dx), float(dy)
    except Exception:
        pass

    return 0.0, 0.0

def lucas_kanade_refine(
    src_pt: np.ndarray,
    ref_pt: np.ndarray,
    src_img: np.ndarray,
    ref_img: np.ndarray,
    win_size: Tuple[int, int] = (15, 15)
) -> Tuple[float, float]:
    """
    Sub-pixel refinement via Lucas-Kanade optical flow.
    """
    p0 = src_pt.reshape(1, 1, 2).astype(np.float32)
    s_u8 = (np.clip(src_img, 0.0, 1.0) * 255.0).astype(np.uint8)
    r_u8 = (np.clip(ref_img, 0.0, 1.0) * 255.0).astype(np.uint8)

    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01)
    p1, st, err = cv2.calcOpticalFlowPyrLK(
        s_u8, r_u8, p0, None, winSize=win_size, maxLevel=2, criteria=criteria
    )

    if st[0][0] == 1:
        refined = p1[0][0]
        # Only accept if refinement is close to original candidate
        if np.linalg.norm(refined - ref_pt) < 3.0:
            return float(refined[0]), float(refined[1])

    return float(ref_pt[0]), float(ref_pt[1])
