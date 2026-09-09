import numpy as np
from typing import Tuple, Dict, Any, Optional
from app.algorithms.types import Keypoints, InlierMask, Transform, EvaluationReport
from app.algorithms.pipeline.config import EvaluationThresholds
from app.algorithms.evaluation.metrics import (
    compute_rmse,
    compute_reprojection_residuals,
    compute_spatial_coverage,
    compute_confidence_score,
    check_registration_success,
)

def build_report(
    src_pts_inliers: Keypoints,
    ref_pts_inliers: Keypoints,
    inlier_mask: InlierMask,
    total_candidates: int,
    transform: Optional[Transform],
    image_shape: Tuple[int, int],
    thresholds: EvaluationThresholds,
    scale_ratio: Optional[float] = None,
    overlap_fraction: float = 1.0,
    grid_size: Tuple[int, int] = (8, 8)
) -> EvaluationReport:
    """
    Assembles the standard EvaluationReport object defined in File 1 §2.
    """
    inliers_count = int(np.count_nonzero(inlier_mask))
    inlier_ratio_val = float(inliers_count) / float(total_candidates) if total_candidates > 0 else 0.0

    if transform is None or inliers_count == 0:
        return EvaluationReport(
            rmse=999.0,
            inlier_count=inliers_count,
            inlier_ratio=inlier_ratio_val,
            reprojection_error_mean=999.0,
            reprojection_error_per_point=np.empty(0, dtype=np.float32),
            spatial_coverage=0.0,
            confidence_score=0.0,
            registration_success=False,
            grid_occupancy=np.zeros(grid_size, dtype=np.int32),
            raw_active_cell_fraction=0.0,
            thresholds_applied={"failure": "No valid transform or zero inliers"}
        )

    mean_err, per_point = compute_reprojection_residuals(src_pts_inliers, ref_pts_inliers, transform)
    rmse_val = compute_rmse(src_pts_inliers, ref_pts_inliers, transform)

    entropy_cov, raw_frac, grid_counts = compute_spatial_coverage(
        selected_points=ref_pts_inliers,
        image_shape=image_shape,
        grid=grid_size
    )

    conf_score = compute_confidence_score(
        rmse=rmse_val,
        inlier_ratio=inlier_ratio_val,
        spatial_coverage=entropy_cov,
        weights=thresholds.confidence_weights
    )

    success, status = check_registration_success(
        rmse=rmse_val,
        inlier_count=inliers_count,
        inlier_ratio=inlier_ratio_val,
        spatial_coverage=entropy_cov,
        thresholds=thresholds,
        scale_ratio=scale_ratio,
        overlap_fraction=overlap_fraction
    )

    return EvaluationReport(
        rmse=round(rmse_val, 4),
        inlier_count=inliers_count,
        inlier_ratio=round(inlier_ratio_val, 4),
        reprojection_error_mean=round(mean_err, 4),
        reprojection_error_per_point=per_point,
        spatial_coverage=round(entropy_cov, 4),
        confidence_score=round(conf_score, 4),
        registration_success=success,
        grid_occupancy=grid_counts,
        raw_active_cell_fraction=round(raw_frac, 4),
        thresholds_applied=status
    )
