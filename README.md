# 🛰️ OrbitLens — Indian Lunar Remote Sensing Portal
### Smart India Hackathon (SIH) — High-Precision Multi-Modal Image Registration & Photogrammetry Engine

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Preview-blue?style=for-the-badge&logo=vercel)](https://obit-lens.vercel.app)
[![ISRO Theme](https://img.shields.io/badge/Domain-Space%20Technology%20%7C%20ISRO%20SAC-orange?style=for-the-badge)](https://www.isro.gov.in)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/CV%20Engine-FastAPI%20%7C%20OpenCV-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

---

## 🏛️ Special Note for SIH Judges & Technical Evaluators

> [!IMPORTANT]
> ### 🔍 Live Prototype Preview & Evaluation Access
> Welcome, SIH Jury & Evaluators! To facilitate seamless evaluation of this solution without requiring any manual credential entry or external database setup:
>
> 1. **Auto-Filled Demonstration Credentials**: When opening the [Live Portal Preview](https://obit-lens.vercel.app), official scientific evaluator credentials (**Email** and **Security Key**) are **automatically pre-loaded** on the authentication screen.
> 2. **Instant One-Click Sign-In**: You can simply click **"Sign In to Analysis Workstation"** (or use the *"Load Default ISRO Research Credentials"* shortcut) to immediately enter the operational workstation.
> 3. **Interactive Offline Demo Mode**: If external cloud database nodes or high-performance GPU backends are idle or disconnected during evaluation, the portal automatically engages **Resilient Prototype Mode**, allowing full navigation across the **Mission Archive**, **Sensor Calibration Matrices**, **Feature Matching Viewers**, and **Quantitative Analytical Reports**.

> [!NOTE]
> **Prototype Scope & Production Roadmap**:  
> Please note that this web deployment serves as a **functional prototype and interactive architectural proof-of-concept (PoC)** demonstrating user workflows, sub-pixel feature extraction concepts, and UI/UX design. In the **full production implementation**, heavy multi-gigabyte PDS4/GeoTIFF raster processing, high-octave Gaussian pyramid bridging, and learned feature transformers (LoFTR/SuperPoint) are executed on dedicated on-premise GPU clusters at SAC/ISRO, integrated via distributed task queues.

---

## 🌌 Project Overview

**OrbitLens** addresses the critical challenge of **sub-pixel, multi-modal, scale-invariant, and illumination-invariant image correspondence** for lunar orbital imagery captured by India's Chandrayaan missions:
- **OHRC (Orbital High Resolution Camera)**: Ultra-high spatial resolution (~0.25 m/pixel).
- **TMC (Terrain Mapping Camera)**: Medium resolution stereoscopic coverage (~5.0 m/pixel).
- **IIRS (Imaging Infrared Spectrometer)**: Hyperspectral spatial bands (~80 m/pixel).

Due to extreme Sun elevation disparities (shadow inversions) and drastic resolution ratios (up to 20× scale variance), traditional matching algorithms fail. OrbitLens implements a robust, multi-stage photogrammetric registration and analysis pipeline.

---

## 🚀 Key Features Demonstrated in the Prototype

- **🛰️ Mission Archive & PDS4 Ingestion**: Interactive cataloging of Chandrayaan-2/3 polar and equatorial orbital passes with metadata parsing (Sun azimuth, incidence angle, ground sampling distance).
- **🔬 Multi-Scale Gaussian Pyramids**: Automated octave computation bridging extreme spatial scale ratios (0.25 m vs 5.0 m).
- **🌓 Illumination-Invariant Preprocessing**: Retinex log-domain gradient filtering and CLAHE radiometric normalization to eliminate shadow boundary bias.
- **🎯 Robust Geometric Correspondence**: High-density feature detection (SIFT / AKAZE / RootSIFT) paired with USAC-MAGSAC and RANSAC homography/affine estimation.
- **📊 Quantitative Evaluation & Metrics**: Automated computation of RMSE (reprojection residuals), inlier ratio, and spatial grid coverage uniformity scores.
- **🗺️ Interactive Photogrammetry Canvas**: Side-by-side split comparison, vector tie-point overlays, and difference composite maps.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   SIH Evaluator / UI   │
                                  │ (Next.js 16 App Router)│
                                  └───────────┬────────────┘
                                              │ (REST / JWT)
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │       OrbitLens Web Backend Engine        │
                        │    (Node.js + Express 5 + TypeScript)     │
                        └─────┬───────────────────────────────┬─────┘
                              │                               │
                ┌─────────────▼──────────┐      ┌─────────────▼────────────┐
                │     MongoDB Atlas      │      │       Redis Worker       │
                │  (Users, Metadata,     │      │   (Asynchronous Task     │
                │   Calibration Passes)  │      │     Orchestration)       │
                └────────────────────────┘      └─────────────┬────────────┘
                                                              │
                                                ┌─────────────▼────────────┐
                                                │   CV / ML Processing     │
                                                │ (FastAPI + OpenCV Headless)
                                                └─────────────┬────────────┘
                                                              │
                                                ┌─────────────▼────────────┐
                                                │  Object Storage (S3)     │
                                                │ (GeoTIFF / PDS4 Products)│
                                                └──────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Portal** | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Vanilla CSS design tokens |
| **API & Workflow** | Node.js 20+, Express 5, TypeScript, MongoDB Atlas, Redis |
| **Computer Vision Engine** | Python 3.11+, FastAPI, OpenCV Headless, NumPy, SciPy, Pillow, Tifffile |
| **Security & Standards** | JWT (access/refresh), SHA-256 integrity tokens, PDS4 XML label parsing |

---

## 🛠️ Local Development & Evaluation Setup

If you wish to run the complete workspace locally:

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (with venv)

### Installation & Execution
```bash
# 1. Clone repository
git clone https://github.com/Orbit-Lens/ObitLens.git
cd ObitLens

# 2. Install workspace dependencies
npm install
npm --prefix frontend install
npm --prefix backend/web-backend install

# 3. Launch the full environment concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Web Backend API**: `http://localhost:5000`
- **CV Processing Service**: `http://localhost:8000`

---

## 👥 Development Team

Developed with pride for the **Smart India Hackathon (SIH)** under the problem statement for **ISRO Space Applications Centre (SAC)**.
