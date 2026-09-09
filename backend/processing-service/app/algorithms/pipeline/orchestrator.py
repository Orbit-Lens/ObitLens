import time
import cv2
import numpy as np
from typing import Optional, Dict, Any, Tuple, Union

from app.algorithms.types import (
    Image,
    ImageMeta,
    Keypoints,
    FeatureSet,
    Matches,
    Transform,
    EvaluationReport,
    RegistrationResult,
)
from app.algorithms.pipeline.config import PipelineConfig
from app.algorithms.pipeline.modes import get_mode_config
from app.algorithms.io.loaders import load_image
from app.algorithms.preprocessing.denoise import denoise
from app.algorithms.preprocessing.contrast import equalize
from app.algorithms.preprocessing.normalize import normalize_intensity
from app.algorithms.illumination.clahe import illumination_invariant_representation
from app.algorithms.pyramid.gaussian_pyramid import build_gaussian_pyramid, compute_pyramid_levels
from app.algorithms.features.classical.sift_extractor import SIFTExtractor
from app.algorithms.features.classical.akaze_extractor import AKAZEExtractor, ORBExtractor, BRISKExtractor
from app.algorithms.matching.classical.flann_matcher import FlannMatcher
from app.algorithms.matching.classical.bf_matcher import BFMatcher
from app.algorithms.filtering.geometric_consistency import geometric_consistency_filter
from app.algorithms.geometric.ransac_estimator import estimate_ransac
from app.algorithms.geometric.magsac_estimator import estimate_magsac
from app.algorithms.geometric.transform_selector import select_transform_model
from app.algorithms.geometric.transform_models import HomographyModel, AffineModel
from app.algorithms.distribution import select_uniform_matches
from app.algorithms.subpixel import refine_matches
from app.algorithms.registration.warp import warp_image
from app.algorithms.evaluation.report import build_report

def get_feature_extractor(method: str, cfg: Any):
    m = method.lower()
    if m == "akaze":
        return AKAZEExtractor(threshold=cfg.akaze_threshold)
    elif m == "orb":
        return ORBExtractor(n_features=cfg.n_features)
    elif m == "brisk":
        return BRISKExtractor()
    else:  # default sift
        return SIFTExtractor(
            n_features=cfg.n_features,
            contrast_threshold=cfg.contrast_threshold,
            edge_threshold=cfg.edge_threshold
        )

