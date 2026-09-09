import cv2
import numpy as np
from typing import Tuple, Optional
from app.algorithms.types import Keypoints, InlierMask, Transform

def estimate_magsac(
    src_pts: Keypoints,
    ref_pts: Keypoints,
    model_type: str = "homography",
    reproj_threshold: float = 3.0,
    max_iters: int = 3000,
    confidence: float = 0.999
) -> Tuple[Optional[Transform], InlierMask]:
    """
    MAGSAC++ (USAC_MAGSAC) robust transform estimation (File 1 §3.7).
    """
    n = len(src_pts)
    inlier_mask = np.zeros(n, dtype=bool)

    if n < 4:
        return None, inlier_mask

    usac_flag = getattr(cv2, "USAC_MAGSAC", cv2.RANSAC)

    if model_type == "affine":
        matrix, inliers = cv2.estimateAffine2D(
            src_pts,
            ref_pts,
            method=cv2.RANSAC,
            ransacReprojThreshold=reproj_threshold,
            maxIters=max_iters,
            confidence=confidence
        )
    elif model_type == "similarity":
        matrix, inliers = cv2.estimateAffinePartial2D(
            src_pts,
            ref_pts,
            method=cv2.RANSAC,
            ransacReprojThreshold=reproj_threshold,
            maxIters=max_iters,
            confidence=confidence
        )
    else:  # homography
        matrix, inliers = cv2.findHomography(
            src_pts,
            ref_pts,
            method=usac_flag,
            ransacReprojThreshold=reproj_threshold,
            maxIters=max_iters,
            confidence=confidence
        )

    if matrix is None or inliers is None:
        return None, inlier_mask

    inlier_mask = inliers.ravel().astype(bool)
    tf = Transform(type=model_type, matrix=matrix, params={"reproj_threshold": reproj_threshold, "estimator": "magsac"})
    return tf, inlier_mask
