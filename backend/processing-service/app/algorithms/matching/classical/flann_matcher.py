import cv2
import numpy as np
from typing import Tuple, List
from app.algorithms.types import FeatureSet, Matches, MatchScores
from app.algorithms.matching.base import Matcher

class FlannMatcher(Matcher):
    """
    FLANN Matcher supporting both floating-point (KDTree) and binary (LSH) descriptors.
    """
    def __init__(self, trees: int = 5, checks: int = 50, ratio_threshold: float = 0.75):
        self.trees = trees
        self.checks = checks
        self.ratio_threshold = ratio_threshold

    def match(self, feat_src: FeatureSet, feat_ref: FeatureSet) -> Tuple[Matches, MatchScores]:
        if len(feat_src) < 2 or len(feat_ref) < 2:
            return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

        desc_s = feat_src.descriptors
        desc_r = feat_ref.descriptors

        is_binary = (desc_s.dtype == np.uint8)

        if is_binary:
            index_params = dict(algorithm=6, table_number=6, key_size=12, multi_probe_level=1)
            search_params = dict(checks=self.checks)
        else:
            index_params = dict(algorithm=1, trees=self.trees)
            search_params = dict(checks=self.checks)

        try:
            flann = cv2.FlannBasedMatcher(index_params, search_params)
            raw_knn = flann.knnMatch(desc_s, desc_r, k=2)
        except Exception:
            # Fallback to BFMatcher
            norm = cv2.NORM_HAMMING if is_binary else cv2.NORM_L2
            bf = cv2.BFMatcher(norm)
            raw_knn = bf.knnMatch(desc_s, desc_r, k=2)

        pairs = []
        scores = []
        for pair in raw_knn:
            if len(pair) == 2:
                m, n = pair
                if m.distance < self.ratio_threshold * n.distance:
                    pairs.append([m.queryIdx, m.trainIdx])
                    conf = 1.0 - float(m.distance) / (float(n.distance) + 1e-7)
                    scores.append(conf)

        if not pairs:
            return np.empty((0, 2), dtype=np.int32), np.empty(0, dtype=np.float32)

        pairs_arr = np.array(pairs, dtype=np.int32)
        scores_arr = np.array(scores, dtype=np.float32)
        order = np.argsort(-scores_arr)
        return pairs_arr[order], scores_arr[order]
