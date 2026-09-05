"""
processing-service/tests/test_pipeline.py
Unit tests for all pipeline stages.
These are pure-Python tests — no Redis, no S3, no GPU required.
"""
from __future__ import annotations

import numpy as np
import pytest


# ── Preprocess ────────────────────────────────────────────────────────────────

class TestPreprocess:
    def test_clahe_output_range(self, synthetic_image_512):
        from app.pipeline.preprocess import preprocess
        result = preprocess(synthetic_image_512, steps=["clahe"])
        assert result.dtype == np.float32
        assert 0.0 <= result.min()
        assert result.max() <= 1.0

    def test_minmax_output_range(self, synthetic_image_512):
        from app.pipeline.preprocess import preprocess
        result = preprocess(synthetic_image_512, steps=["minmax"])
        assert pytest.approx(result.min(), abs=1e-4) == 0.0
        assert pytest.approx(result.max(), abs=1e-4) == 1.0

    def test_unknown_step_skipped(self, synthetic_image_512):
        from app.pipeline.preprocess import preprocess
        # Should not raise — unknown step is skipped with a warning
        result = preprocess(synthetic_image_512, steps=["nonexistent_step"])
        assert result.shape == synthetic_image_512.shape

    def test_empty_steps_returns_float32(self, synthetic_image_512):
        from app.pipeline.preprocess import preprocess
        result = preprocess(synthetic_image_512, steps=[])
        assert result.dtype == np.float32


# ── Pyramid ───────────────────────────────────────────────────────────────────

class TestPyramid:
    def test_pyramid_level_count(self, synthetic_image_512):
        from app.pipeline.pyramid import build_pyramid
        levels = build_pyramid(synthetic_image_512, n_levels=4)
        assert len(levels) == 4

    def test_coarsest_is_smallest(self, synthetic_image_512):
        from app.pipeline.pyramid import build_pyramid
        levels = build_pyramid(synthetic_image_512, n_levels=4)
        # Coarsest (index 0) should be smaller than finest (last)
        assert levels[0].image.shape[0] < levels[-1].image.shape[0]

    def test_scale_values(self, synthetic_image_512):
        from app.pipeline.pyramid import build_pyramid
        levels = build_pyramid(synthetic_image_512, n_levels=3)
        # Finest level should have scale = 1.0
        assert pytest.approx(levels[-1].scale, abs=1e-6) == 1.0

    def test_pyramid_levels_from_resolution(self):
        from app.pipeline.pyramid import compute_pyramid_levels
        # OHRC 0.25m vs IIRS 80m → large ratio → many levels
        levels = compute_pyramid_levels(0.25, 80.0)
        assert levels >= 4
        assert levels <= 6

    def test_pyramid_levels_same_resolution(self):
        from app.pipeline.pyramid import compute_pyramid_levels
        levels = compute_pyramid_levels(5.0, 5.0)
        assert levels >= 1


# ── Classical Detection ───────────────────────────────────────────────────────

class TestClassicalDetector:
    def test_sift_detects_keypoints(self, synthetic_image_512):
        from app.pipeline.detectors.classical import detect_and_describe
        result = detect_and_describe(synthetic_image_512, "SIFT", max_keypoints=500)
        # Synthetic craters should produce detectable features
        assert len(result.keypoints) > 0
        assert result.descriptors.shape[1] == 128  # SIFT = 128-dim

    def test_orb_detects_keypoints(self, synthetic_image_512):
        from app.pipeline.detectors.classical import detect_and_describe
        result = detect_and_describe(synthetic_image_512, "ORB", max_keypoints=500)
        assert len(result.keypoints) > 0

    def test_max_keypoints_enforced(self, synthetic_image_512):
        from app.pipeline.detectors.classical import detect_and_describe
        limit = 50
        result = detect_and_describe(synthetic_image_512, "SIFT", max_keypoints=limit)
        assert len(result.keypoints) <= limit

    def test_invalid_detector_raises(self, synthetic_image_512):
        from app.pipeline.detectors.classical import detect_and_describe
        with pytest.raises(ValueError, match="Unknown detector"):
            detect_and_describe(synthetic_image_512, "UNKNOWN")  # type: ignore


