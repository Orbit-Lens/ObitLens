# OrbitLens Validation Report
**Generated:** 2026-09-08T17:15:00.068592

### Reconciled Problem Statement Targets (File 2 §3)
- **RMSE:** <= 0.5 px (<= 1.0 px for scale ratio > 50:1)
- **Inlier Count:** >= 100
- **Inlier Ratio:** >= 75%
- **Spatial Coverage:** >= 75% (entropy-normalized)
- **Registration Success Rate:** >= 90% across registry (Synthetic & Real reported separately)

## Mode: `BASIC`

| Dataset / Tier | Count | Mean RMSE (px) | Mean Inliers | Inlier Ratio | Spatial Coverage | Success Rate | Target Met? |
|---|---|---|---|---|---|---|---|
| **Synthetic (Ground Truth)** | 5 | 0.305 | 3194 | 99.4% | 98.0% | **100.0%** | PASS |
| **Real Cross-Modal (Self-Consistency)** | 3 | 0.796 | 7 | 28.5% | 25.1% | **0.0%** | FAIL |
| tier: OHRC-IIRS | 2 | 0.712 | 2024 | 63.6% | 55.4% | 50.0% | FAIL |
| tier: OHRC-OHRC | 2 | 0.232 | 2792 | 99.6% | 98.6% | 100.0% | PASS |
| tier: OHRC-TMC | 2 | 0.489 | 1922 | 69.1% | 60.8% | 50.0% | FAIL |
| tier: TMC-IIRS | 1 | 0.666 | 6 | 18.8% | 37.5% | 0.0% | FAIL |
| tier: TMC-TMC | 1 | 0.380 | 2506 | 99.6% | 98.5% | 100.0% | PASS |

## Mode: `ADVANCED`

| Dataset / Tier | Count | Mean RMSE (px) | Mean Inliers | Inlier Ratio | Spatial Coverage | Success Rate | Target Met? |
|---|---|---|---|---|---|---|---|
| **Synthetic (Ground Truth)** | 5 | 0.319 | 3488 | 99.6% | 98.1% | **100.0%** | PASS |
| **Real Cross-Modal (Self-Consistency)** | 3 | 999.000 | 2 | 23.4% | 0.0% | **0.0%** | FAIL |
| tier: OHRC-IIRS | 2 | 0.296 | 2217 | 71.2% | 49.4% | 50.0% | FAIL |
| tier: OHRC-OHRC | 2 | 0.275 | 3073 | 99.7% | 98.6% | 100.0% | PASS |
| tier: OHRC-TMC | 2 | 0.314 | 2034 | 49.6% | 47.9% | 50.0% | FAIL |
| tier: TMC-IIRS | 1 | 999.000 | 3 | 27.3% | 0.0% | 0.0% | FAIL |
| tier: TMC-TMC | 1 | 0.436 | 2795 | 99.8% | 98.7% | 100.0% | PASS |