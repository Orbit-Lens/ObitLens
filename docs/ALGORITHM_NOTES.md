# OrbitLens — Algorithm Notes

> Living benchmark log. Update this file whenever you run the pipeline on real or synthetic image pairs.
> Document matcher parameters, observed metrics, and lessons learned.

---

## Benchmark Log

| Date | Image Pair | Matcher | Transform | Ratio Threshold | RANSAC Reproj. | Inlier Count | RMSE (px) | Coverage Score | Notes |
|---|---|---|---|---|---|---|---|---|---|
| — | synthetic_512x512_affine | classical-SIFT | affine | 0.75 | 3.0 | — | — | — | CI fixture baseline — fill after first run |

---

## Observations

### Classical Baseline (SIFT + RANSAC)

- Fast (CPU-only), suitable as a fallback when GPU is unavailable.
- Known weakness: low-texture / repetitive crater terrain produces many ambiguous matches — ratio-test threshold of 0.70–0.75 works better than the default 0.8 for lunar imagery.
- OHRC↔TMC (25cm vs 5m) requires pyramid matching; direct detection at native resolution rarely finds correspondences.

### LightGlue (learned, via kornia)

- MIT-licensed — safe for demo and research deployments.
- Significantly better inlier ratio under illumination/viewpoint variation vs SIFT.
- Requires CUDA for practical performance on real OHRC scenes (≥4GB VRAM recommended).
- Weights are bundled inside kornia — no manual download required.

---

## Open Items

- [ ] Run SIFT vs LightGlue comparison on an OHRC↔TMC image pair of the same region.
- [ ] Tune `coverageTargetCells` (default 64) for IIRS images (low resolution — fewer cells may be better).
- [ ] Benchmark TPS (thin-plate spline) warp vs homography on high-oblique TMC imagery.
