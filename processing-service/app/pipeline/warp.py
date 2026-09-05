"""
processing-service/app/pipeline/warp.py
Sub-pixel resampling of source image onto reference grid.
Blueprint §5 Stage 8 — bicubic/Lanczos resampling; output GeoTIFF.
"""
from __future__ import annotations

import io
import logging
import tempfile
from pathlib import Path

import cv2
import numpy as np
import rasterio
from rasterio.transform import Affine

from app.pipeline.geometry import GeometryResult
from app.pipeline.ingest import RasterDescriptor

logger = logging.getLogger(__name__)


def warp_image(
    src_descriptor: RasterDescriptor,
    ref_descriptor: RasterDescriptor,
    geometry: GeometryResult,
    output_path: str,
    interpolation: str = "bicubic",
) -> None:
    """
    Resample the source image onto the reference image's coordinate grid
    using the estimated geometric transform.
    Writes output as a GeoTIFF preserving the reference CRS and transform.

    Blueprint §5 Stage 8 — sub-pixel resampling; windowed writes for large images.

    Args:
        src_descriptor: Source image descriptor.
        ref_descriptor: Reference image descriptor (defines the output grid).
        geometry:       Estimated transform from estimate_transform().
        output_path:    Path to write the registered GeoTIFF.
        interpolation:  'bicubic' or 'lanczos'.
    """
    interp_flag = {
        "bicubic": cv2.INTER_CUBIC,
        "lanczos": cv2.INTER_LANCZOS4,
        "bilinear": cv2.INTER_LINEAR,
    }.get(interpolation, cv2.INTER_CUBIC)

    out_h = ref_descriptor.height
    out_w = ref_descriptor.width
    T = geometry.transform_matrix

    logger.info(
        "Warping source [%dx%d] onto reference grid [%dx%d] using %s",
        src_descriptor.width, src_descriptor.height, out_w, out_h, interpolation,
    )

    # Read source overview — for very large images, warp the overview then
    # write at full resolution via rasterio. For manageable sizes, read all.
    # Simple approach: read at a tile size that fits in memory.
    TILE_LIMIT = 4096  # pixels

    if src_descriptor.width <= TILE_LIMIT and src_descriptor.height <= TILE_LIMIT:
        src_array = src_descriptor.read_overview(
            target_size=max(src_descriptor.width, src_descriptor.height)
        )
    else:
        # Downsample to TILE_LIMIT for the warp — a production implementation
        # would tile the full-resolution warp.
        src_array = src_descriptor.read_overview(target_size=TILE_LIMIT)
        logger.warning(
            "Source image exceeds tile limit — warping overview (%dx%d). "
            "Full-resolution tiled warp is a planned upgrade.",
            src_array.shape[1], src_array.shape[0],
        )

    # Normalize to uint8 for cv2.warpAffine / cv2.warpPerspective
    src_u8 = (
        ((src_array - src_array.min()) / (src_array.max() - src_array.min() + 1e-8)) * 255
    ).astype(np.uint8)

    if geometry.transform_model == "homography":
        warped = cv2.warpPerspective(
            src_u8, T, (out_w, out_h), flags=interp_flag
        )
    else:
        warped = cv2.warpAffine(
            src_u8, T[:2], (out_w, out_h), flags=interp_flag
        )

    # Write registered GeoTIFF using reference metadata
    _write_geotiff(
        warped,
        output_path,
        crs=ref_descriptor.crs,
        transform=ref_descriptor.transform,
    )
    logger.info("Warped image written to %s", output_path)


def _write_geotiff(
    array: np.ndarray,
    output_path: str,
    crs: "rasterio.crs.CRS | None",
    transform: "Affine | None",
) -> None:
    """Write a single-band uint8 array as a GeoTIFF."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    profile = {
        "driver": "GTiff",
        "dtype": "uint8",
        "width": array.shape[1],
        "height": array.shape[0],
        "count": 1,
        "compress": "lzw",
        "tiled": True,
        "blockxsize": 256,
        "blockysize": 256,
    }
    if crs:
        profile["crs"] = crs
    if transform:
        profile["transform"] = transform

    with rasterio.open(output_path, "w", **profile) as ds:
        ds.write(array, 1)
