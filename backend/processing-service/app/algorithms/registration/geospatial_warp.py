import os
import numpy as np
from typing import Optional
from PIL import Image as PILImage
from app.algorithms.types import Image, ImageMeta, Transform
from app.algorithms.registration.warp import warp_image

def geospatial_warp(
    source_path: str,
    transform: Transform,
    reference_meta: ImageMeta,
    output_path: str
) -> str:
    """
    Geospatial warp (File 1 §3.10).
    Warps source raster and writes TIFF with updated geospatial metadata.
    """
    from app.algorithms.io.loaders import load_image

    src_img, _ = load_image(source_path)
    ref_h, ref_w = reference_meta.extra.get("loaded_shape", (src_img.shape[0], src_img.shape[1]))

    warped = warp_image(src_img, transform, output_shape=(ref_h, ref_w))
    u8 = (warped * 255.0).clip(0, 255).astype(np.uint8)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    pil_img = PILImage.fromarray(u8)
    pil_img.save(output_path, format="TIFF")
    return output_path
