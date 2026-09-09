import numpy as np
from typing import List, Tuple
import cv2
from app.algorithms.types import Matches, MatchScores

def lowes_ratio_test(
    knn_matches: List[List[cv2.DMatch]],
    ratio: float = 0.75
) -> Tuple[Matches, MatchScores]:
    """
    Applies Lowe's ratio test on k=2 nearest neighbor matches.
    """
    good_pairs = []
    good_scores = []
    for pair in knn_matches:
        if len(pair) == 2:
            m, n = pair
            if m.distance < ratio * n.distance:
                good_pairs.append([m.queryIdx, m.trainIdx])
                conf = 1.0 - (m.distance / (n.distance + 1e-7))
                good_scores.append(conf)

    if not good_pairs:
        return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

    p_arr = np.array(good_pairs, dtype=np.int32)
    s_arr = np.array(good_scores, dtype=np.float32)
    order = np.argsort(-s_arr)
    return p_arr[order], s_arr[order]
