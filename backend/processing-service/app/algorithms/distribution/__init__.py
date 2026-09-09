import numpy as np
from typing import Tuple, Optional
from app.algorithms.types import Keypoints, InlierMask, Scores
from app.algorithms.distribution.grid_selection import grid_select
from app.algorithms.distribution.anms import anms, spatial_nms, farthest_point_sampling

def select_uniform_matches(
    kp_ref: Keypoints,
    inlier_mask: InlierMask,
    scores: Scores,
    image_shape: Tuple[int, int],
    grid: Tuple[int, int] = (8, 8),
    max_per_cell: int = 5,
    target_total: int = 200
) -> np.ndarray:
    """
    Uniform distribution selection over inliers (File 1 §3.9).
    Guarantees selected points are both geometrically valid inliers and spatially distributed.
    Returns:
      indices of selected matches (relative to full input matches array).
    """
    inlier_indices = np.where(inlier_mask)[0]
    if len(inlier_indices) == 0:
        return np.empty(0, dtype=np.int32)

    inlier_ref_pts = kp_ref[inlier_indices]
    inlier_scores = scores[inlier_indices] if scores is not None and len(scores) == len(inlier_mask) else np.ones(len(inlier_indices), dtype=np.float32)

    # 1. Grid selection (k points per cell)
    sub_selected = grid_select(
        keypoints=inlier_ref_pts,
        scores=inlier_scores,
        image_shape=image_shape,
        grid=grid,
        max_per_cell=max_per_cell
    )

    if len(sub_selected) > target_total:
        # 2. Prune excess with ANMS for smooth spatial spread
        anms_sub = anms(inlier_ref_pts[sub_selected], inlier_scores[sub_selected], target_total)
        sub_selected = sub_selected[anms_sub]

    return inlier_indices[sub_selected]
