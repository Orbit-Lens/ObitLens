# OrbitLens — Product Requirements Document (PRD)

**Project:** OrbitLens
**Subtitle:** Multi-modal, Sun-angle and Scale-Invariant Image Correspondence for Chandrayaan-2 Optical Imagery (OHRC, TMC, IIRS)
**Version:** 1.0
**Status:** Draft — for team review

---

## 1. Overview

OrbitLens is a full-stack platform that lets a user upload a **source (moving)** lunar image and a **reference (fixed)** lunar image — captured by different Chandrayaan-2 sensors (OHRC, TMC, IIRS) or at different times, sun angles, altitudes, and resolutions — and automatically finds accurate correspondences between them, registers the source image onto the reference image, and reports quantitative accuracy metrics.

The platform wraps a specialized computer-vision / deep-learning matching pipeline behind a web application so that ISRO scientists, students, and researchers can run registration jobs, visually inspect match points and the registered output, and export results without touching code.

## 2. Problem Statement

Lunar image registration aligns two or more images of the same lunar surface region into a common coordinate system. Chandrayaan-2 carries three optical payloads with very different characteristics:

| Sensor | Resolution | Notes |
|---|---|---|
| **OHRC** (Orbiter High Resolution Camera) | ~25 cm/pixel | Very high resolution, narrow swath |
| **TMC-2** (Terrain Mapping Camera) | ~5 m/pixel | Wide swath, stereo capable |
| **IIRS** (Imaging IR Spectrometer) | ~80 m/pixel | Hyperspectral / different spectral band, low spatial resolution |

Registering images across these sensors — and against reference datasets (e.g. LRO NAC/WAC mosaics) — is difficult because of:

- **Illumination variation** — different sun azimuth/elevation at capture time changes shadows and surface appearance, breaking classical intensity-based matching.
- **Viewpoint variation** — different orbit geometry causes shift, rotation, and perspective distortion.
- **Scale variation** — altitude and sensor resolution differences create large scale ratios (up to ~300x between OHRC and IIRS).
- **Multi-modal appearance** — panchromatic vs. spectral vs. stereo-derived imagery look fundamentally different even for the same terrain.
- **Featureless / repetitive terrain** — lunar regolith, craters of similar shape, and low texture regions confuse classical keypoint detectors.

## 3. Goals & Objectives

1. Build a **generic, sensor-agnostic** registration engine that works across OHRC↔TMC, OHRC↔IIRS, TMC↔IIRS, and any-sensor↔reference-mosaic pairs.
2. Achieve **sub-pixel accuracy** on the source image after registration.
3. Produce **spatially well-distributed** match points across the overlapping region (not clustered in one corner).
4. Provide **quantitative evaluation** of registration quality (RMSE, inlier count, inlier ratio, reprojection error).
5. Deliver an accessible **web UI** for uploading images, running jobs, visualizing matches/overlays, and exporting registered products.
6. Keep the system **modular** so new sensors, matching algorithms, or reference datasets can be added without re-architecting.

## 4. Target Users

- ISRO / planetary-science researchers validating and co-registering Chandrayaan-2 data products.
- Students and hackathon evaluators (this is framed as a problem-statement / hackathon-style deliverable) who need a demoable, generic solution.
- Downstream GIS/remote-sensing pipelines that consume registered products (mosaicking, change detection, DEM generation).

## 5. Key Technical Challenges (from problem statement)

