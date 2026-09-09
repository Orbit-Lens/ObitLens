import numpy as np
from typing import Tuple
from app.algorithms.types import Matches, MatchScores

def cross_check_filter(
    matches_src_to_ref: Matches,
    matches_ref_to_src: Matches,
    scores_src_to_ref: MatchScores
) -> Tuple[Matches, MatchScores]:
    """
    Keeps only mutually-best correspondences between forward and backward matching.
    """
    if len(matches_src_to_ref) == 0 or len(matches_ref_to_src) == 0:
        return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

    bwd_dict = {m[0]: m[1] for m in matches_ref_to_src}

    mutual_indices = []
    for idx, (s, r) in enumerate(matches_src_to_ref):
        if bwd_dict.get(r) == s:
            mutual_indices.append(idx)

    if not mutual_indices:
        return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

    return matches_src_to_ref[mutual_indices], scores_src_to_ref[mutual_indices]
