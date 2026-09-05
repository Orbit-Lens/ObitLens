"""
processing-service/app/pipeline/coverage.py
Grid-based uniform match-point distribution enforcement.
Blueprint §5 Stage 7 — grid-based non-maximum suppression so inliers
are spread across the overlap region, not clustered.
"""
from __future__ import annotations

import logging

import numpy as np

from app.pipeline.geometry import GeometryResult

logger = logging.getLogger(__name__)


def enforce_coverage(
    geometry: GeometryResult,
    image_width: int,
    image_height: int,
    n_cells: int = 64,
    max_per_cell: int | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, float]:
    """
    Partition the image into an NxN grid and cap the number of inliers
    per cell, retaining the highest-confidence match in each cell.
    Blueprint §5 — grid-based uniform-distribution enforcement.

    Args:
        geometry:     GeometryResult from estimate_transform().
        image_width:  Width of the reference image (for grid partitioning).
        image_height: Height of the reference image.
        n_cells:      Number of grid cells along each axis (total = n_cells^2).
        max_per_cell: Maximum inliers per cell. Defaults to 1 (strict uniform).

    Returns:
        (covered_src_pts, covered_ref_pts, per_cell_counts, coverage_score)
        coverage_score = fraction of non-empty cells in [0, 1].
    """
    if max_per_cell is None:
        max_per_cell = 1  # One best match per cell by default

    src_pts = geometry.inlier_src_pts
    ref_pts = geometry.inlier_ref_pts

    if len(src_pts) == 0:
        return (
            np.empty((0, 2), dtype=np.float32),
            np.empty((0, 2), dtype=np.float32),
            np.zeros((n_cells, n_cells), dtype=int),
            0.0,
        )

    cell_w = image_width / n_cells
    cell_h = image_height / n_cells

    # Assign each ref_pt to a grid cell
    cell_col = np.clip((ref_pts[:, 0] / cell_w).astype(int), 0, n_cells - 1)
    cell_row = np.clip((ref_pts[:, 1] / cell_h).astype(int), 0, n_cells - 1)
    cell_ids = cell_row * n_cells + cell_col  # flat cell index

    # Score for ranking within each cell — use geometric residual if available,
    # else use index order (all equally weighted)
    residuals = _compute_residuals(geometry)
    scores = 1.0 / (residuals + 1e-6)  # higher = better

    # Select best matches per cell
    selected: list[int] = []
    per_cell_counts = np.zeros((n_cells, n_cells), dtype=int)

    unique_cells = np.unique(cell_ids)
    for cell_id in unique_cells:
        mask = cell_ids == cell_id
        indices = np.where(mask)[0]
        # Sort by score descending, keep top max_per_cell
        ranked = sorted(indices, key=lambda i: scores[i], reverse=True)[:max_per_cell]
        selected.extend(ranked)
        row, col = divmod(int(cell_id), n_cells)
        per_cell_counts[row, col] = len(ranked)

    selected_arr = np.array(selected, dtype=int)
    covered_src = src_pts[selected_arr]
    covered_ref = ref_pts[selected_arr]

    non_empty = (per_cell_counts > 0).sum()
    coverage_score = float(non_empty) / (n_cells * n_cells)

    logger.info(
        "Coverage: %d / %d cells occupied (score=%.3f), %d inliers retained",
        non_empty, n_cells * n_cells, coverage_score, len(selected_arr),
    )

    return covered_src, covered_ref, per_cell_counts, coverage_score


def _compute_residuals(geometry: GeometryResult) -> np.ndarray:
    """
    Compute per-inlier reprojection error as a proxy quality score.
    """
    src = geometry.inlier_src_pts
    ref = geometry.inlier_ref_pts
    T = geometry.transform_matrix

    if len(src) == 0:
        return np.empty(0, dtype=np.float32)

    if geometry.transform_model == "homography":
        # Project src through homography, compare to ref
        src_h = np.hstack([src, np.ones((len(src), 1))])
        proj = (T @ src_h.T).T
        proj_xy = proj[:, :2] / proj[:, 2:3]
    else:
        # Affine: [x', y'] = T[:, :2] @ [x, y]^T + T[:, 2]
        proj_xy = (T[:, :2] @ src.T).T + T[:, 2]

    residuals = np.linalg.norm(proj_xy - ref, axis=1).astype(np.float32)
    return residuals
