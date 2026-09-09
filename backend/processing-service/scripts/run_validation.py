import os
import sys
import json
import time
from datetime import datetime
from collections import defaultdict

# Ensure app is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.algorithms.pipeline.orchestrator import register_images
from app.algorithms.pipeline.modes import get_mode_config

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
PAIRS_FILE = os.path.join(DATA_DIR, "pairs.json")
REPORT_JSON = os.path.join(DATA_DIR, "validation_report.json")
REPORT_MD = os.path.join(DATA_DIR, "validation_report.md")

def run_validation(modes=("basic", "advanced")):
    if not os.path.exists(PAIRS_FILE):
        print(f"Error: {PAIRS_FILE} not found. Run ingest_datasets.py first.")
        sys.exit(1)

    with open(PAIRS_FILE, "r") as f:
        pairs = json.load(f)

    print("================================================================================")
    print("OrbitLens Validation Harness - Problem Statement Metrics Verification")
    print("================================================================================")
    print(f"Loaded {len(pairs)} pairs from registry ({sum(1 for p in pairs if p['has_ground_truth'])} synthetic, {sum(1 for p in pairs if not p['has_ground_truth'])} real)")

    results_by_mode = {}

    for mode in modes:
        print(f"\n---> Evaluating Mode: [{mode.upper()}] ...")
        mode_results = []

        for p in pairs:
            pair_id = p["pair_id"]
            src_path = p["source"]["crop_path"]
            ref_path = p["reference"]["crop_path"]
            scale_ratio = p.get("scale_ratio", 1.0)
            has_gt = p.get("has_ground_truth", False)
            tier = p.get("tier", "Unknown")

            config = get_mode_config(mode)
            config.scale_ratio = scale_ratio

            t0 = time.time()
            res = register_images(
                source_input=src_path,
                reference_input=ref_path,
                mode=mode,
                config=config
            )
            elapsed_sec = time.time() - t0

            rep = res.evaluation_report
            item = {
                "pair_id": pair_id,
                "tier": tier,
                "category": "synthetic" if has_gt else "real",
                "scale_ratio": scale_ratio,
                "rmse": rep.rmse,
                "inlier_count": rep.inlier_count,
                "inlier_ratio": rep.inlier_ratio,
                "spatial_coverage": rep.spatial_coverage,
                "raw_coverage": rep.raw_active_cell_fraction,
                "confidence_score": rep.confidence_score,
                "registration_success": rep.registration_success,
                "elapsed_sec": round(elapsed_sec, 2),
                "failure_reason": res.failure_reason,
            }
            mode_results.append(item)
            status_symbol = "[PASS]" if rep.registration_success else "[FAIL]"
            print(f"  {status_symbol} [{pair_id}] RMSE={rep.rmse:.3f}px | Inliers={rep.inlier_count} | Ratio={rep.inlier_ratio*100:.1f}% | Cov={rep.spatial_coverage*100:.1f}% | Time={elapsed_sec:.2f}s")

        results_by_mode[mode] = mode_results

    # Aggregate summaries
    summary = generate_summary(results_by_mode)
    
    # Save machine-readable JSON
    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    # Save human-readable Markdown report
    md_content = format_markdown_report(summary)
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(md_content)

    print("\n" + md_content)
    print(f"\nReports saved to:\n  JSON: {REPORT_JSON}\n  MD:   {REPORT_MD}")
    return summary

def generate_summary(results_by_mode):
    summary = {
        "timestamp": datetime.utcnow().isoformat(),
        "modes": {}
    }

    for mode, items in results_by_mode.items():
        mode_summary = {
            "overall": compute_tier_stats(items),
            "synthetic": compute_tier_stats([i for i in items if i["category"] == "synthetic"]),
            "real": compute_tier_stats([i for i in items if i["category"] == "real"]),
            "by_tier": {},
            "details": items
        }

        # By instrument tier
        tiers = set(i["tier"] for i in items)
        for t in sorted(tiers):
            tier_items = [i for i in items if i["tier"] == t]
            mode_summary["by_tier"][t] = compute_tier_stats(tier_items)

        summary["modes"][mode] = mode_summary

    return summary

