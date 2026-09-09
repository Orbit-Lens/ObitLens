from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Tuple, Union
import numpy as np

# Image representations
Image = np.ndarray  # HxW (grayscale) or HxWx3/4, dtype float32 (internal) or uint8/uint16
Keypoints = np.ndarray  # Nx2 float32, (x, y)
Descriptors = np.ndarray  # NxD float32 or uint8
Scores = np.ndarray  # N float32
Matches = np.ndarray  # Mx2 int32 (idx_in_src, idx_in_ref)
MatchScores = np.ndarray  # M float32
InlierMask = np.ndarray  # M bool

@dataclass
class ImageMeta:
    path: str
    driver: str = "opencv"  # "gdal" | "pillow" | "opencv" | "pds4"
    crs: Optional[str] = None
    geotransform: Optional[Tuple[float, ...]] = None
    sun_azimuth: Optional[float] = None
    sun_elevation: Optional[float] = None
    resolution_mpp: Optional[float] = None  # meters per pixel
    bit_depth: int = 8
    instrument: Optional[str] = None
    extra: Dict[str, Any] = field(default_factory=dict)

@dataclass
class FeatureSet:
    keypoints: Keypoints  # Nx2 float32
    descriptors: Descriptors  # NxD float32 or uint8
    scores: Scores  # N float32
    scale_level: int = 0  # pyramid level

    def __len__(self) -> int:
        return len(self.keypoints)

@dataclass
class Transform:
    type: str  # "translation" | "similarity" | "affine" | "homography" | "piecewise_affine" | "tps"
    matrix: np.ndarray  # 2x3 or 3x3
    params: Dict[str, Any] = field(default_factory=dict)

@dataclass
class EvaluationReport:
    rmse: float
    inlier_count: int
    inlier_ratio: float
    reprojection_error_mean: float
    reprojection_error_per_point: np.ndarray
    spatial_coverage: float  # 0.0 to 1.0 (entropy-normalized)
    confidence_score: float  # 0.0 to 1.0
    registration_success: bool
    grid_occupancy: np.ndarray  # 8x8 bool/count grid
    raw_active_cell_fraction: float = 0.0
    thresholds_applied: Dict[str, Any] = field(default_factory=dict)
    debug_metrics: Dict[str, Any] = field(default_factory=dict)

@dataclass
class RegistrationResult:
    registered_image: Optional[Image]
    match_points_src: Keypoints
    match_points_ref: Keypoints
    match_points_ref_refined: Optional[Keypoints]
    inlier_mask: InlierMask
    transform: Optional[Transform]
    evaluation_report: EvaluationReport
    failure_reason: Optional[str] = None
    debug: Dict[str, Any] = field(default_factory=dict)
