"""
processing-service/app/pipeline/detectors/classical.py
Classical keypoint detection and description using OpenCV.
Blueprint §5 — SIFT / ORB / AKAZE detectors; CPU-only, fast baseline.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Literal

import cv2
import numpy as np

logger = logging.getLogger(__name__)

DescriptorType = Literal["SIFT", "ORB", "AKAZE"]


@dataclass
class KeypointResult:
    """Result of keypoint detection on one image."""
    keypoints: list[cv2.KeyPoint]
    descriptors: np.ndarray     # shape: [N, D]
    detector_type: str


def detect_and_describe(
    image: np.ndarray,
    detector_type: DescriptorType = "SIFT",
    max_keypoints: int = 8000,
) -> KeypointResult:
    """
    Detect keypoints and compute descriptors on a float32 [0,1] image.

    Args:
        image:         Float32 image [H, W], range [0, 1].
        detector_type: 'SIFT', 'ORB', or 'AKAZE'.
        max_keypoints: Maximum number of keypoints to retain.

    Returns:
        KeypointResult with keypoints and descriptors.
    """
    img_u8 = (image * 255).clip(0, 255).astype(np.uint8)

    if detector_type == "SIFT":
        # SIFT is now MIT-licensed in OpenCV 4.5+ (contrib not required for SIFT itself)
        detector = cv2.SIFT_create(
            nfeatures=max_keypoints,
            contrastThreshold=0.03,   # Lower than default for sparse lunar texture
            edgeThreshold=15,
        )
    elif detector_type == "ORB":
        detector = cv2.ORB_create(
            nfeatures=max_keypoints,
            scaleFactor=1.2,
            nlevels=8,
        )
    elif detector_type == "AKAZE":
        detector = cv2.AKAZE_create()
    else:
        raise ValueError(f"Unknown detector type: {detector_type}")

    keypoints, descriptors = detector.detectAndCompute(img_u8, None)

    if descriptors is None or len(keypoints) == 0:
        logger.warning(
            "No keypoints detected with %s — image may be featureless", detector_type
        )
        return KeypointResult(
            keypoints=[], descriptors=np.empty((0, 128), dtype=np.float32), detector_type=detector_type
        )

    # Sort by response and keep top N
    if len(keypoints) > max_keypoints:
        kp_sorted = sorted(
            zip(keypoints, range(len(keypoints))),
            key=lambda x: x[0].response,
            reverse=True,
        )[:max_keypoints]
        indices = [i for _, i in kp_sorted]
        keypoints = [keypoints[i] for i in indices]
        descriptors = descriptors[indices]

    logger.info(
        "Detected %d keypoints with %s", len(keypoints), detector_type
    )
    return KeypointResult(
        keypoints=keypoints,
        descriptors=descriptors.astype(np.float32),
        detector_type=detector_type,
    )
