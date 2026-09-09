import os
import cv2
import numpy as np
from typing import Tuple, Dict, Any, Optional

def generate_synthetic_pair(
    base_image: Optional[np.ndarray] = None,
    width: int = 512,
    height: int = 512,
    angle_deg: float = 5.0,
    scale: float = 1.05,
    dx: float = 12.0,
    dy: float = -8.0,
    gamma: float = 1.25,
    gain: float = 0.9,
    noise_sigma: float = 4.0,
    is_homography: bool = False,
    random_seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Generates a ground-truthed synthetic image pair (File 1 §7.1, File 2 §1.4.1).
    Returns:
      (source_image, reference_image, ground_truth_matrix, metadata)
    """
    np.random.seed(random_seed)

    if base_image is None:
        # Generate synthetic lunar surface with craters and regolith
        ref_img = np.full((height, width), 120, dtype=np.uint8)
        # Regolith texture
        noise = np.random.normal(0, 7, (height, width))
        ref_img = np.clip(ref_img.astype(np.float32) + noise, 0, 255).astype(np.uint8)

        # Craters with sun-facing rims and shadows
        num_craters = 40
        for _ in range(num_craters):
            cx = np.random.randint(30, width - 30)
            cy = np.random.randint(30, height - 30)
            radius = np.random.randint(10, 48)

            cv2.circle(ref_img, (cx, cy), radius, 200, thickness=2)  # Bright rim
            cv2.circle(ref_img, (cx, cy), radius - 2, 60, thickness=-1)  # Deep shadow
            cv2.circle(ref_img, (cx + 3, cy + 2), max(2, radius // 2), 115, thickness=-1)  # Floor

        ref_img = cv2.GaussianBlur(ref_img, (3, 3), 0)
    else:
        if base_image.ndim == 3:
            ref_img = cv2.cvtColor(base_image, cv2.COLOR_BGR2GRAY)
        else:
            ref_img = base_image.copy()
        if ref_img.shape[:2] != (height, width):
            ref_img = cv2.resize(ref_img, (width, height), interpolation=cv2.INTER_AREA)

    h, w = ref_img.shape[:2]
    center = (w / 2.0, h / 2.0)

    if not is_homography:
        # Affine / Similarity Ground Truth
        M = cv2.getRotationMatrix2D(center, angle_deg, scale)
        M[0, 2] += dx
        M[1, 2] += dy
        gt_matrix = M  # 2x3

        # Warp reference to create source
        src_img = cv2.warpAffine(ref_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    else:
        # Homography Ground Truth (with subtle perspective tilt)
        pts_src_corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
        # Slight perspective offset
        p_offset = np.float32([
            [dx, dy],
            [w * scale + dx - 5, dy + 3],
            [w * scale + dx, h * scale + dy],
            [dx + 4, h * scale + dy - 2]
        ])
        H = cv2.getPerspectiveTransform(pts_src_corners, p_offset)
        gt_matrix = H  # 3x3

        src_img = cv2.warpPerspective(ref_img, H, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

    # Apply Photometric and Illumination Changes:
    # 1. Gain & Gamma shift: I_out = gain * (I_in ^ gamma)
    src_f = (src_img.astype(np.float32) / 255.0) ** gamma
    src_f = src_f * gain

    # 2. Add regolith sensor noise
    if noise_sigma > 0:
        sensor_noise = np.random.normal(0, noise_sigma / 255.0, src_f.shape)
        src_f = np.clip(src_f + sensor_noise, 0.0, 1.0)

    src_final = (src_f * 255.0).clip(0, 255).astype(np.uint8)

    meta = {
        "angle_deg": angle_deg,
        "scale": scale,
        "dx": dx,
        "dy": dy,
        "gamma": gamma,
        "gain": gain,
        "noise_sigma": noise_sigma,
        "is_homography": is_homography,
        "has_ground_truth": True,
    }

    return src_final, ref_img, gt_matrix, meta
