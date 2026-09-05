"""
processing-service/app/pipeline/ingest.py
PDS4 / GeoTIFF image ingestion with windowed reads.
Blueprint §5 Stage 1 — use rasterio/GDAL to open PDS4 .img/.xml or GeoTIFF files
with windowed reads; never load a multi-GB raster fully into memory.
"""
from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.transform import Affine
from rasterio.windows import Window

logger = logging.getLogger(__name__)


@dataclass
class RasterDescriptor:
    """Lightweight metadata + on-demand pixel accessor for one image."""
    file_path: str
    width: int
    height: int
    band_count: int
    dtype: str
    crs: Optional[CRS]
    transform: Optional[Affine]
    # Metadata (from PDS4 label or GeoTIFF tags)
    sun_azimuth: Optional[float] = None
    sun_elevation: Optional[float] = None
    resolution_mpp: Optional[float] = None          # metres per pixel
    footprint_wkt: Optional[str] = None
    user_supplied_meta: dict = field(default_factory=dict)

    def read_window(self, window: Window, band: int = 1) -> np.ndarray:
        """
        Read a spatial window from disk.
        Always uses windowed I/O — never loads the full raster into RAM.
        """
        with rasterio.open(self.file_path) as ds:
            data = ds.read(band, window=window)
        return data.astype(np.float32)

    def read_overview(self, target_size: int = 1024) -> np.ndarray:
        """
        Read a downsampled overview for pyramid construction or quick preview.
        Uses rasterio's built-in overview/decimation — never loads full resolution.
        """
        with rasterio.open(self.file_path) as ds:
            scale = max(self.width, self.height) / target_size
            out_h = max(1, int(self.height / scale))
            out_w = max(1, int(self.width / scale))
            data = ds.read(
                1,
                out_shape=(out_h, out_w),
                resampling=rasterio.enums.Resampling.average,
            )
        return data.astype(np.float32)


# ── PDS4 label parsing ────────────────────────────────────────────────────────

# Common PDS4 namespace
_PDS4_NS = {
    "pds": "http://pds.nasa.gov/pds4/pds/v1",
    "ch2": "http://isro.gov.in/ch2",
    "geom": "http://pds.nasa.gov/pds4/geom/v1",
}


def _parse_pds4_label(xml_path: str) -> dict:
    """
    Parse a PDS4 XML label to extract sun angle, resolution, and spatial info.
    Returns an empty dict on any parse failure (caller falls back to user-supplied metadata).
    """
    meta: dict = {}
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Sun angles (geometry section)
        sun_az = root.find(".//geom:solar_azimuth", _PDS4_NS)
        sun_el = root.find(".//geom:solar_elevation", _PDS4_NS)
        if sun_az is not None and sun_az.text:
            meta["sun_azimuth"] = float(sun_az.text)
        if sun_el is not None and sun_el.text:
            meta["sun_elevation"] = float(sun_el.text)

        # Spatial resolution
        res_el = root.find(".//pds:pixel_resolution_x", _PDS4_NS)
        if res_el is not None and res_el.text:
            meta["resolution_mpp"] = float(res_el.text)

    except Exception as exc:
        logger.warning("PDS4 label parse failed — using user-supplied metadata: %s", exc)
    return meta


# ── Main ingest function ──────────────────────────────────────────────────────

def ingest_image(
    file_path: str,
    user_meta: Optional[dict] = None,
) -> RasterDescriptor:
    """
    Open a PDS4 .img/.xml or GeoTIFF file and return a RasterDescriptor.
    PDS4 metadata is parsed from the companion .xml label if present.
    Falls back to user-supplied metadata if parsing fails or label is absent.

    Args:
        file_path: Local path to the raster file (after download from S3).
        user_meta: User-supplied metadata dict with optional keys:
                   sun_azimuth, sun_elevation, resolution_mpp.

    Returns:
        RasterDescriptor with image metadata and windowed-read accessor.

    Raises:
        rasterio.errors.RasterioIOError: If the file cannot be opened.
    """
    user_meta = user_meta or {}
    pds4_meta: dict = {}

    # Look for companion PDS4 XML label (same stem, .xml extension)
    p = Path(file_path)
    xml_candidates = [p.with_suffix(".xml"), p.with_suffix(".XML")]
    for xml_path in xml_candidates:
        if xml_path.exists():
            pds4_meta = _parse_pds4_label(str(xml_path))
            logger.info("Parsed PDS4 label: %s", xml_path)
            break

    with rasterio.open(file_path) as ds:
        width = ds.width
        height = ds.height
        band_count = ds.count
        dtype = str(ds.dtypes[0])
        crs = ds.crs
        transform = ds.transform

        # Try to extract sun angle from GeoTIFF tags if not from PDS4 label
        if not pds4_meta.get("sun_azimuth"):
            tags = ds.tags()
            if "SUN_AZIMUTH" in tags:
                pds4_meta["sun_azimuth"] = float(tags["SUN_AZIMUTH"])
            if "SUN_ELEVATION" in tags:
                pds4_meta["sun_elevation"] = float(tags["SUN_ELEVATION"])

    # Merge: PDS4 > GeoTIFF tags > user-supplied (user as fallback)
    merged = {**user_meta, **pds4_meta}

    logger.info(
        "Ingested image: %s  [%dx%d, %d band(s), %s]",
        file_path, width, height, band_count, dtype,
    )

    return RasterDescriptor(
        file_path=file_path,
        width=width,
        height=height,
        band_count=band_count,
        dtype=dtype,
        crs=crs,
        transform=transform,
        sun_azimuth=merged.get("sun_azimuth"),
        sun_elevation=merged.get("sun_elevation"),
        resolution_mpp=merged.get("resolution_mpp"),
        user_supplied_meta=user_meta,
    )
