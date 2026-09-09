import numpy as np
from app.algorithms.types import Image

def normalize_intensity(image: Image, method: str = "minmax") -> Image:
    """
    Normalizes intensity of image to float32 in [0, 1] without NaNs/Infs.
    """
    img = image.astype(np.float32)
    if method == "minmax":
        min_v = float(np.nanmin(img))
        max_v = float(np.nanmax(img))
        if max_v > min_v:
            norm = (img - min_v) / (max_v - min_v)
        else:
            norm = np.zeros_like(img)
    elif method == "zscore":
        mean_v = float(np.nanmean(img))
        std_v = float(np.nanstd(img))
        if std_v > 1e-6:
            z = (img - mean_v) / std_v
            # Clip to [-3, 3] and map to [0, 1]
            norm = (np.clip(z, -3.0, 3.0) + 3.0) / 6.0
        else:
            norm = np.zeros_like(img)
    else:
        norm = img

    return np.nan_to_num(np.clip(norm, 0.0, 1.0), nan=0.0, posinf=1.0, neginf=0.0)
