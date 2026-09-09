from dataclasses import dataclass, field
from typing import Tuple, Dict, Any, Optional

@dataclass
class PreprocessingConfig:
    denoise_method: str = "bilateral"  # "bilateral" | "gaussian" | "median" | "none"
    denoise_d: int = 5
    denoise_sigma_color: float = 35.0
    denoise_sigma_space: float = 35.0
    normalize_intensity_method: str = "minmax"  # "minmax" | "zscore"
    clahe_clip_limit: float = 2.5
    clahe_tile_grid_size: Tuple[int, int] = (8, 8)

@dataclass
class IlluminationConfig:
    enabled: bool = True
    method: str = "retinex"  # "retinex" | "gradient" | "clahe_only" | "phase_congruency"
    retinex_sigma: float = 25.0
    sun_angle_delta_threshold: float = 30.0  # degrees: lean heavily on illumination-invariance if delta > threshold

@dataclass
class MultiscaleConfig:
    enabled: bool = True
    l_max: int = 6  # per File 2 §2, cap at L_max=6
    downscale_factor: float = 2.0
    scale_ratio: Optional[float] = None  # derived from manifest/metadata

@dataclass
class FeatureConfig:
    method: str = "sift"  # "sift" | "akaze" | "orb" | "superpoint"
    n_features: int = 8000
    contrast_threshold: float = 0.015  # tuned for low-contrast lunar craters
    edge_threshold: float = 15.0
    akaze_threshold: float = 0.0008
    device: str = "cpu"  # "cpu" | "cuda"

@dataclass
class MatchingConfig:
    matcher_type: str = "flann"  # "flann" | "bf" | "lightglue" | "loftr"
    knn: int = 2
    flann_trees: int = 5
    flann_checks: int = 50

@dataclass
class FilteringConfig:
    use_ratio_test: bool = True
    ratio_threshold: float = 0.75  # Lowe's ratio test
    use_cross_check: bool = True
    use_geometric_consistency: bool = True
    neighborhood_k: int = 5
    geom_tolerance_px: float = 8.0
    max_descriptor_distance: Optional[float] = None

@dataclass
class GeometricConfig:
    estimator: str = "magsac"  # "magsac" (cv2.USAC_MAGSAC) | "ransac"
    transform_model: str = "auto"  # "auto" | "homography" | "affine" | "similarity" | "tps"
    ransac_reproj_threshold: float = 3.0  # px (File 2 §3)
    max_iters: int = 3000
    confidence: float = 0.999
    random_seed: int = 42

@dataclass
class DistributionConfig:
    method: str = "grid"  # "grid" | "anms" | "fps"
    grid_size: Tuple[int, int] = (8, 8)  # 64 cells
    max_points_per_cell: int = 5  # File 2 §3 / ALGORITHM_NOTES §4 (k=5)
    anms_robustness_ratio: float = 0.9
    target_total_matches: int = 200

@dataclass
class SubpixelConfig:
    enabled: bool = True
    method: str = "ecc"  # "ecc" | "lucas_kanade" | "phase_corr"
    patch_size: int = 21
    ecc_max_iters: int = 40
    ecc_eps: float = 1e-5
    lk_win_size: Tuple[int, int] = (15, 15)
    recompute_transform: bool = True  # refit transform with sub-pixel refined coordinates

@dataclass
class EvaluationThresholds:
    # All named fields per File 2 §3
    rmse_threshold_base: float = 0.5  # px
    rmse_threshold_relaxed: float = 1.0  # px (only for scale_ratio > 50:1)
    scale_ratio_cutoff: float = 50.0  # cutoff ratio to relax RMSE to 1.0 px
    min_inlier_count: int = 100
    min_overlap_fraction: float = 0.15  # below which inlier floor is scaled down
    min_inlier_ratio: float = 0.75  # 75%
    min_spatial_coverage: float = 0.75  # 75% entropy-normalized
    target_success_rate: float = 0.90  # 90% across registry
    confidence_weights: Tuple[float, float, float] = (0.4, 0.4, 0.2)  # rmse, inlier_ratio, coverage

    def get_rmse_threshold(self, scale_ratio: Optional[float] = None) -> float:
        if scale_ratio is not None and abs(scale_ratio) > self.scale_ratio_cutoff:
            return self.rmse_threshold_relaxed
        return self.rmse_threshold_base

    def get_expected_min_inliers(self, overlap_fraction: float = 1.0) -> int:
        if overlap_fraction < self.min_overlap_fraction:
            # Scale floor proportionally for small-overlap crops
            scaled = int(self.min_inlier_count * (max(0.01, overlap_fraction) / self.min_overlap_fraction))
            return max(15, scaled)
        return self.min_inlier_count

@dataclass
class PipelineConfig:
    mode: str = "basic"  # "basic" | "advanced" | "ai" | "detector_free"
    preprocessing: PreprocessingConfig = field(default_factory=PreprocessingConfig)
    illumination: IlluminationConfig = field(default_factory=IlluminationConfig)
    multiscale: MultiscaleConfig = field(default_factory=MultiscaleConfig)
    features: FeatureConfig = field(default_factory=FeatureConfig)
    matching: MatchingConfig = field(default_factory=MatchingConfig)
    filtering: FilteringConfig = field(default_factory=FilteringConfig)
    geometric: GeometricConfig = field(default_factory=GeometricConfig)
    distribution: DistributionConfig = field(default_factory=DistributionConfig)
    subpixel: SubpixelConfig = field(default_factory=SubpixelConfig)
    thresholds: EvaluationThresholds = field(default_factory=EvaluationThresholds)
    use_illumination_invariant: bool = True
    scale_ratio: Optional[float] = None
    overlap_fraction: float = 1.0
    debug_mode: bool = False
