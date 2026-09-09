from abc import ABC, abstractmethod
from typing import Optional
from app.algorithms.types import Image, FeatureSet

class FeatureExtractor(ABC):
    """
    Abstract interface for all feature extractors (File 1 §3.4).
    Enforces contract: extract(image, mask) -> FeatureSet
    """
    @abstractmethod
    def extract(self, image: Image, mask: Optional[Image] = None) -> FeatureSet:
        """
        Extracts keypoints, descriptors, and scores from input image.
        Returns FeatureSet containing Nx2 keypoints, NxD descriptors, and N scores.
        """
        pass
