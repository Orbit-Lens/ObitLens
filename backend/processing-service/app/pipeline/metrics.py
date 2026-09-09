import numpy as np
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("orbitlens.pipeline.metrics")

def compute_metrics(
    residuals: np.ndarray,
    total_candidates: int,
    coverage_score: float,
    processing_time_ms: float,
    src_meta: Optional[Dict[str, Any]] = None,
    ref_meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes quantitative evaluation metrics according to the PRD & Blueprint standard:
    RMSE, inlier count, inlier ratio, mean/median reprojection residuals, coverage uniformity.
    """
    inlier_count = len(residuals)
    inlier_ratio = float(inlier_count) / float(total_candidates) if total_candidates > 0 else 0.0

    if inlier_count > 0:
        rmse = float(np.sqrt(np.mean(residuals ** 2)))
        mean_err = float(np.mean(residuals))
        median_err = float(np.median(residuals))
    else:
        rmse = 999.0
        mean_err = 999.0
        median_err = 999.0

    # Sun angle delta
    delta_azimuth = None
    delta_elevation = None
    if src_meta and ref_meta:
        src_az = src_meta.get("sunAzimuthDeg")
        ref_az = ref_meta.get("sunAzimuthDeg")
        if src_az is not None and ref_az is not None:
            delta_azimuth = round(abs(float(src_az) - float(ref_az)), 2)

        src_el = src_meta.get("sunElevationDeg")
        ref_el = ref_meta.get("sunElevationDeg")
        if src_el is not None and ref_el is not None:
            delta_elevation = round(abs(float(src_el) - float(ref_el)), 2)

    # Low confidence warning flag for challenging low-texture lunar regions
    confidence_warning = inlier_count < 10 or inlier_ratio < 0.15 or coverage_score < 0.15 or rmse > 3.0

    return {
        "rmse": round(rmse, 4),
        "inlierCount": inlier_count,
        "totalCandidateMatches": total_candidates,
        "inlierRatio": round(inlier_ratio, 4),
        "meanReprojectionError": round(mean_err, 4),
        "medianReprojectionError": round(median_err, 4),
        "coverageUniformityScore": round(coverage_score, 4),
        "processingTimeMs": round(processing_time_ms, 1),
        "sunAngleDeltaAzimuth": delta_azimuth,
        "sunAngleDeltaElevation": delta_elevation,
        "confidenceWarning": confidence_warning,
    }

def format_match_points_geojson(
    src_pts: np.ndarray,
    ref_pts: np.ndarray,
    residuals: np.ndarray
) -> Dict[str, Any]:
    """
    Formats match tie-points into GeoJSON FeatureCollection for frontend map/deep-zoom overlay.
    """
    features = []
    for i in range(len(ref_pts)):
        res = float(residuals[i]) if i < len(residuals) else 0.0
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(ref_pts[i][0]), float(ref_pts[i][1])],
            },
            "properties": {
                "id": i + 1,
                "sourceX": float(src_pts[i][0]),
                "sourceY": float(src_pts[i][1]),
                "referenceX": float(ref_pts[i][0]),
                "referenceY": float(ref_pts[i][1]),
                "reprojectionResidual": round(res, 4),
            },
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
    }

def compute_image_similarity_metrics(
    warped_img: np.ndarray,
    ref_img: np.ndarray
) -> Dict[str, Optional[float]]:
    """
    Computes SSIM, Mutual Information (MI), and PSNR between warped source and reference images.
    """
    try:
        w = warped_img.astype(np.float32)
        r = ref_img.astype(np.float32)
        if w.max() > 1.0:
            w = w / 255.0
        if r.max() > 1.0:
            r = r / 255.0

        if w.shape[:2] != r.shape[:2]:
            import cv2
            w = cv2.resize(w, (r.shape[1], r.shape[0]))

        mask = (w > 0.001) & (r > 0.001)
        if np.sum(mask) < 100:
            return {"ssim": None, "mutualInformation": None, "psnr": None}

        # 1. PSNR
        mse = np.mean((w[mask] - r[mask]) ** 2)
        if mse <= 1e-10:
            psnr = 99.0
        else:
            psnr = float(10 * np.log10(1.0 / mse))

        # 2. SSIM (Structural Similarity)
        try:
            from skimage.metrics import structural_similarity as ssim_fn
            ssim_val = float(ssim_fn(w, r, data_range=1.0))
        except Exception:
            mu_w = float(np.mean(w[mask]))
            mu_r = float(np.mean(r[mask]))
            sigma_w2 = float(np.var(w[mask]))
            sigma_r2 = float(np.var(r[mask]))
            sigma_wr = float(np.mean((w[mask] - mu_w) * (r[mask] - mu_r)))
            c1, c2 = 0.01 ** 2, 0.03 ** 2
            ssim_val = float(((2 * mu_w * mu_r + c1) * (2 * sigma_wr + c2)) / ((mu_w ** 2 + mu_r ** 2 + c1) * (sigma_w2 + sigma_r2 + c2)))

        # 3. Mutual Information via joint 2D histogram
        bins = 32
        hist_2d, _, _ = np.histogram2d(w[mask], r[mask], bins=bins)
        pxy = hist_2d / float(np.sum(hist_2d))
        px = np.sum(pxy, axis=1)
        py = np.sum(pxy, axis=0)
        px_py = px[:, None] * py[None, :]
        nz = (pxy > 0) & (px_py > 0)
        mi_val = float(np.sum(pxy[nz] * np.log2(pxy[nz] / px_py[nz])))

        return {
            "ssim": round(float(ssim_val), 4),
            "mutualInformation": round(float(mi_val), 2),
            "psnr": round(float(psnr), 2),
        }
    except Exception as e:
        logger.warning(f"Failed to compute similarity metrics: {e}")
        return {"ssim": None, "mutualInformation": None, "psnr": None}

def generate_difference_map(
    warped_src: np.ndarray,
    ref_img: np.ndarray
) -> np.ndarray:
    """
    Renders a remote sensing difference visualization (Panel 3) showing
    pixel-wise photometric residual & elevation displacement heatmap.
    Returns RGB uint8 image for web display.
    """
    import cv2
    w = warped_src.astype(np.float32)
    r = ref_img.astype(np.float32)
    if w.max() > 1.0:
        w = w / 255.0
    if r.max() > 1.0:
        r = r / 255.0

    if w.shape[:2] != r.shape[:2]:
        w = cv2.resize(w, (r.shape[1], r.shape[0]))

    diff = np.abs(w - r)
    diff_norm = np.clip(diff * 2.5, 0.0, 1.0)
    diff_uint8 = (diff_norm * 255).astype(np.uint8)
    diff_color = cv2.applyColorMap(diff_uint8, cv2.COLORMAP_TURBO)

    ref_gray = (r * 255).astype(np.uint8)
    if len(ref_gray.shape) == 2:
        ref_bgr = cv2.cvtColor(ref_gray, cv2.COLOR_GRAY2BGR)
    else:
        ref_bgr = ref_gray

    composite = cv2.addWeighted(diff_color, 0.65, ref_bgr, 0.35, 0)
    return composite
