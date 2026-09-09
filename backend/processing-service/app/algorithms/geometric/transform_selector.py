import numpy as np
from typing import Dict, Any

def select_transform_model(
    inlier_count: int,
    homography_matrix: np.ndarray,
    residual_homography: float,
    residual_affine: float
) -> str:
    """
    Selects transformation model (File 1 §3.8).
    Checks stability, condition number, and residuals.
    """
    if inlier_count < 8:
        return "similarity"

    if homography_matrix is not None:
        # Check condition number to detect near-singular/degenerate homography
        try:
            cond = np.linalg.cond(homography_matrix)
            if cond > 1e6 or np.isnan(cond):
                return "affine"
        except np.linalg.LinAlgError:
            return "affine"

        # Check projective distortion magnitude
        h31, h32 = abs(homography_matrix[2, 0]), abs(homography_matrix[2, 1])
        if h31 > 0.005 or h32 > 0.005:
            # Extreme warping distortion -> safer with affine
            return "affine"

        if inlier_count >= 15 and residual_homography <= residual_affine * 1.05:
            return "homography"

    return "affine"
