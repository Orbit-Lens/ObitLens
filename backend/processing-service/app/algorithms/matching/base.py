from abc import ABC, abstractmethod
from typing import Tuple
from app.algorithms.types import FeatureSet, Matches, MatchScores

class Matcher(ABC):
    """
    Abstract interface for matchers (File 1 §3.5).
    Enforces contract: match(feat_src, feat_ref) -> Tuple[Matches, MatchScores]
    Matches is Mx2 int32 (idx_in_src, idx_in_ref).
    MatchScores is M float32 (higher is better / confidence).
    """
    @abstractmethod
    def match(self, feat_src: FeatureSet, feat_ref: FeatureSet) -> Tuple[Matches, MatchScores]:
        pass
