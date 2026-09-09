import os
import sys
import glob
import json
import xml.etree.ElementTree as ET

# Ensure app and tests are on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import cv2
import numpy as np
from tests.data_gen.synthetic_pairs import generate_synthetic_pair

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets"))
OUTPUT_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
PROCESSED_DIR = os.path.join(OUTPUT_DATA_DIR, "normalized")
SYNTHETIC_DIR = os.path.join(OUTPUT_DATA_DIR, "synthetic")

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(SYNTHETIC_DIR, exist_ok=True)

def parse_pds4_label(label_path):
    meta = {
        "product_id": None,
        "instrument": None,
        "resolution_mpp": None,
        "sun_azimuth_deg": None,
        "sun_elevation_deg": None,
        "acquisition_time_utc": None,
        "footprint": {}
    }
    try:
        tree = ET.parse(label_path)
        root = tree.getroot()
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
            elif "pixel_resolution" in tag or "spatial_resolution" in tag:
                try:
                    meta["resolution_mpp"] = float(text)
                except ValueError:
                    pass
            elif "sun_azimuth" in tag:
                try:
                    meta["sun_azimuth_deg"] = float(text)
                except ValueError:
                    pass
            elif "sun_elevation" in tag:
                try:
                    meta["sun_elevation_deg"] = float(text)
                except ValueError:
                    pass
            elif tag == "start_date_time":
                meta["acquisition_time_utc"] = text
            elif any(c in tag for c in ["upper_left_", "upper_right_", "lower_left_", "lower_right_"]):
                try:
                    meta["footprint"][tag] = float(text)
                except ValueError:
                    pass
    except Exception as e:
        print(f"Warning: could not parse {label_path}: {e}")
    return meta