def compute_tier_stats(items):
    if not items:
        return {
            "count": 0,
            "mean_rmse": 0.0,
            "mean_inliers": 0,
            "mean_inlier_ratio": 0.0,
            "mean_spatial_coverage": 0.0,
            "success_rate": 0.0,
            "success_count": 0,
        }

    count = len(items)
    successes = sum(1 for i in items if i["registration_success"])
    valid_rmse = [i["rmse"] for i in items if i["rmse"] < 100.0]

    return {
        "count": count,
        "mean_rmse": round(float(sum(valid_rmse) / len(valid_rmse)) if valid_rmse else 999.0, 4),
        "mean_inliers": round(float(sum(i["inlier_count"] for i in items) / count), 1),
        "mean_inlier_ratio": round(float(sum(i["inlier_ratio"] for i in items) / count), 4),
        "mean_spatial_coverage": round(float(sum(i["spatial_coverage"] for i in items) / count), 4),
        "success_rate": round(float(successes) / float(count), 4),
        "success_count": successes,
    }

def format_markdown_report(summary):
    lines = []
    lines.append("# OrbitLens Validation Report")
    lines.append(f"**Generated:** {summary['timestamp']}")
    lines.append("\n### Reconciled Problem Statement Targets (File 2 §3)")
    lines.append("- **RMSE:** <= 0.5 px (<= 1.0 px for scale ratio > 50:1)")
    lines.append("- **Inlier Count:** >= 100")
    lines.append("- **Inlier Ratio:** >= 75%")
    lines.append("- **Spatial Coverage:** >= 75% (entropy-normalized)")
    lines.append("- **Registration Success Rate:** >= 90% across registry (Synthetic & Real reported separately)")

    for mode, data in summary["modes"].items():
        lines.append(f"\n## Mode: `{mode.upper()}`")
        lines.append("\n| Dataset / Tier | Count | Mean RMSE (px) | Mean Inliers | Inlier Ratio | Spatial Coverage | Success Rate | Target Met? |")
        lines.append("|---|---|---|---|---|---|---|---|")

        # Synthetic row
        synth = data["synthetic"]
        synth_pass = synth["success_rate"] >= 0.90
        lines.append(f"| **Synthetic (Ground Truth)** | {synth['count']} | {synth['mean_rmse']:.3f} | {synth['mean_inliers']:.0f} | {synth['mean_inlier_ratio']*100:.1f}% | {synth['mean_spatial_coverage']*100:.1f}% | **{synth['success_rate']*100:.1f}%** | {'PASS' if synth_pass else 'FAIL'} |")

        # Real row
        real = data["real"]
        real_pass = real["success_rate"] >= 0.90
        lines.append(f"| **Real Cross-Modal (Self-Consistency)** | {real['count']} | {real['mean_rmse']:.3f} | {real['mean_inliers']:.0f} | {real['mean_inlier_ratio']*100:.1f}% | {real['mean_spatial_coverage']*100:.1f}% | **{real['success_rate']*100:.1f}%** | {'PASS' if real_pass else 'FAIL'} |")

        # By tier breakdown
        for tier_name, tstats in data["by_tier"].items():
            t_pass = tstats["success_rate"] >= 0.90
            lines.append(f"| tier: {tier_name} | {tstats['count']} | {tstats['mean_rmse']:.3f} | {tstats['mean_inliers']:.0f} | {tstats['mean_inlier_ratio']*100:.1f}% | {tstats['mean_spatial_coverage']*100:.1f}% | {tstats['success_rate']*100:.1f}% | {'PASS' if t_pass else 'FAIL'} |")

    return "\n".join(lines)

if __name__ == "__main__":
    modes_to_eval = sys.argv[1:] if len(sys.argv) > 1 else ["basic", "advanced"]
    run_validation(modes=modes_to_eval)
