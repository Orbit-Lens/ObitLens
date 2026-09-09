import cv2
import numpy as np
from typing import Tuple
from app.algorithms.types import FeatureSet, Matches, MatchScores
from app.algorithms.matching.base import Matcher

class BFMatcher(Matcher):
    """
    Brute-Force Matcher with automatic norm selection based on descriptor dtype.
    """
    def __init__(self, cross_check: bool = False):
        self.cross_check = cross_check

    def match(self, feat_src: FeatureSet, feat_ref: FeatureSet) -> Tuple[Matches, MatchScores]:
        if len(feat_src) == 0 or len(feat_ref) == 0:
            return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

        desc_s = feat_src.descriptors
        desc_r = feat_ref.descriptors

        is_binary = (desc_s.dtype == np.uint8)
        norm_type = cv2.NORM_HAMMING if is_binary else cv2.NORM_L2

        matcher = cv2.BFMatcher(norm_type, crossCheck=self.cross_check)

        if self.cross_check:
            raw_matches = matcher.match(desc_s, desc_r)
            if not raw_matches:
                return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

            pairs = np.array([[m.queryIdx, m.trainIdx] for m in raw_matches], dtype=np.int32)
            dists = np.array([m.distance for m in raw_matches], dtype=np.float32)
            # Higher score = lower distance
            max_d = float(np.max(dists)) if len(dists) > 0 and float(np.max(dists)) > 0 else 1.0
            scores = 1.0 - (dists / max_d)
            order = np.argsort(-scores)
            return pairs[order], scores[order]
        else:
            # knn match k=2
            if len(desc_s) < 2 or len(desc_r) < 2:
                return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

            raw_knn = matcher.knnMatch(desc_s, desc_r, k=2)
            pairs = []
            scores = []
            for pair in raw_knn:
                if len(pair) == 2:
                    m, n = pair
                    pairs.append([m.queryIdx, m.trainIdx])
                    # Ratio-based confidence: 1.0 - (m.distance / (n.distance + 1e-6))
                    conf = 1.0 - (m.distance / (n.distance + 1e-6))
                    scores.append(conf)

            if not pairs:
                return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

            pairs_arr = np.array(pairs, dtype=np.int32)
            scores_arr = np.array(scores, dtype=np.float32)
            order = np.argsort(-scores_arr)
            return pairs_arr[order], scores_arr[order]
