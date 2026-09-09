from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import numpy as np
import cv2

class TransformModel(ABC):
    """
    Abstract interface for geometric transform models (File 1 §3.8).
    Exposes .fit(src_pts, ref_pts), .apply(pts), .inverse()
    """
    @abstractmethod
    def fit(self, src_pts: np.ndarray, ref_pts: np.ndarray) -> bool:
        pass

    @abstractmethod
    def apply(self, pts: np.ndarray) -> np.ndarray:
        pass

    @abstractmethod
    def inverse(self) -> Optional["TransformModel"]:
        pass

    @property
    @abstractmethod
    def matrix(self) -> Optional[np.ndarray]:
        pass

class AffineModel(TransformModel):
    def __init__(self, matrix: Optional[np.ndarray] = None):
        self._matrix = matrix  # 2x3

    @property
    def matrix(self) -> Optional[np.ndarray]:
        return self._matrix

    def fit(self, src_pts: np.ndarray, ref_pts: np.ndarray) -> bool:
        if len(src_pts) < 3:
            return False
        M, _ = cv2.estimateAffine2D(src_pts, ref_pts)
        if M is not None:
            self._matrix = M
            return True
        return False

    def apply(self, pts: np.ndarray) -> np.ndarray:
        if len(pts) == 0 or self._matrix is None:
            return np.empty((0, 2), dtype=np.float32)
        homo = np.hstack([pts, np.ones((len(pts), 1), dtype=np.float32)])
        return (self._matrix @ homo.T).T.astype(np.float32)

    def inverse(self) -> Optional["AffineModel"]:
        if self._matrix is None:
            return None
        M_homo = np.vstack([self._matrix, [0, 0, 1]])
        try:
            inv = np.linalg.inv(M_homo)[:2, :]
            return AffineModel(inv)
        except np.linalg.LinAlgError:
            return None

class HomographyModel(TransformModel):
    def __init__(self, matrix: Optional[np.ndarray] = None):
        self._matrix = matrix  # 3x3

    @property
    def matrix(self) -> Optional[np.ndarray]:
        return self._matrix

    def fit(self, src_pts: np.ndarray, ref_pts: np.ndarray) -> bool:
        if len(src_pts) < 4:
            return False
        H, _ = cv2.findHomography(src_pts, ref_pts, cv2.RANSAC)
        if H is not None:
            self._matrix = H
            return True
        return False

    def apply(self, pts: np.ndarray) -> np.ndarray:
        if len(pts) == 0 or self._matrix is None:
            return np.empty((0, 2), dtype=np.float32)
        homo = np.hstack([pts, np.ones((len(pts), 1), dtype=np.float32)])
        projected = (self._matrix @ homo.T).T
        w = projected[:, 2:3]
        w[np.abs(w) < 1e-7] = 1e-7
        return (projected[:, :2] / w).astype(np.float32)

    def inverse(self) -> Optional["HomographyModel"]:
        if self._matrix is None:
            return None
        try:
            inv = np.linalg.inv(self._matrix)
            inv = inv / (inv[2, 2] if inv[2, 2] != 0 else 1.0)
            return HomographyModel(inv)
        except np.linalg.LinAlgError:
            return None

class SimilarityModel(TransformModel):
    def __init__(self, matrix: Optional[np.ndarray] = None):
        self._matrix = matrix  # 2x3

    @property
    def matrix(self) -> Optional[np.ndarray]:
        return self._matrix

    def fit(self, src_pts: np.ndarray, ref_pts: np.ndarray) -> bool:
        if len(src_pts) < 2:
            return False
        M, _ = cv2.estimateAffinePartial2D(src_pts, ref_pts)
        if M is not None:
            self._matrix = M
            return True
        return False

    def apply(self, pts: np.ndarray) -> np.ndarray:
        if len(pts) == 0 or self._matrix is None:
            return np.empty((0, 2), dtype=np.float32)
        homo = np.hstack([pts, np.ones((len(pts), 1), dtype=np.float32)])
        return (self._matrix @ homo.T).T.astype(np.float32)

    def inverse(self) -> Optional["SimilarityModel"]:
        if self._matrix is None:
            return None
        M_homo = np.vstack([self._matrix, [0, 0, 1]])
        try:
            inv = np.linalg.inv(M_homo)[:2, :]
            return SimilarityModel(inv)
        except np.linalg.LinAlgError:
            return None
