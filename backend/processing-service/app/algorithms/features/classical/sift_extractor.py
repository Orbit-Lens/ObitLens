import cv2
import numpy as np
from typing import Optional
from app.algorithms.types import Image, FeatureSet
from app.algorithms.features.base import FeatureExtractor

class SIFTExtractor(FeatureExtractor):
    """
    SIFT Feature Extractor tuned for lunar imagery.
    """
    def __init__(
        self,
        n_features: int = 8000,
        contrast_threshold: float = 0.015,
        edge_threshold: float = 15.0,
        sigma: float = 1.6
    ):
        self.n_features = n_features
        self.contrast_threshold = contrast_threshold
        self.edge_threshold = edge_threshold
        self.sigma = sigma
        self._sift = cv2.SIFT_create(
            nfeatures=n_features,
            contrastThreshold=contrast_threshold,
            edgeThreshold=edge_threshold,
            sigma=sigma
        )

    def extract(self, image: Image, mask: Optional[Image] = None) -> FeatureSet:
        u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)
        u8_mask = (mask > 0).astype(np.uint8) if mask is not None else None

        kps, descs = self._sift.detectAndCompute(u8, u8_mask)

        if kps is None or len(kps) == 0 or descs is None:
            return FeatureSet(
                keypoints=np.empty((0, 2), dtype=np.float32),
                descriptors=np.empty((0, 128), dtype=np.float32),
                scores=np.empty(0, dtype=np.float32)
            )

        pts = np.float32([kp.pt for kp in kps])
        scores = np.float32([kp.response for kp in kps])

        return FeatureSet(
            keypoints=pts,
            descriptors=descs.astype(np.float32),
            scores=scores
        )
