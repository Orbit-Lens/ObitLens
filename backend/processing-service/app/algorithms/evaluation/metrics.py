import numpy as np
from typing import Tuple, Dict, Any, Optional
from app.algorithms.types import Keypoints, InlierMask, Transform
from app.algorithms.pipeline.config import EvaluationThresholds

def compute_reprojection_residuals(
    src_pts: Keypoints,
    ref_pts: Keypoints,
    transform: Transform
) -> Tuple[float, np.ndarray]:
    """
    Computes Euclidean reprojection error per point and mean error.
    """
    if len(src_pts) == 0 or transform.matrix is None:
        return 999.0, np.empty(0, dtype=np.float32)

    matrix = transform.matrix
    tf_type = transform.type.lower()
    homo = np.hstack([src_pts, np.ones((len(src_pts), 1), dtype=np.float32)])

    if tf_type in ("affine", "similarity") or matrix.shape == (2, 3):
        projected = (matrix[:2, :] @ homo.T).T
    else:
        proj = (matrix @ homo.T).T
        w = proj[:, 2:3]
        w[np.abs(w) < 1e-7] = 1e-7
        projected = proj[:, :2] / w

    diff = projected - ref_pts
    residuals = np.sqrt(np.sum(diff**2, axis=1)).astype(np.float32)
    mean_err = float(np.mean(residuals)) if len(residuals) > 0 else 999.0

    return mean_err, residuals

def compute_rmse(
    src_pts: Keypoints,
    ref_pts: Keypoints,
    transform: Transform
) -> float:
    """
    Root Mean Square Error (RMSE) per ALGORITHM_NOTES §5 and File 2 §3.
      RMSE = sqrt( (1/M) * sum || T(p_j) - q_j ||^2 )
    """
    _, residuals = compute_reprojection_residuals(src_pts, ref_pts, transform)
    if len(residuals) == 0:
        return 999.0
    return float(np.sqrt(np.mean(residuals**2)))

def compute_spatial_coverage(
    selected_points: Keypoints,
    image_shape: Tuple[int, int],
    grid: Tuple[int, int] = (8, 8)
) -> Tuple[float, float, np.ndarray]:
    """
    Computes spatial coverage (File 1 §3.12, File 2 §3).
    Returns:
      (entropy_normalized_score: float, raw_active_cell_fraction: float, grid_counts: np.ndarray)
    Entropy-normalized score rewards even spread across cells rather than pile-ups in a few cells.
    """
    n = len(selected_points)
    gx, gy = grid
    total_cells = gx * gy
    counts = np.zeros(grid, dtype=np.int32)

    if n == 0:
        return 0.0, 0.0, counts

    h, w = image_shape[:2]
    cell_w = max(1.0, float(w) / float(gx))
    cell_h = max(1.0, float(h) / float(gy))

    for pt in selected_points:
        cx = int(min(gx - 1, max(0, int(pt[0] / cell_w))))
        cy = int(min(gy - 1, max(0, int(pt[1] / cell_h))))
        counts[cy, cx] += 1

    active_cells = int(np.count_nonzero(counts))
    raw_fraction = float(active_cells) / float(total_cells)

    # Entropy-normalized coverage:
    # H = - sum( p_i * log2(p_i) ) / log2(total_cells)
    p = counts.flatten().astype(np.float64) / float(n)
    nonzero_p = p[p > 0]
    entropy = -np.sum(nonzero_p * np.log2(nonzero_p))
    max_entropy = np.log2(total_cells)
    norm_entropy = float(entropy / max_entropy) if max_entropy > 0 else 0.0

    return norm_entropy, raw_fraction, counts

def compute_confidence_score(
    rmse: float,
    inlier_ratio: float,
    spatial_coverage: float,
    weights: Tuple[float, float, float] = (0.4, 0.4, 0.2)
) -> float:
    """
    Weighted confidence score in [0, 1] per File 1 §3.12.
    """
    w_rmse, w_ratio, w_cov = weights
    # RMSE score: 1.0 at 0.0px, 0.0 at >= 3.0px
    rmse_score = max(0.0, min(1.0, 1.0 - (rmse / 3.0)))
    ratio_score = max(0.0, min(1.0, inlier_ratio))
    cov_score = max(0.0, min(1.0, spatial_coverage))

    confidence = (w_rmse * rmse_score) + (w_ratio * ratio_score) + (w_cov * cov_score)
    return float(np.clip(confidence, 0.0, 1.0))

def check_registration_success(
    rmse: float,
    inlier_count: int,
    inlier_ratio: float,
    spatial_coverage: float,
    thresholds: EvaluationThresholds,
    scale_ratio: Optional[float] = None,
    overlap_fraction: float = 1.0
) -> Tuple[bool, Dict[str, Any]]:
    """
    Evaluates registration success per reconciled targets (File 2 §3):
      - RMSE <= 0.5px (or <= 1.0px if scale_ratio > 50:1)
      - Inliers >= 100 (scaled proportionally if overlap_fraction < 15%)
      - Inlier ratio >= 75%
      - Spatial coverage >= 75% (entropy-normalized)
    """
    rmse_target = thresholds.get_rmse_threshold(scale_ratio)
    min_inliers_target = thresholds.get_expected_min_inliers(overlap_fraction)

    rmse_ok = (rmse <= rmse_target)
    inliers_ok = (inlier_count >= min_inliers_target)
    ratio_ok = (inlier_ratio >= thresholds.min_inlier_ratio)
    coverage_ok = (spatial_coverage >= thresholds.min_spatial_coverage)

    success = (rmse_ok and inliers_ok and ratio_ok and coverage_ok)

    status = {
        "rmse_ok": bool(rmse_ok),
        "inliers_ok": bool(inliers_ok),
        "ratio_ok": bool(ratio_ok),
        "coverage_ok": bool(coverage_ok),
        "rmse_target": rmse_target,
        "min_inliers_target": min_inliers_target,
        "min_ratio_target": thresholds.min_inlier_ratio,
        "min_coverage_target": thresholds.min_spatial_coverage,
    }

    return bool(success), status
