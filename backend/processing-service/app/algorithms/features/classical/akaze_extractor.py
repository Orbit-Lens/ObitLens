import cv2
import numpy as np
from typing import Optional
from app.algorithms.types import Image, FeatureSet
from app.algorithms.features.base import FeatureExtractor

class AKAZEExtractor(FeatureExtractor):
    """
    AKAZE non-linear scale space feature extractor.
    Falls back gracefully if OpenCV build does not include AKAZE.
    """
    def __init__(self, threshold: float = 0.0008):
        self.threshold = threshold
        if hasattr(cv2, "AKAZE_create"):
            self._akaze = cv2.AKAZE_create(threshold=threshold)
        elif hasattr(cv2, "AKAZE") and hasattr(cv2.AKAZE, "create"):
            self._akaze = cv2.AKAZE.create(threshold=threshold)
        else:
            # Fallback to SIFT with fine contrast threshold
            self._akaze = cv2.SIFT_create(contrastThreshold=0.012)

    def extract(self, image: Image, mask: Optional[Image] = None) -> FeatureSet:
        u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)
        u8_mask = (mask > 0).astype(np.uint8) if mask is not None else None

        kps, descs = self._akaze.detectAndCompute(u8, u8_mask)

        if kps is None or len(kps) == 0 or descs is None:
            return FeatureSet(
                keypoints=np.empty((0, 2), dtype=np.float32),
                descriptors=np.empty((0, 64), dtype=np.uint8),
                scores=np.empty(0, dtype=np.float32)
            )

        pts = np.float32([kp.pt for kp in kps])
        scores = np.float32([kp.response for kp in kps])

        return FeatureSet(
            keypoints=pts,
            descriptors=descs.astype(np.uint8),
            scores=scores
        )

class ORBExtractor(FeatureExtractor):
    """
    ORB Fast binary feature extractor.
    """
    def __init__(self, n_features: int = 8000):
        self.n_features = n_features
        self._orb = cv2.ORB_create(nfeatures=n_features, scoreType=cv2.ORB_HARRIS_SCORE)

    def extract(self, image: Image, mask: Optional[Image] = None) -> FeatureSet:
        u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)
        u8_mask = (mask > 0).astype(np.uint8) if mask is not None else None

        kps, descs = self._orb.detectAndCompute(u8, u8_mask)

        if kps is None or len(kps) == 0 or descs is None:
            return FeatureSet(
                keypoints=np.empty((0, 2), dtype=np.float32),
                descriptors=np.empty((0, 32), dtype=np.uint8),
                scores=np.empty(0, dtype=np.float32)
            )

        pts = np.float32([kp.pt for kp in kps])
        scores = np.float32([kp.response for kp in kps])

        return FeatureSet(
            keypoints=pts,
            descriptors=descs.astype(np.uint8),
            scores=scores
        )

class BRISKExtractor(FeatureExtractor):
    """
    BRISK binary scale-space extractor.
    Falls back gracefully to ORB if BRISK is not built into OpenCV.
    """
    def __init__(self, thresh: int = 30, octaves: int = 3):
        if hasattr(cv2, "BRISK_create"):
            self._brisk = cv2.BRISK_create(thresh=thresh, octaves=octaves)
        elif hasattr(cv2, "BRISK") and hasattr(cv2.BRISK, "create"):
            self._brisk = cv2.BRISK.create(thresh=thresh, octaves=octaves)
        else:
            self._brisk = cv2.ORB_create()

    def extract(self, image: Image, mask: Optional[Image] = None) -> FeatureSet:
        u8 = (np.clip(image, 0.0, 1.0) * 255.0).astype(np.uint8)
        u8_mask = (mask > 0).astype(np.uint8) if mask is not None else None

        kps, descs = self._brisk.detectAndCompute(u8, u8_mask)

        if kps is None or len(kps) == 0 or descs is None:
            return FeatureSet(
                keypoints=np.empty((0, 2), dtype=np.float32),
                descriptors=np.empty((0, 64), dtype=np.uint8),
                scores=np.empty(0, dtype=np.float32)
            )

        pts = np.float32([kp.pt for kp in kps])
        scores = np.float32([kp.response for kp in kps])

        return FeatureSet(
            keypoints=pts,
            descriptors=descs.astype(np.uint8),
            scores=scores
        )
