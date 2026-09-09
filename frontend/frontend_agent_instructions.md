# OrbitLens Frontend — Build Instructions (Agent Brief)
### Source of truth: the Stitch design export the user supplied (`design-reference.zip`)

This replaces the earlier speculative frontend brief. Everything below is extracted directly from
the design files the user generated in Stitch — exact hex colors, exact Tailwind config, exact
component markup, exact copy. **Treat `design-reference/` as ground truth.** Where this document
and your own judgment disagree with a `code.html` file, the `code.html` file wins.

```
design-reference/
├── DESIGN-SYSTEM.md          canonical design tokens (colors, type, spacing, components) — identical across all screens
├── 01-login/                 code.html + screen.png
├── 02-dashboard/             code.html + screen.png
├── 03-new-analysis/          code.html + screen.png
├── 04-registration/          code.html + screen.png
├── 05-datasets/              code.html + screen.png
└── assets/                   4 locally-saved images used by the designs (see §5)
```

Each `code.html` is a real, working, styled page (Tailwind via CDN + an inline `tailwind.config`) —
not a wireframe. Port it into the app's component structure directly rather than re-deriving the
layout from the screenshot.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS, configured with the **exact** `theme.extend` block below (do not invent new tokens — extend, don't replace) |
| Icons | Google **Material Symbols Outlined** (the designs already load this font/icon set — keep it, don't swap to lucide-react) |
| Fonts | **Inter** (UI/body) + **JetBrains Mono** (all numeric/scientific data) — both already wired via Google Fonts `<link>` tags in each `code.html` |
| State/data | React Query for polling job/pipeline status; Zustand or Context for session/auth |
| Charts | The designs hand-roll their bar chart and histogram as inline SVG (see `02-dashboard` and `04-registration`). Reproduce those SVGs faithfully for pixel parity; only move to Recharts if the data becomes dynamic enough that hand-rolled SVG stops scaling |
| Auth | Session cookie from the Node/Express backend; Next.js middleware guards everything except `/login` |

Backend contract (unchanged from the OrbitLens architecture report): Node/Express handles auth,
jobs, and the queue (Mongo + Redis/BullMQ); FastAPI runs the actual registration pipeline behind
the Node layer. The frontend talks only to the Node/Express REST API.

---

## 2. Design System — copy this into `tailwind.config.ts` verbatim

Pull the values from `design-reference/DESIGN-SYSTEM.md` / any `code.html`'s `<script id="tailwind-config">`
block — they are identical in every screen. Key points for the agent:

**Color roles** (Material Design 3 token naming — keep these names, they're used throughout every
`code.html` as Tailwind classes like `bg-primary-container`, `text-on-surface-variant`):
- `primary` `#00020A`, `primary-container` `#0B1B3D` (ISRO Deep Navy — header, sidebar, command shell)
- `secondary` `#006398`, `secondary-container` `#5BB8FE` (scientific cobalt — active states, links, focus rings)
- `tertiary-container` `#301600` / `on-tertiary-container` `#C96D00` (amber/saffron — warnings, solar/telemetry accents)
- `error` `#BA1A1A`, `error-container` `#FFDAD6`
- `surface` `#FAF8FF` (page background), `surface-container-lowest` `#FFFFFF` (cards/panels), `surface-container` / `-high` / `-highest` for nested surfaces
- `on-surface` `#131B2E` (body text), `on-surface-variant` `#45464E` (muted/secondary text)
- Functional accents used ad hoc in markup (not full M3 tokens, used as raw hex/arbitrary Tailwind values): `#10B981` (nominal/telemetry green), `#EF4444` (sensor alert red), `#0284C7` (scientific sky blue — hover/active vectors)

**Typography** — named type scale, not raw Tailwind sizes. Use the `font-*` / `text-*` utility pairs exactly as the designs do (e.g. `font-label-caps text-label-caps`):
| Token | Font | Size/Line/Weight | Use |
|---|---|---|---|
| `display-lg` | Inter | 32/40, 700 | Big dashboard stat numbers |
| `display-lg-mobile` | Inter | 24/32, 700 | Mobile equivalent |
| `headline-md` | Inter | 20/28, 600 | Page titles |
| `headline-sm` | Inter | 16/24, 600 | Card/section titles |
| `body-md` | Inter | 14/20, 400 | Default body |
| `body-sm` | Inter | 12/16, 400 | Secondary text, captions |
| `mono-data-lg` | JetBrains Mono | 14/20, 600 | Primary scientific readouts |
| `mono-data-md` | JetBrains Mono | 12/16, 500 | Table cells, coordinates, IDs |
| `mono-data-sm` | JetBrains Mono | 11/14, 400 | Micro telemetry tags |
| `label-caps` | Inter | 11/14, 600, +0.06em tracking | Uppercase section/field labels |

**Rule: any number, coordinate, timestamp, radiometric value, orbit ID, or hex/product ID renders in
a `mono-data-*` class. Everything else (labels, prose, nav) is Inter.** This distinction is used
consistently across all 5 screens and is core to the "instrument-grade" feel — don't blur it.

**Spacing scale** (use instead of raw Tailwind spacing where the designs do):
`space-2xs 0.125rem · space-xs 0.25rem · space-sm 0.5rem · space-md 0.75rem · space-lg 1rem · space-xl 1.5rem · space-2xl 2rem · gutter-canvas 0.5rem · panel-gap 0.75rem · table-row-compact 1.75rem`

**Radius:** `DEFAULT 0.125rem(2px) · lg 0.25rem(4px) · xl 0.5rem(8px) · full 0.75rem` — this system deliberately uses tight, near-square radii (2–8px), never large rounded corners. Buttons/dropdowns get `lg`; table cells/inputs get `DEFAULT` or square; status pills get `full`.

**Elevation:** no soft consumer drop-shadows. Depth comes from `1px` borders (`#E2E8F0` default, `#CBD5E1` active) and flat tonal stacking. The one shadow that does appear (`shadow-sm`/`shadow-md`/`shadow-xl` in the Tailwind CDN default scale) is used sparingly on top-level cards and the header bar only — don't add shadows to every card.

**Components** — button/input/chip/table specs are written out in full in `DESIGN-SYSTEM.md` §Components. Follow them exactly (e.g. primary button = solid `#0B1B3D` fill → hover `#0284C7`; status badges use a leading colored dot + tinted background + colored text, never a solid fill).

---

## 3. Global App Shell (build once, reuse on every authenticated page)

Extracted from `02-dashboard/code.html`, and identical in `03-new-analysis`, `04-registration`, `05-datasets`:

**Top header** — `fixed top-0 h-16`, `bg-primary-container` (navy), full width, `z-50`:
- Left: ISRO emblem (`assets/logo-emblem.png`), "Indian Lunar Remote Sensing" wordmark + a `PDS-4 NODE` badge chip, subtitle "Orbital Photogrammetry & Surface Analysis | ISRO / Department of Space"
- Center/right (hidden below `xl`): status chips — `Govt: DOS | ISRO`, `● DSN ONLINE` (pulsing green dot), `Mission: CHANDRAYAAN-3`, `Target: Lunar South Pole (89.9°S)`
- Far right: signed-in user name + role ("Dr. A. Sharma / Sr. Scientist, Remote Sensing") + avatar circle

**Left sidebar** — `fixed left-0 top-16 bottom-7 w-64`, `bg-primary-container`, scrollable nav grouped into 4 labeled sections (`label-caps` group headers), active item gets `bg-secondary text-on-secondary` (solid cobalt fill, not a border indicator — note this differs from a generic gov-site convention, follow the design as given):

```
WORKSPACE   Dashboard · New Analysis · Correspondence · Registration · Results
DATA        Datasets · Mission Archive · Processing History
METHODS     Analysis Methods · Calibration · Documentation
SYSTEM      Settings · Help
```

Each item has a Material Symbol icon (`dashboard`, `biotech`, `forum`, `app_registration`, `fact_check`, `dataset`, `inventory_2`, `manage_history`, `function`, `tune`, `menu_book`, `settings`, `help_center` respectively) and a `data-path` slug — use those slugs as your Next.js route segments.

**Bottom status bar** — `fixed bottom-0 h-7`, dark, full width, monospace: `ISRO Scientific Processing Node: SAC-AHM-LUNAR-04 | Node Status: ONLINE | Ephemeris Data: SPICE-CH2-DE421` on the left, `CRS: Lunar 2000 Sphere IAU/IAG | Latency: 28ms` on the right. Wire the latency/status values to a real health-check ping; keep the rest static or backend-sourced.

**Content area:** `pl-64 pt-16 pb-7`, `bg-surface`.

Build this as a single `<AppShell>` layout component; every route below renders inside it except `/login`.

---

## 4. Page-by-Page Spec

### 4.1 `/login` — source: `design-reference/01-login/`
Two-column card (`grid-cols-12`, left `col-span-7`, right `col-span-5`) inside a centered, rounded, shadowed container on a plain background — **not** the AppShell (no header/sidebar on this route).
- **Left column:** full-bleed background image (`assets/login-bg-lunar-south-pole.png`) with a navy gradient overlay. Floating telemetry chips top-left ("LUNAR REMOTE SENSING SYSTEM // CHANDRAYAAN", "PAYLOAD: OHRC / SAC"), a 2-cell telemetry data grid (GSD, Target Sector, CRS), a subtle center reticle graphic, and a bottom glass banner card with mission name + description.
- **Right column:** ISRO emblem + "RESTRICTED GOVERNMENT ACCESS • LEVEL-3" badge, "Lunar Image Analysis Portal" heading, subtitle "Government of India | Department of Space | ISRO SAC". Form fields: **Institutional Identifier / Official Email** (validated against `@isro.gov.in` / `@iisc.ac.in`, icon `badge`), **Digital Access Key / Cryptographic Password** (icon `key`, show/hide toggle, "Revoke / Reset" link), **Hardware Security Token / Smartcard PIN** (icon `pin`/RSA SecurID style, "Virtual Scrambler" link), a "Remember this scientific workstation (30-day hardware binding)" checkbox, primary button **"Sign In to Analysis Workstation"**, secondary **"Sign in with Gov e-Pramaan / Institutional SSO"**, an auth-gateway status line (TLS 1.3 | SHA-384, uptime %), and the legal notice: *"Unauthorized access to lunar spatial infrastructure is strictly prohibited under the Indian Space Policy & Cyber Security Directives."*
- Build all three inputs as real controlled fields; the "Virtual Scrambler"/hardware-token field can be a soft-launch stub (accepts input, not yet enforced) if 2FA hardware isn't wired up yet — don't silently drop it from the UI, since it's core to the design's "Level-3 government access" identity.

### 4.2 `/dashboard` — source: `design-reference/02-dashboard/`
Inside AppShell. Top-to-bottom:
1. Breadcrumb (`ISRO Portal / Workspace / Dashboard`) + page title "Analysis Dashboard" + description, plus right-aligned mission/SPICE/CRS context chips.
2. Navy **health banner**: `SYSTEM ONLINE (latency)`, `DATA CALIBRATED (radiometric level)`, `CUDA 12.4 ACCELERATION (4x A100 TENSOR)`, mission clock (UTC).
3. **4 stat cards** (grid, 1/2/4 cols responsive): Analyses Completed, Images Processed, Verified Matches, Mean Registration Error — each a `display-lg` mono number, an icon, and a small comparison/status line underneath.
4. **Photogrammetric Pipeline Activity** — a 30-day grouped bar chart (hand-rolled inline SVG, 3 series: OHRC / TMC-2 / IIRS) with a peak-day callout tag, plus an "Aggregate Band Alignment Rate" and "Co-registration Kernel" footnote.
5. **Instrument Coverage Ratio** card — horizontal stacked progress bars per instrument with scene counts and percentages, plus a small "Target Footprint Inspection" raster preview thumbnail (use `assets/crater-terrain-reference.png` as the placeholder raster).
6. **Recent Scientific Analysis Runs** table (Analysis ID, Ref/Source image, Sensor pair, Matches, Inlier ratio + mini progress bar, Error px, Status chip, Acquired date) with `ALL / COMPLETED / IN PROGRESS / CALIBRATED` segmented tab filter and pagination.
7. **Pipeline Telemetry Stream** — a live, dark, monospace, auto-scrolling log console (`LIVE` badge) with `Flush` / `Export Dump` controls, plus a small "Active Ephemeris Vector" readout card underneath (orbital altitude, ground velocity, sub-solar lat/lon, SPICE frame).

This page is data-dense; wire stat cards, the table, and the log stream to real endpoints first — the two chart/coverage widgets can ship on mocked data initially since they're secondary.

### 4.3 `/new-analysis` — source: `design-reference/03-new-analysis/`
This is the **job-creation + pipeline-configuration** screen (equivalent to "New Job" in the original IA) — it also inlines the pipeline-stage configuration that was previously spec'd as a separate step.
1. Breadcrumb + a 3-step workflow stepper: **01 Select Images (active) → 02 Configure Analysis (queued) → 03 Run Pipeline**, each step tagged with a live Pipeline ID / Node.
2. **Dual viewport comparison** (Frame A "Reference" / Frame B "Source"): each panel has an instrument badge (OHRC-CAM / TMC-2 STEREO), the raster image (`assets/crater-terrain-reference.png` placeholder), a scale-bar legend, a telemetry strip (orbit no., geographic target, sun angle, PDS product UID), and a micro-toolbar ("Change Frame", "View Metadata" / "Resample Grid", "Geometry: Stereo Nadir").
3. **Metadata & Geometry Comparison Matrix** — a table diffing Reference vs. Source on Center Latitude, Center Longitude, Solar Elevation, Solar Azimuth, Sensor Emission Angle, Geodetic Datum/CRS, each row ending in a Δ delta chip (green "within envelope" / amber "shadow parallax warning").
4. **Processing Configuration & Algorithm Pipeline** — three grouped panels matching the actual backend algorithm stages:
   - *Preprocessing:* checkboxes — Radiometric Normalization, Contrast Normalization (CLAHE, clip limit), Bilateral Filtering, Shadow Mask Exclusion (threshold).
   - *Feature Detection & Matching:* detector engine selector (SIFT / ORB / SuperPoint), tie-point engine (FLANN k-d / LightGlue / SuperGlue), feature point budget slider (1k–20k, default 5k "optimal"), sub-pixel refinement mode.
   - *Geometric Verification:* robust estimator (RANSAC / USAC / MAGSAC++), transformation model (Homography / Affine / Rigid SE2), numeric params (inlier error px, max iterations, confidence %), CUDA acceleration toggle.
5. Bottom sticky action bar: estimated runtime, allocated cluster, "Reset to Default ISRO Profile", primary button **"Run Correspondence Analysis"**.

Map the three configuration groups directly onto the backend's real pipeline options (feature extractor, matcher, RANSAC/USAC_MAGSAC, mode) documented in the OrbitLens architecture report — this screen **is** the form for that API payload.

### 4.4 `/registration` — source: `design-reference/04-registration/`
This is the **job-results / benchmark-report** screen (equivalent to the earlier "Report" page), reached after a pipeline run completes.
1. Breadcrumb + title "Lunar Image Registration" + `REG-####-CH#-####` ID chip, status line (`ALIGNMENT CONVERGED`, SSIM index, RMSE, `SPICE: CK/SPK Aligned`).
2. View-mode toolbar: `1:1:1 Tri-Split / Swipe / Flicker Blend`, zoom %, synchronized pan toggle.
3. **3-panel viewport row**: Reference Frame (master) / Source (Warped, resampled, H-matrix active) / Difference Map (residual & Δ DEM, elevation delta range, error vectors) — each with its own telemetry footer. Use `assets/difference-map-visualization.png` as the placeholder for panel 3's rendered diff map.
4. Below the viewports: a **Spatial Overlay Channels** control card — checkboxes for Displacement Vectors (3D), Elevation Gradient range, High-pass Edge Contours.
5. **Right inspector dock** (3 sections): Transformation Parameters (3×3 homography matrix readout, scale ratio, azimuth rotation, translation Δx/Δy, shear/distortion), Quality & Metrics (mean reprojection error, overall RMSE, inlier consensus count/ratio, SSIM, mutual information, PSNR), Residual Error Histogram (inline SVG bell-curve bar chart with a mean-marker line and a "% within sub-pixel" footnote).
6. Bottom action bar: **Back to Tie-Points**, **Generate Verification Report**, **Save Result Session**, **Export Registered GeoTIFF (COG)** — plus a metadata footer tag (processing seed, sensor radiance rig, geodetic frame, ortho engine).

Wire the transformation matrix, metrics panel, and histogram directly to the backend evaluation output (RMSE, inlier count/ratio, spatial coverage) described in the architecture report's benchmark section — this screen is that report's UI.

### 4.5 `/datasets` — source: `design-reference/05-datasets/`
The scene/granule **catalog and search** page (equivalent to the earlier "Data → Datasets" page).
1. Breadcrumb + title "Lunar Scientific Dataset Repository" + description, right-aligned SPICE/schema/sync status, "Harvest External PDS Nodes" and "Batch Download (n)" actions.
2. **Filter console**: free-text search bar (with a sample query chip like `CH2_OHRC_0421`), quick lat/lon bounding-box entry with a "Lock" button, and a multi-row filter matrix: Payload (All/OHRC/TMC-2/IIRS/LROC NAC/DFSAR), Pixel Scale (All/Ultra-High/Stereo DEM/Spectroscopy bands), Region Target (chips per named crater/basin), Mission Phase (dropdown).
3. **Split content**: left/center (~65%) a dense sortable results table — checkboxes, Dataset UID, thumbnail preview, Instrument/Mode, GSD, Raster Dim, Acquisition (UTC), Target Morphology, PDS Level — with a "Displaying N of M records | Selected: X (size)" pagination footer.
4. Right (~35%) **Dataset Inspector**: selected-record header (PDS-4 target, calibration level, product name/description), a raster preview with reticle overlay and hover action icons, a **PDS4 Orbital Telemetry** spec grid (orbit incidence, azimuth, emission, ephemeris kernel, reference datum, radiometric units, package format/size, radiometric DN spread mini-histogram), and actions: **Launch Analysis Workstation** (primary — should deep-link into `/new-analysis` with this granule pre-loaded as Frame A or B), **Open in 3D GIS**, **Export XML Bundle**.
5. Footer note: cartographic standard compliance line (NASA-PDS / ISRO Space Applications Centre spec version, projection, true scale, central meridian).

---

## 5. Assets

| File | Used for | Alt text in source markup |
|---|---|---|
| `assets/logo-emblem.png` | Header emblem (all pages) + login right-column emblem | "Emblem style logo icon for Indian Space Research Organisation lunar science mission..." |
| `assets/login-bg-lunar-south-pole.png` | Login page, left-column full-bleed background | "Lunar South Pole surface taken by Chandrayaan Orbital High Resolution Camera" |
| `assets/crater-terrain-reference.png` | Placeholder OHRC/TMC-2 raster imagery — dashboard footprint preview, New Analysis viewports, Datasets table thumbnails/inspector preview | orthorectified lunar crater terrain |
| `assets/difference-map-visualization.png` | Registration screen, Panel 3 "Difference Map" placeholder | scientific remote-sensing difference/alignment visualization |

All four are **placeholder art** carried over from the design tool (originally hot-linked to a
temporary `lh3.googleusercontent.com/aida-public/...` URL in each `code.html` — those URLs will
eventually expire). **Replace every such hot-linked URL with the corresponding local file from
`assets/`, served from `/public/images/`.** Once the backend can return a real rendered raster for
a given job/granule, swap these for the live image URL — keep the same `alt` text pattern for
accessibility and the same aspect ratio/crop behavior (`object-cover`, center-anchored).

---

## 6. Routes not covered by a supplied design

The sidebar nav (§3) references **Correspondence, Results, Mission Archive, Processing History,
Analysis Methods, Calibration, Documentation, Settings, Help** — no Stitch screen exists yet for
these. Build them later using the same AppShell + design tokens for visual consistency (dense
table/inspector layout, `mono-data` for all figures, navy/cobalt accenting), rather than inventing
a different style. Suggested minimum viable versions:
- **Results** — a filterable list of past `/registration` runs (reuse the Dashboard's "Recent Analysis Runs" table pattern, full-page).
- **Correspondence** — likely the raw tie-point/feature-match inspector referenced by Registration's "Back to Tie-Points" button; a table + viewport pairing similar to `04-registration`'s left column.
- **Processing History / Mission Archive** — table views, same pattern as Results/Datasets.
- **Settings / Help / Analysis Methods / Calibration / Documentation** — standard content/settings pages inside the AppShell; no scientific-data density required here.

Flag these to the user once built, since they were not part of the supplied design set and are
your (the agent's) extrapolation rather than a pixel-accurate port.

---

## 7. Build Order

1. Global design tokens (`tailwind.config.ts`) + font loading (Inter, JetBrains Mono, Material Symbols Outlined) from `DESIGN-SYSTEM.md`.
2. `<AppShell>` (header + sidebar + bottom status bar) per §3, ported from `02-dashboard/code.html`.
3. `/login`, standalone (no shell) — port `01-login/code.html` directly.
4. `/dashboard` — port `02-dashboard/code.html`; wire stat cards + table to real endpoints, chart/log stream can start mocked.
5. `/datasets` — port `05-datasets/code.html`; wire the catalog table to the granule/PDS4 search endpoint.
6. `/new-analysis` — port `03-new-analysis/code.html`; wire the 3 config panels to the job-submission payload.
7. `/registration` — port `04-registration/code.html`; wire matrix/metrics/histogram to the evaluation output for a completed job.
8. Asset swap (§5): replace all `lh3.googleusercontent.com` references with local `/public/images/` files.
9. Stub the remaining nav routes (§6).
