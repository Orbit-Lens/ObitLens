"""
processing-service/app/pipeline/detectors/learned.py
LightGlue learned feature matcher via kornia.
Blueprint §5 — learned, illumination/modality-robust matcher; GPU-accelerated when USE_GPU=true.
License: LightGlue weights bundled in kornia are MIT-licensed — safe for research/demo use.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class LearnedMatchResult:
    """Dense correspondence result from LightGlue."""
    src_pts: np.ndarray    # shape [N, 2] — (x, y) in source image coords
    ref_pts: np.ndarray    # shape [N, 2] — (x, y) in reference image coords
    scores: np.ndarray     # shape [N]   — match confidence scores [0, 1]
    matcher_name: str


def match_learned(
    src_image: np.ndarray,
    ref_image: np.ndarray,
    use_gpu: bool = False,
    max_keypoints: int = 2048,
) -> LearnedMatchResult:
    """
    Run LightGlue via kornia to find dense correspondences between two images.
    Falls back to raising ImportError if kornia/torch are not installed —
    the caller (tasks.py) falls back to classical matching in that case.

    Args:
        src_image:    Float32 [H, W] source image, range [0, 1].
        ref_image:    Float32 [H, W] reference image, range [0, 1].
        use_gpu:      Use CUDA if available.
        max_keypoints: Maximum keypoints per image to feed to LightGlue.

    Returns:
        LearnedMatchResult with matched point arrays.

    Raises:
        ImportError: If kornia or torch are not installed.
        RuntimeError: If no matches found.
    """
    try:
        import torch
        import kornia.feature as KF
    except ImportError:
        raise ImportError(
            "kornia and torch are required for the learned matcher. "
            "Install with: pip install kornia torch torchvision"
        )

    device_str = "cuda" if (use_gpu and torch.cuda.is_available()) else "cpu"
    device = torch.device(device_str)
    logger.info("LightGlue matching on device: %s", device_str)

    def _to_tensor(img: np.ndarray) -> "torch.Tensor":
        """Convert HW float32 [0,1] to 1x1xHxW tensor for kornia."""
        t = torch.from_numpy(img).unsqueeze(0).unsqueeze(0).float()
        return t.to(device)

    src_t = _to_tensor(src_image)
    ref_t = _to_tensor(ref_image)

    # LightGlue via kornia (feature/lightglue)
    # kornia >= 0.7.2 ships LightGlue with SuperPoint backbone (MIT-licensed)
    extractor = KF.DISK.from_pretrained("depth").to(device)  # type: ignore[attr-defined]
    lightglue = KF.LightGlue("disk").to(device)              # type: ignore[attr-defined]

    with torch.no_grad():
        src_feats = extractor(src_t, n=max_keypoints)
        ref_feats = extractor(ref_t, n=max_keypoints)
        matches = lightglue({"image0": src_feats, "image1": ref_feats})

    src_kpts = src_feats["keypoints"][0].cpu().numpy()   # [N, 2]
    ref_kpts = ref_feats["keypoints"][0].cpu().numpy()   # [M, 2]
    match_indices = matches["matches"][0].cpu().numpy()   # [K, 2]
    match_scores = matches["scores"][0].cpu().numpy()     # [K]

    if len(match_indices) == 0:
        raise RuntimeError("LightGlue returned no matches")

    src_pts = src_kpts[match_indices[:, 0]]
    ref_pts = ref_kpts[match_indices[:, 1]]

    logger.info("LightGlue found %d matches", len(src_pts))

    return LearnedMatchResult(
        src_pts=src_pts,
        ref_pts=ref_pts,
        scores=match_scores,
        matcher_name="LightGlue-DISK-kornia",
    )
