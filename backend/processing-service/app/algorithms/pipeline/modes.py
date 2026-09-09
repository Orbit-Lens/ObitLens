from app.algorithms.pipeline.config import (
    PipelineConfig,
    FeatureConfig,
    MatchingConfig,
    FilteringConfig,
    GeometricConfig,
    DistributionConfig,
    SubpixelConfig,
    EvaluationThresholds,
)

def get_mode_config(mode_name: str = "basic", **overrides) -> PipelineConfig:
    """
    Constructs a PipelineConfig populated with preset options for the given mode (File 1 §6).
    """
    mode = mode_name.lower()

    if mode == "basic":
        config = PipelineConfig(
            mode="basic",
            features=FeatureConfig(method="sift", n_features=6000, contrast_threshold=0.015, edge_threshold=15.0),
            matching=MatchingConfig(matcher_type="flann", knn=2, flann_trees=5, flann_checks=50),
            filtering=FilteringConfig(use_ratio_test=True, ratio_threshold=0.75, use_cross_check=False, use_geometric_consistency=False),
            geometric=GeometricConfig(estimator="ransac", transform_model="homography", ransac_reproj_threshold=3.0, max_iters=2000),
            distribution=DistributionConfig(method="grid", grid_size=(8, 8), max_points_per_cell=5),
            subpixel=SubpixelConfig(enabled=True, method="phase_corr", patch_size=21, recompute_transform=True),
        )
    elif mode == "advanced":
        config = PipelineConfig(
            mode="advanced",
            features=FeatureConfig(method="sift", n_features=8000, contrast_threshold=0.012, edge_threshold=18.0),
            matching=MatchingConfig(matcher_type="flann", knn=2, flann_trees=5, flann_checks=60),
            filtering=FilteringConfig(use_ratio_test=True, ratio_threshold=0.72, use_cross_check=True, use_geometric_consistency=True, geom_tolerance_px=10.0),
            geometric=GeometricConfig(estimator="magsac", transform_model="auto", ransac_reproj_threshold=3.0, max_iters=3000),
            distribution=DistributionConfig(method="grid", grid_size=(8, 8), max_points_per_cell=5),
            subpixel=SubpixelConfig(enabled=True, method="phase_corr", patch_size=21, recompute_transform=True),
        )
    elif mode == "ai":
        config = PipelineConfig(
            mode="ai",
            features=FeatureConfig(method="superpoint", n_features=4000),
            matching=MatchingConfig(matcher_type="lightglue"),
            filtering=FilteringConfig(use_ratio_test=False, use_cross_check=True, use_geometric_consistency=True),
            geometric=GeometricConfig(estimator="magsac", transform_model="auto", ransac_reproj_threshold=3.0),
            distribution=DistributionConfig(method="grid", grid_size=(8, 8), max_points_per_cell=5),
            subpixel=SubpixelConfig(enabled=True, method="ecc", patch_size=21, recompute_transform=True),
        )
    elif mode == "detector_free":
        config = PipelineConfig(
            mode="detector_free",
            features=FeatureConfig(method="none"),
            matching=MatchingConfig(matcher_type="loftr"),
            filtering=FilteringConfig(use_ratio_test=False),
            geometric=GeometricConfig(estimator="magsac", transform_model="auto", ransac_reproj_threshold=3.0),
            distribution=DistributionConfig(method="grid", grid_size=(8, 8), max_points_per_cell=5),
            subpixel=SubpixelConfig(enabled=True, method="ecc", patch_size=21, recompute_transform=True),
        )
    else:
        raise ValueError(f"Unknown mode: {mode_name}. Choose from 'basic', 'advanced', 'ai', 'detector_free'.")

    # Apply overrides
    for k, v in overrides.items():
        if hasattr(config, k):
            setattr(config, k, v)

    return config
