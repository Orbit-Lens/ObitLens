import os
import xml.etree.ElementTree as ET
from typing import Tuple, Dict, Any, Optional
import numpy as np
import cv2
from PIL import Image as PILImage
import tifffile

from app.algorithms.types import Image, ImageMeta

def parse_pds4_xml(xml_path: str) -> Dict[str, Any]:
    """
    Parses Chandrayaan-2 PDS4 XML label to extract sun angles, resolution, footprint, and product ID.
    Does not guess: leaves fields None if missing.
    """
    meta: Dict[str, Any] = {
        "sun_azimuth": None,
        "sun_elevation": None,
        "resolution_mpp": None,
        "product_id": None,
        "instrument": None,
        "footprint": None,
        "start_time": None,
        "stop_time": None,
    }
    if not os.path.exists(xml_path):
        return meta

    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        coords: Dict[str, float] = {}

        for elem in root.iter():
            tag = elem.tag.split("}")[-1].lower()
            text = (elem.text or "").strip()
            if not text:
                continue

            if tag == "logical_identifier":
                meta["product_id"] = text
                if "ohr" in text.lower():
                    meta["instrument"] = "OHRC"
                elif "tmc" in text.lower():
                    meta["instrument"] = "TMC2"
                elif "iir" in text.lower():
                    meta["instrument"] = "IIRS"

            elif "sun_azimuth" in tag or "solar_azimuth" in tag:
                try:
                    meta["sun_azimuth"] = float(text)
                except ValueError:
                    pass
            elif "sun_elevation" in tag or "solar_elevation" in tag:
                try:
                    meta["sun_elevation"] = float(text)
                except ValueError:
                    pass
            elif "pixel_resolution" in tag or "spatial_resolution" in tag:
                try:
                    meta["resolution_mpp"] = float(text)
                except ValueError:
                    pass
            elif tag == "start_date_time":
                meta["start_time"] = text
            elif tag == "stop_date_time":
                meta["stop_time"] = text
            elif any(c in tag for c in ["upper_left_", "upper_right_", "lower_left_", "lower_right_"]):
                try:
                    coords[tag] = float(text)
                except ValueError:
                    pass

        if coords:
            meta["footprint"] = coords
    except Exception:
        pass

    return meta

def load_image(path: str, max_dimension: Optional[int] = 4096) -> Tuple[Image, ImageMeta]:
    """
    Loads OHRC/TMC/IIRS/synthetic image regardless of format.
    Returns:
      (Image as float32 in [0, 1] single-band, ImageMeta dataclass)
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"Image not found at {path}")

    # Look for associated PDS4 XML label
    base_no_ext = os.path.splitext(path)[0]
    xml_candidates = [
        f"{base_no_ext}.xml",
        f"{base_no_ext}.XML",
        f"{path}.xml",
        f"{base_no_ext.replace('_d_img_', '_b_brw_')}.xml",
    ]
    parsed_xml: Dict[str, Any] = {}
    for c in xml_candidates:
        if os.path.exists(c):
            parsed_xml = parse_pds4_xml(c)
            break

    raw_arr = None
    driver = "opencv"
    bit_depth = 8

    # 1. Try tifffile if TIFF/GeoTIFF
    if path.lower().endswith((".tif", ".tiff")):
        try:
            raw_arr = tifffile.imread(path)
            driver = "tifffile"
        except Exception:
            pass

    # 2. Try OpenCV
    if raw_arr is None:
        try:
            raw_arr = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            driver = "opencv"
        except Exception:
            pass

    # 3. Try PIL
    if raw_arr is None:
        try:
            with PILImage.open(path) as pimg:
                raw_arr = np.array(pimg)
                driver = "pillow"
        except Exception:
            pass

    # 4. Fallback for raw binary .img / .qub if needed
    if raw_arr is None and path.lower().endswith((".img", ".qub")):
        # Read as memmap or raw binary bytes if header known, or try OpenCV raw
        try:
            raw_arr = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        except Exception:
            pass

    if raw_arr is None or raw_arr.size == 0:
        raise ValueError(f"Could not decode image at {path}")

    # Inspect bit depth & channels
    if raw_arr.dtype == np.uint16:
        bit_depth = 16
    elif raw_arr.dtype == np.uint8:
        bit_depth = 8
    elif np.issubdtype(raw_arr.dtype, np.floating):
        bit_depth = 32

    # Single-band conversion: if multi-band, take first band or luminance
    if raw_arr.ndim == 3:
        if raw_arr.shape[2] in (3, 4):
            # RGB/RGBA -> Luminance
            gray = cv2.cvtColor(raw_arr[:, :, :3], cv2.COLOR_BGR2GRAY)
        else:
            # Hyperspectral cube: default to representative NIR band (band 0 or center)
            gray = raw_arr[:, :, 0]
    else:
        gray = raw_arr

    # Downsample if image is excessively large for memory/latency safety
    orig_h, orig_w = gray.shape[:2]
    if max_dimension and (orig_h > max_dimension or orig_w > max_dimension):
        scale_factor = max_dimension / float(max(orig_h, orig_w))
        new_w = int(orig_w * scale_factor)
        new_h = int(orig_h * scale_factor)
        gray = cv2.resize(gray, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Normalize to float32 in [0.0, 1.0] without NaNs/Infs
    gray_float = gray.astype(np.float32)
    min_val = float(np.nanmin(gray_float))
    max_val = float(np.nanmax(gray_float))

    if max_val > min_val:
        normalized = (gray_float - min_val) / (max_val - min_val)
    else:
        normalized = np.zeros_like(gray_float, dtype=np.float32)

    normalized = np.nan_to_num(normalized, nan=0.0, posinf=1.0, neginf=0.0)

    meta = ImageMeta(
        path=os.path.abspath(path),
        driver=driver,
        crs=None,
        geotransform=None,
        sun_azimuth=parsed_xml.get("sun_azimuth"),
        sun_elevation=parsed_xml.get("sun_elevation"),
        resolution_mpp=parsed_xml.get("resolution_mpp"),
        bit_depth=bit_depth,
        instrument=parsed_xml.get("instrument"),
        extra={
            "product_id": parsed_xml.get("product_id"),
            "original_shape": (orig_h, orig_w),
            "loaded_shape": normalized.shape,
            "footprint": parsed_xml.get("footprint"),
        },
    )

    return normalized, meta
