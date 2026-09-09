import numpy as np
from typing import Tuple, List, Dict, Optional
from app.algorithms.types import Keypoints, Scores

def grid_select(
    keypoints: Keypoints,
    scores: Scores,
    image_shape: Tuple[int, int],
    grid: Tuple[int, int] = (8, 8),
    max_per_cell: Optional[int] = 5
) -> np.ndarray:
    """
    Uniform grid selection (File 1 §3.9, ALGORITHM_NOTES §4).
    Bins keypoints into an NxN grid (default 8x8 = 64 cells).
    Keeps top-k points per cell (default k=5).
    Returns array of selected indices.
    """
    n = len(keypoints)
    if n == 0:
        return np.empty(0, dtype=np.int32)

    h, w = image_shape[:2]
    gx, gy = grid
    cell_w = max(1.0, float(w) / float(gx))
    cell_h = max(1.0, float(h) / float(gy))

    bins: Dict[Tuple[int, int], List[int]] = {}
    for i in range(n):
        x, y = keypoints[i]
        cx = int(min(gx - 1, max(0, int(x / cell_w))))
        cy = int(min(gy - 1, max(0, int(y / cell_h))))
        cell = (cx, cy)
        if cell not in bins:
            bins[cell] = []
        bins[cell].append(i)

    selected: List[int] = []
    for cell, indices in bins.items():
        # Sort by score descending (or lowest residual if residual was passed as score)
        if scores is not None and len(scores) == n:
            sorted_idx = sorted(indices, key=lambda idx: scores[idx], reverse=True)
        else:
            sorted_idx = indices

        if max_per_cell is not None and max_per_cell > 0:
            selected.extend(sorted_idx[:max_per_cell])
        else:
            selected.extend(sorted_idx)

    return np.array(sorted(selected), dtype=np.int32)
