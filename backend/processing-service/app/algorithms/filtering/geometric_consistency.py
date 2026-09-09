import numpy as np
from typing import Tuple
from scipy.spatial import cKDTree
from app.algorithms.types import Keypoints, Matches, MatchScores

def geometric_consistency_filter(
    kp_src: Keypoints,
    kp_ref: Keypoints,
    matches: Matches,
    scores: MatchScores,
    neighborhood_k: int = 5,
    tolerance_px: float = 12.0
) -> Tuple[Matches, MatchScores]:
    """
    Local neighborhood geometric consistency filter (File 1 §3.6).
    Checks that each match's displacement agrees with its k nearest spatial neighbors' displacement.
    Acts as an ultra-fast pre-RANSAC outlier filter.
    """
    if len(matches) <= neighborhood_k:
        return matches, scores

    pts_s = kp_src[matches[:, 0]]
    pts_r = kp_ref[matches[:, 1]]

    # Displacements
    displacements = pts_r - pts_s

    # Build KD-tree on source points
    tree = cKDTree(pts_s)
    k = min(neighborhood_k + 1, len(matches))
    _, nn_indices = tree.query(pts_s, k=k)

    consistent_mask = np.zeros(len(matches), dtype=bool)

    for i in range(len(matches)):
        neighbor_idxs = nn_indices[i][1:]  # skip self
        neighbor_displacements = displacements[neighbor_idxs]
        my_displacement = displacements[i]

        diffs = np.linalg.norm(neighbor_displacements - my_displacement, axis=1)
        # Point is consistent if at least half of its neighbors have similar displacement
        if np.sum(diffs < tolerance_px) >= (len(neighbor_idxs) // 2):
            consistent_mask[i] = True

    if not np.any(consistent_mask):
        # Fallback to original if filtering is too aggressive
        return matches, scores

    return matches[consistent_mask], scores[consistent_mask]
