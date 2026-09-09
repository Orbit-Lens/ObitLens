import numpy as np
from app.algorithms.types import Keypoints, Scores

def anms(
    keypoints: Keypoints,
    scores: Scores,
    num_to_keep: int,
    robustness_ratio: float = 0.9
) -> np.ndarray:
    """
    Adaptive Non-Maximum Suppression (File 1 §3.9).
    Sorts by score, finds distance to the nearest point with a significantly higher score,
    and retains the top-N points with largest suppression radius.
    """
    n = len(keypoints)
    if n <= num_to_keep:
        return np.arange(n, dtype=np.int32)

    # Sort descending by score
    order = np.argsort(-scores)
    sorted_pts = keypoints[order]

    radii = np.full(n, np.inf, dtype=np.float32)

    for i in range(1, n):
        # Points from 0 to i-1 have higher or equal score
        stronger_pts = sorted_pts[:i]
        diffs = stronger_pts - sorted_pts[i]
        dists = np.sum(diffs**2, axis=1)
        radii[i] = np.min(dists)

    # Pick top num_to_keep with largest suppression radii
    top_order = np.argsort(-radii)[:num_to_keep]
    selected_orig_indices = order[top_order]
    return np.sort(selected_orig_indices).astype(np.int32)

def spatial_nms(keypoints: Keypoints, scores: Scores, radius: float = 15.0) -> np.ndarray:
    """
    Greedy radius-based non-maximum suppression.
    """
    n = len(keypoints)
    if n == 0:
        return np.empty(0, dtype=np.int32)

    order = np.argsort(-scores)
    keep = []
    suppressed = np.zeros(n, dtype=bool)

    r2 = radius * radius
    for idx in order:
        if suppressed[idx]:
            continue
        keep.append(idx)
        diffs = keypoints - keypoints[idx]
        dists = np.sum(diffs**2, axis=1)
        suppressed |= (dists < r2)

    return np.sort(np.array(keep, dtype=np.int32))

def farthest_point_sampling(keypoints: Keypoints, num_to_keep: int) -> np.ndarray:
    """
    Greedy Farthest Point Sampling for maximal spatial spread.
    """
    n = len(keypoints)
    if n <= num_to_keep:
        return np.arange(n, dtype=np.int32)

    selected = [0]
    dists = np.sum((keypoints - keypoints[0])**2, axis=1)

    for _ in range(1, num_to_keep):
        farthest_idx = int(np.argmax(dists))
        selected.append(farthest_idx)
        new_dists = np.sum((keypoints - keypoints[farthest_idx])**2, axis=1)
        dists = np.minimum(dists, new_dists)

    return np.sort(np.array(selected, dtype=np.int32))
