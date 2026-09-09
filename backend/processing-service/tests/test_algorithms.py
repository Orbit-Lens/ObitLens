import pytest
import numpy as np
import cv2

from app.algorithms.types import (
    ImageMeta,
    FeatureSet,
    Transform,
    EvaluationReport,
    RegistrationResult,
)
from app.algorithms.pipeline.config import PipelineConfig, EvaluationThresholds
from app.algorithms.pipeline.modes import get_mode_config
from app.algorithms.pipeline.orchestrator import register_images
from app.algorithms.preprocessing.grayscale import to_grayscale
from app.algorithms.preprocessing.denoise import denoise
from app.algorithms.preprocessing.contrast import equalize
from app.algorithms.preprocessing.normalize import normalize_intensity
from app.algorithms.preprocessing.resize import resize_to_scale
from app.algorithms.illumination.clahe import compute_retinex_reflectance, illumination_invariant_representation
from app.algorithms.illumination.gradients import sobel_gradient_magnitude, scharr_gradient_magnitude
from app.algorithms.illumination.edges import canny_edges
from app.algorithms.illumination.shadow import detect_shadow_mask
from app.algorithms.pyramid.gaussian_pyramid import build_gaussian_pyramid, compute_pyramid_levels
from app.algorithms.features.classical.sift_extractor import SIFTExtractor
from app.algorithms.features.classical.akaze_extractor import AKAZEExtractor, ORBExtractor
from app.algorithms.matching.classical.flann_matcher import FlannMatcher
from app.algorithms.matching.classical.bf_matcher import BFMatcher
from app.algorithms.filtering.ratio_test import lowes_ratio_test
from app.algorithms.filtering.geometric_consistency import geometric_consistency_filter
from app.algorithms.geometric.transform_models import AffineModel, HomographyModel
from app.algorithms.geometric.ransac_estimator import estimate_ransac
from app.algorithms.geometric.magsac_estimator import estimate_magsac
from app.algorithms.distribution.grid_selection import grid_select
from app.algorithms.distribution.anms import anms
from app.algorithms.evaluation.metrics import (
    compute_rmse,
    compute_spatial_coverage,
    compute_confidence_score,
    check_registration_success,
)
from tests.data_gen.synthetic_pairs import generate_synthetic_pair

@pytest.fixture
def test_image():
    """Generates synthetic lunar crater image fixture."""
    np.random.seed(42)
    img = np.full((256, 256), 120, dtype=np.uint8)
    # Add crater rims
    for (cx, cy, r) in [(80, 80, 25), (180, 160, 35), (120, 190, 20)]:
        cv2.circle(img, (cx, cy), r, 200, 2)
        cv2.circle(img, (cx, cy), r - 2, 60, -1)
    return img.astype(np.float32) / 255.0

def test_data_contracts():
    meta = ImageMeta(path="test.png", driver="opencv", resolution_mpp=0.25)
    assert meta.resolution_mpp == 0.25
    assert meta.bit_depth == 8

    fs = FeatureSet(
        keypoints=np.zeros((10, 2), dtype=np.float32),
        descriptors=np.zeros((10, 128), dtype=np.float32),
        scores=np.ones(10, dtype=np.float32)
    )
    assert len(fs) == 10

def test_preprocessing(test_image):
    gray = to_grayscale(test_image)
    assert gray.shape == (256, 256)
    assert gray.dtype == np.float32

    denoised = denoise(test_image, method="bilateral")
    assert denoised.shape == test_image.shape
    assert 0.0 <= denoised.min() <= denoised.max() <= 1.0

    eq = equalize(test_image, method="clahe")
    assert eq.shape == test_image.shape

    norm = normalize_intensity(test_image, method="minmax")
    assert norm.max() == pytest.approx(1.0, abs=0.01)

    resized = resize_to_scale(test_image, scale_factor=0.5)
    assert resized.shape == (128, 128)

def test_illumination_invariance(test_image):
    retinex = compute_retinex_reflectance(test_image, sigma=15.0)
    assert retinex.shape == test_image.shape
    assert 0.0 <= retinex.min() <= retinex.max() <= 1.0

    sobel = sobel_gradient_magnitude(test_image)
    assert sobel.shape == test_image.shape

    scharr = scharr_gradient_magnitude(test_image)
    assert scharr.shape == test_image.shape

    edges = canny_edges(test_image)
    assert edges.shape == test_image.shape

    mask, conf = detect_shadow_mask(test_image)
    assert mask.shape == test_image.shape

def test_pyramid_levels():
    assert compute_pyramid_levels(1.0) == 1
    assert compute_pyramid_levels(20.0, l_max=6) == 5
    assert compute_pyramid_levels(320.0, l_max=6) == 6

def test_features_and_matching(test_image):
    sift = SIFTExtractor(n_features=500)
    fs = sift.extract(test_image)
    assert len(fs.keypoints) > 20
    assert fs.descriptors.shape[1] == 128

    akaze = AKAZEExtractor()
    fs_a = akaze.extract(test_image)
    assert len(fs_a.keypoints) > 10

    matcher = FlannMatcher(ratio_threshold=0.85)
    pairs, scores = matcher.match(fs, fs)
    assert len(pairs) > 15
    assert len(scores) == len(pairs)

def test_geometric_estimators():
    src_pts = np.float32([[10, 10], [100, 10], [100, 100], [10, 100], [50, 50]])
    ref_pts = src_pts + np.float32([5.0, -3.0])

    tf, inliers = estimate_ransac(src_pts, ref_pts, model_type="affine", reproj_threshold=2.0)
    assert tf is not None
    assert inliers.all()

    tf_mag, inliers_mag = estimate_magsac(src_pts, ref_pts, model_type="affine", reproj_threshold=2.0)
    assert tf_mag is not None
    assert inliers_mag.all()

def test_distribution_grid():
    kps = np.float32([[20, 20], [25, 25], [30, 30], [200, 200]])
    scores = np.float32([0.5, 0.9, 0.7, 0.8])
    selected = grid_select(kps, scores, image_shape=(256, 256), grid=(8, 8), max_per_cell=2)
    assert len(selected) <= 3

def test_evaluation_targets():
    th = EvaluationThresholds()
    assert th.get_rmse_threshold(scale_ratio=1.0) == 0.5
    assert th.get_rmse_threshold(scale_ratio=60.0) == 1.0
    assert th.get_expected_min_inliers(overlap_fraction=1.0) == 100
    assert th.get_expected_min_inliers(overlap_fraction=0.05) < 100

def test_end_to_end_synthetic_registration():
    src_u8, ref_u8, gt_M, _ = generate_synthetic_pair(
        angle_deg=3.0, scale=1.02, dx=8.0, dy=-4.0, gamma=1.1, noise_sigma=1.0
    )
    src_f = src_u8.astype(np.float32) / 255.0
    ref_f = ref_u8.astype(np.float32) / 255.0

    res = register_images(src_f, ref_f, mode="basic")
    rep = res.evaluation_report

    assert rep.registration_success, f"Failed: RMSE={rep.rmse}, Inliers={rep.inlier_count}, Ratio={rep.inlier_ratio}, Cov={rep.spatial_coverage}"
    assert rep.rmse <= 0.50
    assert rep.inlier_count >= 100
    assert rep.inlier_ratio >= 0.75
    assert rep.spatial_coverage >= 0.75