| Challenge | Description | Mitigation approach |
|---|---|---|/*
| Illumination variation | Sun azimuth/elevation changes shadows and albedo appearance | Illumination-invariant / learned descriptors, phase-correlation on gradient or edge domain, histogram equalization, shadow-aware preprocessing |
| Viewpoint variation | Shift, rotation, perspective distortion from orbit geometry | Affine/homography estimation, RANSAC, optional orbit/pose metadata from PDS4 labels |
| Scale variation | Large resolution/altitude ratio between sensors | Multi-scale pyramid search, scale-invariant detectors (SIFT-family, learned scale-invariant descriptors), coarse-to-fine matching |
| Multi-modal appearance | Sensor-specific spectral/radiometric response | Modality-robust deep features (e.g., transformer-based dense matchers) trained/fine-tuned to be sensor-agnostic |
| Sparse texture / repetitive craters | Ambiguous local matches | Density-aware match selection, geometric consistency filtering, tie-point grid enforcement for uniform coverage |

## 6. Proposed Solution

A **two-tier architecture**:

1. **Web application (Node.js/TypeScript + React)** — job orchestration, auth, storage of imagery/metadata, visualization, metric dashboards, export.
2. **CV/ML processing service (Python)** — the actual registration pipeline: preprocessing → multi-scale feature detection/matching → outlier rejection (RANSAC) → geometric transform estimation (affine/homography/piecewise) → warping/resampling → metric computation.

The two tiers communicate over an internal REST/gRPC API and a job queue so large-image processing does not block the web tier.

### 6.1 Registration Pipeline (conceptual)

1. **Ingest & normalize** — parse PDS4 labels / GeoTIFF headers, extract sun angle, resolution, projection info; convert to a common working format.
2. **Preprocess** — radiometric normalization, optional shadow/illumination correction, denoising.
3. **Multi-scale pyramid construction** — build image pyramids to bridge the scale gap between sensors.
4. **Feature detection & description** — classical (SIFT/ORB/AKAZE) baseline plus a learned, illumination-robust matcher (e.g., SuperPoint+SuperGlue / LoFTR-style dense matcher) selectable per job.
5. **Cross-modal matching** — nearest-neighbor + ratio test, or dense matcher output, across scales.
6. **Outlier rejection** — RANSAC / MAGSAC with affine or homography model (or piecewise/TPS for local terrain relief).
7. **Uniform coverage enforcement** — grid-based non-maximum suppression so inliers are spread across the overlap region, not clustered.
8. **Transform estimation & warping** — compute final transform, resample source image onto reference grid (sub-pixel interpolation).
9. **Metric computation** — RMSE of inlier residuals, inlier count, inlier ratio, spatial distribution score, per-tie-point residual map.
10. **Product packaging** — registered image (GeoTIFF), match-point file (CSV/GeoJSON), metrics report (JSON/PDF).

## 7. Core Features (Functional Requirements)

- **Upload / ingest** source and reference images (OHRC/TMC/IIRS formats, GeoTIFF, PNG/JPEG for quick tests) with metadata (sun angle, sensor, resolution) auto-parsed where available or manually entered.
- **Job configuration** — choose matcher algorithm, transform model (affine/homography), scale range, and coverage-density target.
- **Async job execution** with progress/status polling and real-time updates (Socket.io) for long-running registrations.
- **Match point visualization** — interactive side-by-side / swipe / overlay viewer with match lines, inlier/outlier coloring, and a coverage heatmap.
- **Metrics dashboard** — RMSE, inlier count, inlier ratio, mean/median reprojection error, coverage-uniformity score, processing time.
- **Export** — registered image (GeoTIFF), match points (CSV/GeoJSON), and a metrics report (JSON/PDF) as a downloadable product bundle.
- **Job history** per user/project — re-run, compare, and archive previous registrations.
- **Batch mode** (stretch) — register a source image against a set of reference tiles/mosaic.
- **Admin/project view** — manage datasets, algorithms available, and usage across a team.

## 8. Non-Functional Requirements

- Handle large raster files (OHRC scenes can be multi-GB) via chunked/tiled processing — avoid loading whole image into memory naively.
- Sub-pixel registration accuracy target: **RMSE ≤ 1 pixel** (source resolution) on well-textured overlap regions; report actual achieved accuracy per job regardless.
- Horizontal scalability of the Python processing tier (stateless workers behind a queue).
- Reproducibility — every job stores the exact algorithm/version/parameters used.
- Security — same auth/session/OWASP hygiene as any production web app (see rewritten blueprint).
- Observability — structured logs + error tracking for both Node and Python tiers.

## 9. Tech Stack (high level — see `OrbitLens_PROJECT_BLUEPRINT.md` for full detail and the mandatory version-verification rule)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript, TanStack Query, Axios, an image/tile viewer (OpenSeadragon or a custom canvas/WebGL viewer), Recharts/Chart.js for metrics |
| Backend (orchestration API) | Node.js + Express + TypeScript, MongoDB (job/user/project metadata), Redis (queue), Socket.io (live job progress) |
| CV/ML processing service | Python (FastAPI), OpenCV, NumPy, PyTorch, rasterio/GDAL (PDS4/GeoTIFF I/O), a learned matcher (SuperPoint/SuperGlue or LoFTR-family), Celery or RQ worker consuming the shared Redis queue |
| Object storage | S3-compatible storage (AWS S3 / MinIO) for raw and registered raster products |
| Auth | JWT access/refresh, Google OAuth optional (pattern from base blueprint) |
| Deployment | Frontend → Vercel; Node API → Render/Railway; Python workers → containerized (Docker) on a GPU-capable host if using deep matchers; MongoDB Atlas; Redis managed instance |

## 10. System Architecture (description)

```
[React SPA] --Axios/JWT--> [Node/Express API] --queue jobs--> [Redis]
                                   |                              |
                             [MongoDB]                    [Python Worker Pool]
                                   |                     (FastAPI + OpenCV + PyTorch)
                                   |                              |
                             [Job/metric records]         [Object Storage: raw + registered images]
                                   ^                              |
                                   +---- results/metrics ---------+
[Socket.io] <--live progress-- [Node API] <--status callbacks-- [Python Worker]
```

- Node API never performs heavy image math itself — it authenticates, validates, stores metadata, enqueues jobs, and streams status/results.
- Python workers pull jobs, do all raster I/O and CV/ML work, write outputs to object storage, and post results/metrics back to the Node API (or directly to MongoDB via an internal service credential).

## 11. Data Sources & Formats

- **OHRC / TMC-2 / IIRS** Chandrayaan-2 Level products from ISSDC/PRADAN — typically PDS4-labeled `.img`/`.xml` or GeoTIFF derivatives.
- Optional **reference datasets**: LRO NAC/WAC global mosaics, Kaguya TC mosaics, or any georeferenced lunar basemap for absolute registration.
- Metadata of interest per image: sensor, acquisition time, sun azimuth/elevation, spatial resolution, projection/datum, footprint polygon.

## 12. Evaluation Metrics

| Metric | Definition |
|---|---|
| **RMSE** | Root-mean-square distance between transformed source tie-points and their matched reference points (sub-pixel target) |
| **Inlier count** | Number of matches surviving RANSAC/geometric verification |
| **Inlier ratio** | Inliers ÷ total candidate matches — measures matcher precision |
| **Coverage / distribution score** | Spatial uniformity of inliers across the overlap region (e.g., grid-cell occupancy or point-density variance) |
| **Reprojection error (per point)** | Residual per tie-point, used for outlier maps and QA |
| **Processing time** | End-to-end job latency, tracked for performance regression |

## 13. Deliverables (mapped to the original problem statement)

1. Working software (web app + processing engine) that finds correspondences between any two Chandrayaan-2 optical images (or against a reference mosaic).
2. A registered output product with the corresponding match points file.
3. An evaluation-metric report (RMSE, inlier count, inlier ratio, coverage score) per job.

## 14. Milestones / Suggested Roadmap

1. **M1 — Foundations:** repo scaffolding, auth, storage, basic upload/job UI (no real CV yet — mock pipeline).
2. **M2 — Classical baseline:** OpenCV SIFT/ORB + RANSAC affine registration working end-to-end for same-sensor pairs.
3. **M3 — Cross-sensor & scale handling:** multi-scale pyramid + cross-modal matching for OHRC↔TMC↔IIRS pairs.
4. **M4 — Illumination robustness:** add learned/illumination-invariant matcher; benchmark against classical baseline.
5. **M5 — Metrics, visualization & export:** full dashboard, coverage heatmap, product export.
6. **M6 — Hardening:** batch mode, performance tuning for large rasters, security/CI pass, documentation.

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Deep-learning matcher needs GPU / large models | Provide a classical fallback path (SIFT+RANSAC) that runs CPU-only; make matcher selectable |
| Very large raster files (multi-GB) | Tiled/streamed I/O with rasterio windows; never load full image into RAM |
| Sparse/ambiguous matches on low-texture terrain | Grid-enforced uniform sampling + geometric consistency filtering; surface a low-confidence warning to the user |
| PDS4 metadata parsing edge cases | Build a tolerant parser with manual metadata override in the UI |
| Scope creep beyond hackathon timeline | Ship classical baseline first (M1–M2) as a safe fallback demo |

## 16. Success Criteria

- End-to-end demo: upload an OHRC and a TMC image of the same region, get a registered output with match points and metrics in a reasonable time.
- Sub-pixel RMSE achieved and displayed for at least the same-sensor and one cross-sensor case.
- Match points visibly and measurably spread across the overlap region, not clustered.
- All results reproducible and exportable.

## 17. Glossary

- **OHRC / TMC / IIRS** — Chandrayaan-2 optical payloads (see §2).
- **RANSAC** — Random Sample Consensus, robust outlier rejection for geometric model fitting.
- **RMSE** — Root Mean Square Error.
- **Homography / Affine transform** — Geometric mappings used to warp the source image onto the reference frame.
- **PDS4** — Planetary Data System v4, the metadata/label standard used for planetary mission data.