def build_manifest():
    print(f"Scanning datasets in: {DATA_DIR}")
    manifest = []
    
    # Locate all browse PNGs and their companion labels
    browse_pngs = glob.glob(os.path.join(DATA_DIR, "**", "*b_*.png"), recursive=True)

    for png_path in browse_pngs:
        # Determine instrument
        p_lower = png_path.lower()
        if "ohr" in p_lower:
            instrument = "OHRC"
            default_res = 0.25
        elif "tmc" in p_lower:
            instrument = "TMC2"
            default_res = 5.0
        elif "iir" in p_lower:
            instrument = "IIRS"
            default_res = 82.70
        else:
            instrument = "UNKNOWN"
            default_res = 1.0

        # Find XML label
        base = os.path.splitext(png_path)[0]
        xml_candidates = [
            f"{base}.xml",
            f"{base}.XML",
            f"{base.replace('_b_brw_', '_d_img_')}.xml",
            f"{base.replace('_b_bot_', '_d_oth_')}.xml"
        ]
        label_path = None
        for c in xml_candidates:
            if os.path.exists(c):
                label_path = c
                break

        meta = parse_pds4_label(label_path) if label_path else {}
        prod_id = meta.get("product_id") or os.path.basename(base)

        # Extract normalized high-texture 512x512 crop for pipeline processing
        im = cv2.imread(png_path, cv2.IMREAD_GRAYSCALE)
        if im is None or im.size == 0:
            continue

        h, w = im.shape[:2]
        crop_h = min(512, h)
        crop_w = min(512, w)
        start_y = max(0, (h - crop_h) // 3)
        start_x = max(0, (w - crop_w) // 2)
        crop = im[start_y : start_y + crop_h, start_x : start_x + crop_w]

        # Ensure 512x512
        if crop.shape != (512, 512):
            crop = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_AREA)

        safe_id = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in prod_id[:30])
        converted_path = os.path.join(PROCESSED_DIR, f"{instrument}_{safe_id}.png")
        cv2.imwrite(converted_path, crop)

        entry = {
            "product_id": prod_id,
            "instrument": instrument,
            "raw_path": png_path,
            "label_path": label_path,
            "resolution_mpp": meta.get("resolution_mpp") or default_res,
            "sun_azimuth_deg": meta.get("sun_azimuth_deg"),
            "sun_elevation_deg": meta.get("sun_elevation_deg"),
            "footprint": meta.get("footprint", {}),
            "acquisition_time_utc": meta.get("acquisition_time_utc"),
            "bands": 1,
            "converted_path": converted_path
        }
        manifest.append(entry)

    manifest_path = os.path.join(OUTPUT_DATA_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest written with {len(manifest)} products to {manifest_path}")
    return manifest

def generate_synthetic_dataset_and_pairs(manifest):
    pairs = []

    ohrc_entries = [m for m in manifest if m["instrument"] == "OHRC"]
    tmc_entries = [m for m in manifest if m["instrument"] == "TMC2"]
    iirs_entries = [m for m in manifest if m["instrument"] == "IIRS"]

    # Base lunar crops from real instruments
    base_crops = []
    for e in ohrc_entries:
        im = cv2.imread(e["converted_path"], cv2.IMREAD_GRAYSCALE)
        if im is not None:
            base_crops.append(("OHRC", im))

    for e in tmc_entries:
        im = cv2.imread(e["converted_path"], cv2.IMREAD_GRAYSCALE)
        if im is not None:
            base_crops.append(("TMC2", im))

    if not base_crops:
        base_crops.append(("Synthetic", None))

    # Synthetic pairs per File 1 §7.1 & File 2 §1.4.1
    # Covers multiple tiers and scale ratios
    synthetic_configs = [
        # (tier_id, angle, scale, dx, dy, gamma, gain, noise_sigma, is_homo, scale_ratio, tier_name)
        ("SYNTH_OHRC_Affine_Easy", 3.0, 1.02, 8.0, -4.0, 1.08, 0.95, 1.5, False, 1.0, "OHRC-OHRC"),
        ("SYNTH_OHRC_Homography_Med", 5.0, 1.03, -12.0, 10.0, 1.20, 0.90, 2.0, True, 1.0, "OHRC-OHRC"),
        ("SYNTH_TMC_Affine_Med", 4.0, 0.98, 6.0, 12.0, 0.90, 1.05, 2.0, False, 1.0, "TMC-TMC"),
        ("SYNTH_OHRC_TMC_Scale20x", 2.5, 1.04, 4.0, 6.0, 1.15, 0.92, 1.5, False, 20.0, "OHRC-TMC"),
        ("SYNTH_OHRC_IIRS_Scale60x", 1.5, 1.02, 3.0, -2.0, 1.10, 0.95, 1.0, False, 60.0, "OHRC-IIRS"),
    ]

    for idx, (tier_id, angle, scale, dx, dy, gamma, gain, noise_sigma, is_homo, ratio, tier_name) in enumerate(synthetic_configs):
        inst_label, base_img = base_crops[idx % len(base_crops)]
        src, ref, gt_matrix, meta = generate_synthetic_pair(
            base_image=base_img,
            width=512,
            height=512,
            angle_deg=angle,
            scale=scale,
            dx=dx,
            dy=dy,
            gamma=gamma,
            gain=gain,
            noise_sigma=noise_sigma,
            is_homography=is_homo,
            random_seed=100 + idx
        )
        src_path = os.path.join(SYNTHETIC_DIR, f"{tier_id}_src.png")
        ref_path = os.path.join(SYNTHETIC_DIR, f"{tier_id}_ref.png")
        cv2.imwrite(src_path, src)
        cv2.imwrite(ref_path, ref)

        pairs.append({
            "pair_id": tier_id,
            "category": "synthetic",
            "tier": tier_name,
            "source": {"crop_path": src_path, "instrument": "OHRC"},
            "reference": {"crop_path": ref_path, "instrument": "OHRC" if ratio < 2.0 else ("TMC2" if ratio <= 20.0 else "IIRS")},
            "scale_ratio": ratio,
            "sun_angle_delta_deg": 12.0 * (idx + 1),
            "has_ground_truth": True,
            "ground_truth_transform": gt_matrix.tolist()
        })

    # Real cross-instrument pairs (self-consistency)
    if ohrc_entries and tmc_entries:
        pairs.append({
            "pair_id": "REAL_OHRC_TMC_01",
            "category": "real",
            "tier": "OHRC-TMC",
            "source": {"crop_path": ohrc_entries[0]["converted_path"], "instrument": "OHRC"},
            "reference": {"crop_path": tmc_entries[0]["converted_path"], "instrument": "TMC2"},
            "scale_ratio": 20.0,
            "sun_angle_delta_deg": abs((ohrc_entries[0]["sun_azimuth_deg"] or 268.8) - (tmc_entries[0]["sun_azimuth_deg"] or 101.5)),
            "has_ground_truth": False,
            "ground_truth_transform": None
        })

    if tmc_entries and iirs_entries:
        pairs.append({
            "pair_id": "REAL_TMC_IIRS_01",
            "category": "real",
            "tier": "TMC-IIRS",
            "source": {"crop_path": tmc_entries[0]["converted_path"], "instrument": "TMC2"},
            "reference": {"crop_path": iirs_entries[0]["converted_path"], "instrument": "IIRS"},
            "scale_ratio": 16.0,
            "sun_angle_delta_deg": abs((tmc_entries[0]["sun_azimuth_deg"] or 101.5) - (iirs_entries[0]["sun_azimuth_deg"] or 193.4)),
            "has_ground_truth": False,
            "ground_truth_transform": None
        })

    if ohrc_entries and iirs_entries:
        pairs.append({
            "pair_id": "REAL_OHRC_IIRS_01",
            "category": "real",
            "tier": "OHRC-IIRS",
            "source": {"crop_path": ohrc_entries[0]["converted_path"], "instrument": "OHRC"},
            "reference": {"crop_path": iirs_entries[0]["converted_path"], "instrument": "IIRS"},
            "scale_ratio": 320.0,
            "sun_angle_delta_deg": abs((ohrc_entries[0]["sun_azimuth_deg"] or 268.8) - (iirs_entries[0]["sun_azimuth_deg"] or 193.4)),
            "has_ground_truth": False,
            "ground_truth_transform": None
        })

    pairs_path = os.path.join(OUTPUT_DATA_DIR, "pairs.json")
    with open(pairs_path, "w", encoding="utf-8") as f:
        json.dump(pairs, f, indent=2)
    print(f"Generated {len(pairs)} pairs saved to {pairs_path}")

if __name__ == "__main__":
    manifest = build_manifest()
    generate_synthetic_dataset_and_pairs(manifest)