# ── Matching ──────────────────────────────────────────────────────────────────

class TestMatching:
    def test_match_classical_affine_pair(self, synthetic_image_512):
        """An affine-transformed pair should yield > 0 matches."""
        import cv2
        from app.pipeline.detectors.classical import detect_and_describe
        from app.pipeline.matching import match_classical

        # Create a slightly transformed copy
        M = np.float32([[1, 0, 5], [0, 1, 5]])  # 5px translation
        shifted = cv2.warpAffine(synthetic_image_512, M, (512, 512))

        src_kp = detect_and_describe(synthetic_image_512, "SIFT", 1000)
        ref_kp = detect_and_describe(shifted, "SIFT", 1000)
        result = match_classical(src_kp, ref_kp, ratio_threshold=0.80)

        assert len(result.src_pts) > 0

    def test_empty_keypoints_returns_empty(self):
        from app.pipeline.detectors.classical import KeypointResult
        from app.pipeline.matching import match_classical

        empty = KeypointResult(keypoints=[], descriptors=np.empty((0, 128)), detector_type="SIFT")
        result = match_classical(empty, empty)
        assert len(result.src_pts) == 0


# ── Geometry ──────────────────────────────────────────────────────────────────

class TestGeometry:
    def _make_synthetic_matches(self, n=50):
        """Generate synthetic match points with known affine transform."""
        from app.pipeline.matching import MatchResult

        rng = np.random.default_rng(0)
        src = rng.uniform(50, 460, (n, 2)).astype(np.float32)
        # Known 5px translation
        ref = src + np.array([5.0, 5.0], dtype=np.float32)
        # Add 5% noise (outliers)
        n_outliers = max(1, n // 20)
        ref[:n_outliers] += rng.uniform(-50, 50, (n_outliers, 2)).astype(np.float32)
        return MatchResult(src_pts=src, ref_pts=ref, scores=np.ones(n, dtype=np.float32))

    def test_homography_estimation(self):
        from app.pipeline.geometry import estimate_transform
        matches = self._make_synthetic_matches(50)
        result = estimate_transform(matches, "homography")
        assert result.inlier_count > 0
        assert result.inlier_ratio > 0.5

    def test_affine_estimation(self):
        from app.pipeline.geometry import estimate_transform
        matches = self._make_synthetic_matches(50)
        result = estimate_transform(matches, "affine")
        assert result.inlier_count > 0
        assert result.transform_matrix.shape == (2, 3)

    def test_insufficient_matches_raises(self):
        from app.pipeline.geometry import estimate_transform
        from app.pipeline.matching import MatchResult

        too_few = MatchResult(
            src_pts=np.array([[1., 2.], [3., 4.]], dtype=np.float32),
            ref_pts=np.array([[1., 2.], [3., 4.]], dtype=np.float32),
            scores=np.ones(2),
        )
        with pytest.raises(ValueError, match="Not enough matches"):
            estimate_transform(too_few, "homography")


# ── Coverage ──────────────────────────────────────────────────────────────────

class TestCoverage:
    def test_coverage_score_0_to_1(self):
        from app.pipeline.geometry import GeometryResult
        from app.pipeline.coverage import enforce_coverage

        src_pts = np.random.default_rng(1).uniform(0, 512, (30, 2)).astype(np.float32)
        ref_pts = src_pts.copy()
        T = np.eye(3, dtype=np.float64)

        geo = GeometryResult(
            transform_matrix=T, transform_model="homography",
            inlier_mask=np.ones(30, dtype=bool),
            inlier_src_pts=src_pts, inlier_ref_pts=ref_pts,
            inlier_count=30, inlier_ratio=1.0,
        )
        _, _, _, score = enforce_coverage(geo, 512, 512, n_cells=8)
        assert 0.0 <= score <= 1.0

    def test_empty_inliers_returns_zero(self):
        from app.pipeline.geometry import GeometryResult
        from app.pipeline.coverage import enforce_coverage

        geo = GeometryResult(
            transform_matrix=np.eye(3), transform_model="homography",
            inlier_mask=np.array([], dtype=bool),
            inlier_src_pts=np.empty((0, 2)), inlier_ref_pts=np.empty((0, 2)),
            inlier_count=0, inlier_ratio=0.0,
        )
        _, _, _, score = enforce_coverage(geo, 512, 512, n_cells=8)
        assert score == 0.0


# ── Metrics ───────────────────────────────────────────────────────────────────

class TestMetrics:
    def test_metrics_rmse_finite(self):
        from app.pipeline.geometry import GeometryResult
        from app.pipeline.metrics import compute_metrics

        src_pts = np.array([[10., 10.], [200., 200.], [300., 300.]], dtype=np.float32)
        ref_pts = src_pts + 2.0  # 2px translation → RMSE ≈ 2.83

        T = np.eye(3, dtype=np.float64)
        T[0, 2] = 2.0
        T[1, 2] = 2.0

        geo = GeometryResult(
            transform_matrix=T, transform_model="homography",
            inlier_mask=np.ones(3, dtype=bool),
            inlier_src_pts=src_pts, inlier_ref_pts=ref_pts,
            inlier_count=3, inlier_ratio=1.0,
        )
        m = compute_metrics(geo, coverage_score=0.5, covered_src_pts=src_pts, covered_ref_pts=ref_pts)
        assert np.isfinite(m.rmse)
        assert m.rmse > 0

    def test_low_confidence_flag_few_inliers(self):
        from app.pipeline.geometry import GeometryResult
        from app.pipeline.metrics import compute_metrics

        geo = GeometryResult(
            transform_matrix=np.eye(3), transform_model="homography",
            inlier_mask=np.ones(2, dtype=bool),
            inlier_src_pts=np.array([[1., 1.], [2., 2.]], dtype=np.float32),
            inlier_ref_pts=np.array([[1., 1.], [2., 2.]], dtype=np.float32),
            inlier_count=2, inlier_ratio=1.0,
        )
        m = compute_metrics(geo, 0.5,
                            np.array([[1., 1.], [2., 2.]], dtype=np.float32),
                            np.array([[1., 1.], [2., 2.]], dtype=np.float32))
        assert m.low_confidence is True

    def test_match_points_to_geojson_valid(self):
        from app.pipeline.metrics import match_points_to_geojson
        import json

        src = np.array([[10., 20.], [30., 40.]], dtype=np.float32)
        ref = np.array([[11., 21.], [31., 41.]], dtype=np.float32)
        geojson_str = match_points_to_geojson(src, ref, [1.0, 1.5])
        parsed = json.loads(geojson_str)

        assert parsed["type"] == "FeatureCollection"
        assert len(parsed["features"]) == 2


# ── Ingest ────────────────────────────────────────────────────────────────────

class TestIngest:
    def test_ingest_geotiff(self, synthetic_geotiff):
        from app.pipeline.ingest import ingest_image
        desc = ingest_image(synthetic_geotiff)
        assert desc.width == 512
        assert desc.height == 512
        assert desc.band_count == 1

    def test_windowed_read(self, synthetic_geotiff):
        from app.pipeline.ingest import ingest_image
        import rasterio
        from rasterio.windows import Window

        desc = ingest_image(synthetic_geotiff)
        window = Window(0, 0, 64, 64)
        patch = desc.read_window(window)
        assert patch.shape == (64, 64)
        assert patch.dtype == np.float32

    def test_read_overview_downsampled(self, synthetic_geotiff):
        from app.pipeline.ingest import ingest_image
        desc = ingest_image(synthetic_geotiff)
        overview = desc.read_overview(target_size=128)
        # Should be smaller than or equal to 128 on each axis
        assert max(overview.shape) <= 128
