import cv2
import numpy as np
from typing import Tuple, Optional
from app.algorithms.types import Keypoints, InlierMask, Transform
from app.algorithms.geometric.transform_models import HomographyModel, AffineModel, SimilarityModel

def estimate_ransac(
    src_pts: Keypoints,
    ref_pts: Keypoints,
    model_type: str = "homography",
    reproj_threshold: float = 3.0,
    max_iters: int = 2000,
    confidence: float = 0.99
) -> Tuple[Optional[Transform], InlierMask]:
    """
    RANSAC transform estimation (File 1 §3.7).
    Returns (Transform dataclass, boolean InlierMask aligned to input points).
    """
    n = len(src_pts)
    inlier_mask = np.zeros(n, dtype=bool)

    if n < 4:
        return None, inlier_mask

    matrix = None
    inliers = None

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
            method=cv2.RANSAC,
            ransacReprojThreshold=reproj_threshold,
            maxIters=max_iters,
            confidence=confidence
        )

    if matrix is None or inliers is None:
        return None, inlier_mask

    inlier_mask = inliers.ravel().astype(bool)
    tf = Transform(type=model_type, matrix=matrix, params={"reproj_threshold": reproj_threshold})
    return tf, inlier_mask
