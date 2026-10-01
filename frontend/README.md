# 🛰️ OrbitLens — Frontend Web Portal
### Smart India Hackathon (SIH) — Next.js 16 Scientific Workstation UI

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-Vercel%20Preview-blue?style=for-the-badge&logo=vercel)](https://obit-lens.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

---

## 🏛️ Special Evaluation Note for SIH Judges

> [!IMPORTANT]
> ### 🔍 Auto-Loaded Credentials for Easy Evaluation
> To facilitate your live review of the **OrbitLens Prototype**:
> - The official evaluator credentials (**Email** and **Password**) are **automatically pre-filled** on the login page.
> - Click **"Sign In to Analysis Workstation"** to immediately access the interactive mission console.
> - **Prototype Scope**: This deployment is an interactive functional prototype showcasing the UI architecture, sensor telemetry views, photogrammetry tools, and end-to-end user workflows. Production-grade multi-gigabyte satellite raster matching runs on backend GPU acceleration clusters.

---

## 🚀 Key Modules Included in this Frontend

- **`/dashboard`**: Mission overview, sensor telemetry streams, and active job status.
- **`/mission-archive`**: PDS4 imagery repository for Chandrayaan-2/3 (OHRC, TMC, IIRS).
- **`/new-analysis`**: Step-by-step registration job creation with customizable transform models (Homography / Affine) and pyramid levels.
- **`/registration`**: Side-by-side split canvas, interactive tie-point inspection, and tie-point vector overlay.
- **`/calibration`**: Ephemeris and solar geometry calibration (Sun azimuth, elevation, incidence angles).
- **`/results`**: Quantitative evaluation reports featuring RMSE, inlier ratios, and residual histograms.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the workstation locally.