def register_images(
    source_input: Union[str, Image],
    reference_input: Union[str, Image],
    mode: str = "basic",
    config: Optional[PipelineConfig] = None,
    source_meta: Optional[ImageMeta] = None,
    reference_meta: Optional[ImageMeta] = None
) -> RegistrationResult:
    """
    Main registration orchestrator (File 1 §4).
    Accepts paths or pre-loaded Images.
    Resilient: Returns structured RegistrationResult on failure rather than crashing.
    """
    t0 = time.time()
    if config is None:
        config = get_mode_config(mode)

    # 1. Load images & metadata
    try:
        if isinstance(source_input, str):
            src_raw, src_meta = load_image(source_input)
        else:
            src_raw = source_input
            src_meta = source_meta or ImageMeta(path="in_memory")

        if isinstance(reference_input, str):
            ref_raw, ref_meta = load_image(reference_input)
        else:
            ref_raw = reference_input
            ref_meta = reference_meta or ImageMeta(path="in_memory")
    except Exception as e:
        empty_rep = build_report(
            src_pts_inliers=np.empty((0, 2), dtype=np.float32),
            ref_pts_inliers=np.empty((0, 2), dtype=np.float32),
            inlier_mask=np.zeros(0, dtype=bool),
            total_candidates=0,
            transform=None,
            image_shape=(512, 512),
            thresholds=config.thresholds
        )
        return RegistrationResult(
            registered_image=None,
            match_points_src=np.empty((0, 2), dtype=np.float32),
            match_points_ref=np.empty((0, 2), dtype=np.float32),
            match_points_ref_refined=None,
            inlier_mask=np.zeros(0, dtype=bool),
            transform=None,
            evaluation_report=empty_rep,
            failure_reason=f"Failed to load images: {e}"
        )

    # Scale ratio inference
    scale_ratio = config.scale_ratio
    if scale_ratio is None and src_meta.resolution_mpp and ref_meta.resolution_mpp:
        scale_ratio = ref_meta.resolution_mpp / src_meta.resolution_mpp

    # Sun angle delta
    sun_delta_deg = None
    if src_meta.sun_azimuth is not None and ref_meta.sun_azimuth is not None:
        sun_delta_deg = abs(src_meta.sun_azimuth - ref_meta.sun_azimuth)

    # 2. Preprocessing & Illumination Invariance
    src_prep = denoise(
        src_raw,
        method=config.preprocessing.denoise_method,
        d=config.preprocessing.denoise_d,
        sigma_color=config.preprocessing.denoise_sigma_color,
        sigma_space=config.preprocessing.denoise_sigma_space
    )
    ref_prep = denoise(
        ref_raw,
        method=config.preprocessing.denoise_method,
        d=config.preprocessing.denoise_d,
        sigma_color=config.preprocessing.denoise_sigma_color,
        sigma_space=config.preprocessing.denoise_sigma_space
    )

    if config.use_illumination_invariant:
        # If sun angle difference is notable or unknown, apply Retinex + CLAHE
        src_feat_img = illumination_invariant_representation(
            src_prep,
            method=config.illumination.method,
            clip_limit=config.preprocessing.clahe_clip_limit,
            tile_grid_size=config.preprocessing.clahe_tile_grid_size,
            retinex_sigma=config.illumination.retinex_sigma
        )
        ref_feat_img = illumination_invariant_representation(
            ref_prep,
            method=config.illumination.method,
            clip_limit=config.preprocessing.clahe_clip_limit,
            tile_grid_size=config.preprocessing.clahe_tile_grid_size,
            retinex_sigma=config.illumination.retinex_sigma
        )
    else:
        src_feat_img = equalize(
            src_prep,
            method="clahe",
            clip_limit=config.preprocessing.clahe_clip_limit,
            tile_grid_size=config.preprocessing.clahe_tile_grid_size
        )
        ref_feat_img = equalize(
            ref_prep,
            method="clahe",
            clip_limit=config.preprocessing.clahe_clip_limit,
            tile_grid_size=config.preprocessing.clahe_tile_grid_size
        )

    # 3. Multiscale Pyramids
    pyramid_levels = 1
    if config.multiscale.enabled:
        pyramid_levels = compute_pyramid_levels(scale_ratio, l_max=config.multiscale.l_max)

    src_pyr = build_gaussian_pyramid(src_feat_img, levels=pyramid_levels, downscale=config.multiscale.downscale_factor)
    ref_pyr = build_gaussian_pyramid(ref_feat_img, levels=pyramid_levels, downscale=config.multiscale.downscale_factor)

    # 4 & 5. Feature Extraction & Matching across levels
    extractor = get_feature_extractor(config.features.method, config.features)
    matcher = FlannMatcher(
        trees=config.matching.flann_trees,
        checks=config.matching.flann_checks,
        ratio_threshold=config.filtering.ratio_threshold
    )

    all_src_pts = []
    all_ref_pts = []
    all_scores = []

    for lvl in range(len(src_pyr)):
        s_img, s_scale = src_pyr[lvl]
        r_img, r_scale = ref_pyr[lvl]

        feat_s = extractor.extract(s_img)
        feat_r = extractor.extract(r_img)

        if len(feat_s) < 2 or len(feat_r) < 2:
            continue

        pairs, scores = matcher.match(feat_s, feat_r)
        if len(pairs) == 0:
            continue

        # Scale coordinates back to level 0 (full resolution)
        pts_s_level0 = feat_s.keypoints[pairs[:, 0]] / s_scale
        pts_r_level0 = feat_r.keypoints[pairs[:, 1]] / r_scale

        all_src_pts.append(pts_s_level0)
        all_ref_pts.append(pts_r_level0)
        all_scores.append(scores)

    if not all_src_pts:
        empty_rep = build_report(
            src_pts_inliers=np.empty((0, 2), dtype=np.float32),
            ref_pts_inliers=np.empty((0, 2), dtype=np.float32),
            inlier_mask=np.zeros(0, dtype=bool),
            total_candidates=0,
            transform=None,
            image_shape=ref_raw.shape[:2],
            thresholds=config.thresholds,
            scale_ratio=scale_ratio
        )
        return RegistrationResult(
            registered_image=None,
            match_points_src=np.empty((0, 2), dtype=np.float32),
            match_points_ref=np.empty((0, 2), dtype=np.float32),
            match_points_ref_refined=None,
            inlier_mask=np.zeros(0, dtype=bool),
            transform=None,
            evaluation_report=empty_rep,
            failure_reason="No initial feature correspondences found."
        )

    cand_src = np.vstack(all_src_pts).astype(np.float32)
    cand_ref = np.vstack(all_ref_pts).astype(np.float32)
    cand_scores = np.concatenate(all_scores).astype(np.float32)
    total_candidates = len(cand_src)

    # 6. Pre-RANSAC Filtering
    dummy_matches = np.column_stack([np.arange(total_candidates), np.arange(total_candidates)])
    if config.filtering.use_geometric_consistency and total_candidates > 10:
        filt_matches, filt_scores = geometric_consistency_filter(
            cand_src, cand_ref, dummy_matches, cand_scores,
            neighborhood_k=config.filtering.neighborhood_k,
            tolerance_px=config.filtering.geom_tolerance_px
        )
        keep_indices = filt_matches[:, 0]
        filt_src = cand_src[keep_indices]
        filt_ref = cand_ref[keep_indices]
    else:
        filt_src = cand_src
        filt_ref = cand_ref

    # 7. Geometric Verification & Transform Estimation
    target_model = config.geometric.transform_model
    estimator_func = estimate_magsac if config.geometric.estimator == "magsac" else estimate_ransac

    if target_model == "auto":
        # Try both homography and affine, then select best
        tf_h, inliers_h = estimator_func(
            filt_src, filt_ref, model_type="homography",
            reproj_threshold=config.geometric.ransac_reproj_threshold,
            max_iters=config.geometric.max_iters
        )
        tf_a, inliers_a = estimator_func(
            filt_src, filt_ref, model_type="affine",
            reproj_threshold=config.geometric.ransac_reproj_threshold,
            max_iters=config.geometric.max_iters
        )

        res_h = np.inf
        if tf_h is not None and np.count_nonzero(inliers_h) > 0:
            h_mod = HomographyModel(tf_h.matrix)
            diff_h = h_mod.apply(filt_src[inliers_h]) - filt_ref[inliers_h]
            res_h = float(np.mean(np.sqrt(np.sum(diff_h**2, axis=1))))

        res_a = np.inf
        if tf_a is not None and np.count_nonzero(inliers_a) > 0:
            a_mod = AffineModel(tf_a.matrix)
            diff_a = a_mod.apply(filt_src[inliers_a]) - filt_ref[inliers_a]
            res_a = float(np.mean(np.sqrt(np.sum(diff_a**2, axis=1))))

        chosen = select_transform_model(
            inlier_count=int(np.count_nonzero(inliers_h if inliers_h is not None else 0)),
            homography_matrix=tf_h.matrix if tf_h else None,
            residual_homography=res_h,
            residual_affine=res_a
        )
        transform, inlier_submask = (tf_h, inliers_h) if chosen == "homography" and tf_h is not None else (tf_a, inliers_a)
    else:
        transform, inlier_submask = estimator_func(
            filt_src, filt_ref, model_type=target_model,
            reproj_threshold=config.geometric.ransac_reproj_threshold,
            max_iters=config.geometric.max_iters
        )

    # Align inlier mask back to full candidate array
    inlier_mask_full = np.zeros(total_candidates, dtype=bool)
    if transform is not None and inlier_submask is not None:
        if config.filtering.use_geometric_consistency and total_candidates > 10:
            inlier_mask_full[keep_indices[inlier_submask]] = True
        else:
            inlier_mask_full[inlier_submask] = True

    inliers_count = int(np.count_nonzero(inlier_mask_full))
    if transform is None or inliers_count < 4:
        empty_rep = build_report(
            src_pts_inliers=cand_src[inlier_mask_full],
            ref_pts_inliers=cand_ref[inlier_mask_full],
            inlier_mask=inlier_mask_full,
            total_candidates=total_candidates,
            transform=None,
            image_shape=ref_raw.shape[:2],
            thresholds=config.thresholds,
            scale_ratio=scale_ratio,
            overlap_fraction=config.overlap_fraction
        )
        return RegistrationResult(
            registered_image=None,
            match_points_src=cand_src,
            match_points_ref=cand_ref,
            match_points_ref_refined=None,
            inlier_mask=inlier_mask_full,
            transform=None,
            evaluation_report=empty_rep,
            failure_reason="Geometric verification failed to estimate a valid transformation."
        )

    # 8. Uniform Distribution Selection over Inliers
    selected_indices = select_uniform_matches(
        kp_ref=cand_ref,
        inlier_mask=inlier_mask_full,
        scores=cand_scores,
        image_shape=ref_raw.shape[:2],
        grid=config.distribution.grid_size,
        max_per_cell=config.distribution.max_points_per_cell,
        target_total=config.distribution.target_total_matches
    )

    final_src = cand_src[selected_indices]
    final_ref = cand_ref[selected_indices]

    # 9. Sub-pixel Refinement
    refined_ref = final_ref
    if config.subpixel.enabled and len(final_src) > 0:
        refined_ref = refine_matches(
            final_src,
            final_ref,
            src_raw,
            ref_raw,
            transform=transform,
            patch_size=config.subpixel.patch_size,
            method=config.subpixel.method
        )

        # 10. Recompute transform after sub-pixel refinement if requested
        if config.subpixel.recompute_transform and len(final_src) >= 4:
            refined_tf, _ = estimator_func(
                final_src,
                refined_ref,
                model_type=transform.type,
                reproj_threshold=config.geometric.ransac_reproj_threshold,
                max_iters=1000
            )
            if refined_tf is not None:
                transform = refined_tf

    # 11. Warp Source Image
    warped_src = warp_image(src_raw, transform, output_shape=ref_raw.shape[:2])

    # 12. Build Evaluation Report
    report = build_report(
        src_pts_inliers=final_src,
        ref_pts_inliers=refined_ref,
        inlier_mask=inlier_mask_full,
        total_candidates=total_candidates,
        transform=transform,
        image_shape=ref_raw.shape[:2],
        thresholds=config.thresholds,
        scale_ratio=scale_ratio,
        overlap_fraction=config.overlap_fraction,
        grid_size=config.distribution.grid_size
    )

    elapsed_ms = (time.time() - t0) * 1000.0
    report.debug_metrics = {
        "elapsed_ms": round(elapsed_ms, 2),
        "sun_angle_delta_deg": sun_delta_deg,
        "total_candidates": total_candidates,
        "selected_inliers": len(final_src),
    }

    return RegistrationResult(
        registered_image=warped_src,
        match_points_src=cand_src,
        match_points_ref=cand_ref,
        match_points_ref_refined=refined_ref,
        inlier_mask=inlier_mask_full,
        transform=transform,
        evaluation_report=report,
        failure_reason=None if report.registration_success else "Metrics fell below problem statement thresholds.",
        debug=report.debug_metrics
    )
