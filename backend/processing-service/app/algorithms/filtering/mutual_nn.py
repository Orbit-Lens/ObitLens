import numpy as np
from typing import Tuple
from app.algorithms.types import Descriptors, Matches, MatchScores

def mutual_nearest_neighbor(
    desc_src: Descriptors,
    desc_ref: Descriptors,
    max_count: int = 5000
) -> Tuple[Matches, MatchScores]:
    """
    Mutual nearest neighbor check via vectorized distance matrix.
    Guarded with max_count threshold to avoid O(N^2) memory explosion.
    """
    n_s, n_r = len(desc_src), len(desc_ref)
    if n_s == 0 or n_r == 0:
        return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

    if n_s > max_count or n_r > max_count:
        # Skip full matrix for large sets
        return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

    # Compute pairwise L2 squared distances
    s = desc_src.astype(np.float32)
    r = desc_ref.astype(np.float32)

    # (s - r)^2 = s^2 - 2*s*r^T + r^2
    s2 = np.sum(s**2, axis=1, keepdims=True)
    r2 = np.sum(r**2, axis=1, keepdims=True).T
    dists = np.maximum(0.0, s2 - 2.0 * np.dot(s, r.T) + r2)

    nn_src = np.argmin(dists, axis=1)  # best match in ref for each src
    nn_ref = np.argmin(dists, axis=0)  # best match in src for each ref

    mutual_s = []
    mutual_r = []
    scores = []

    for i in range(n_s):
        target_r = nn_src[i]
        if nn_ref[target_r] == i:
            mutual_s.append(i)
            mutual_r.append(target_r)
            d = np.sqrt(dists[i, target_r])
            scores.append(1.0 / (1.0 + d))

    if not mutual_s:
        return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

    matches = np.column_stack([mutual_s, mutual_r]).astype(np.int32)
    sc = np.array(scores, dtype=np.float32)
    order = np.argsort(-sc)
    return matches[order], sc[order]
