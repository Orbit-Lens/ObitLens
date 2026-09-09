---
name: Indian Lunar Remote Sensing & Image Analysis Portal
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#45464e'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#505e83'
  primary: '#00020a'
  on-primary: '#ffffff'
  primary-container: '#0b1b3d'
  on-primary-container: '#7684ac'
  inverse-primary: '#b7c6f1'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#050100'
  on-tertiary: '#ffffff'
  tertiary-container: '#301600'
  on-tertiary-container: '#c96d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b7c6f1'
  on-primary-fixed: '#0a1a3c'
  on-primary-fixed-variant: '#38466a'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  mono-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  mono-data-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  mono-data-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  gutter-canvas: 0.5rem
  panel-gap: 0.75rem
  table-row-compact: 1.75rem
---

## Brand & Style

The design system establishes a high-precision, mission-critical workspace engineered for planetary scientists, photogrammetrists, and space agency researchers operating under the Department of Space and ISRO.

### Brand Personality & Core Attributes
- **Authoritative & Institutional:** Grounded in national scientific sovereignty, absolute precision, and governmental reliability.
- **Instrument-Grade Functionalism:** Every pixel serves a data extraction, radiometric calibration, or orbital verification objective. Aesthetic ornamentation is stripped in favor of informational fidelity.
- **High-Density Usability:** Built to display multi-spectral band stacks, ephemeris vectors, radiometric histograms, and coordinate tables side-by-side without visual fatigue during prolonged analysis sessions.

### Visual Style Movement
The visual framework merges **Modern Aerospace Industrialism** with **Rigid Scientific Minimalism**:
- Operational frames, technical division lines (`1px` hairpins), and calibrated coordinate grids.
- High-contrast structural zoning: deep ISRO aerospace navy provides a command-center containment shell for top-level telemetries and global orbital status, while an ultra-clean, clinical light slate workspace houses the analytical raster viewports, vector overlays, and tabular data.

## Colors

The palette employs an operational high-contrast light-mode foundation for analytical workflows, anchored by authoritative deep-space navies and instrument-specific signal accents.

### Color Tokens & System Roles

#### Primary: Deep Aerospace Navy
- `#0B1B3D` (ISRO Deep Navy): Primary brand anchor, orbital frame controls, active navigation items, top-level system commands.
- `#060D1E`: Maximum-contrast text on light surfaces; deep fill for top flight bars and telemetry hubs.
- `#1E293B`: Primary scientific body text, secondary headers, active tab borders.

#### Secondary: Scientific Cobalt & Cerulean
- `#0284C7` (Scientific Sky Blue): Active vector paths, selected footprint polygons, active instrument state, focused inputs.
- `#0369A1` (Deep Cerulean): Hover states for interactive coordinate markers and secondary scientific action triggers.
- `#E0F2FE` (Cobalt Wash): Selection highlight for spectral band lists and data table rows.

#### Tertiary: Functional Accents (Telemetry, Trajectory, Status)
- `#D97706` (Payload Saffron / Amber): Solar elevation angles, threshold warnings, secondary orbit tracks, pending calibration status.
- `#10B981` (Telemetry Emerald): Ground station link active, downlink synchronised, nominal instrument sensor health.
- `#EF4444` (Optical Sensor Alert): Sensor saturation warning, missing telemetry packet, missing radiometric calibration file.

#### Neutrals: Clinical Scientific Workspace
- Canvas Background: `#F8FAFC` (Base workspace layer behind image manipulation canvases and dockable panels).
- Workspace Surface: `#FFFFFF` (Inspector panels, data sheet containers, metadata tables).
- Inactive Surfaces & Dividers: `#F1F5F9` (Sub-panel background, disabled field fill).
- Scientific Border Rules: `#E2E8F0` (Default panel divider), `#CBD5E1` (Active card border, table horizontal rule).

## Typography

The type system separates structured organizational hierarchies from quantitative scientific parameters.

### Role Division
- **Inter:** Powers UI framing, form labels, administrative contextual headers, and analytical tooltips. Selected for high legibility at micro sizes and uniform horizontal metrics across weights.
- **JetBrains Mono:** Dedicated exclusively to geodetic coordinates (lat/long degrees), radiometric values (DN, radiance, reflectance), orbit pass numbers, timestamp formats (UTC / IST), spacecraft ephemeris matrices, and product granule identifiers.

### Rules of Application
- All data table cells containing numbers, units of measure, coordinates, or hex IDs must render in `mono-data-md` or `mono-data-sm`.
- Section headers above instrument parameter clusters must use `label-caps` in uppercase format with secondary neutral color (`#64748B`).

## Layout & Spacing

The portal adheres to a **Dense Modular Grid System** tuned for multi-monitor scientific consoles, UHD displays (3840x2160), and enterprise workstations (1920x1080).

### Desktop-First Shell Layout
- **Mission Top Bar:** Fixed `44px` height. Houses the national emblem, mission identifier, live DSN uplink indicator, and UTC/IST mission clocks.
- **Primary Control Strip:** Fixed `48px` vertical left rail for global tool switches (footprint selector, band math, DEM 3D profile, radiometric calibration).
- **Workspace Split Layout:**
  - **Left Inspector Dock:** Variable width (320px to 420px), containing scene catalog search, instrument payload selection, and layer toggles.
  - **Center Viewport:** Fluid space for spatial map canvases, raster orthomosaics, or spectral slice visualizers.
  - **Right Telemetry / Analysis Dock:** Collapsible (360px), housing radiance profile charts, histogram stretch bars, and geodetic coordinate inspectors.
  - **Bottom Dock:** Collapsible multi-tab data drawer (`240px` nominal height) for spatial catalog query results and batch product downloads.

### Responsive Breakpoints
- **Ultra-Wide Workstation (≥1920px):** 3-column dock arrangement + central GIS canvas permanently visible.
- **Standard Desktop (1440px - 1919px):** Inspector dock and telemetry dock collapsible to compact icons (`48px`).
- **Field Terminal / Tablet (1024px - 1439px):** Single-dock layout with drawer overlay for coordinates and tabular results.
- **Below 1024px:** Portal enters read-only telemetry and data-search alert mode; analytical vector tools are gated.

## Elevation & Depth

This system avoids soft, consumer-grade drop shadows. Elevation is communicated through **structural boundary lines**, **tonal stacking**, and **crisp mechanical borders**.

### Elevation Scale
- **Level 0 (Analytical Base Canvas):** `#F8FAFC`. The foundational backdrop where GIS layers and raster arrays are plotted.
- **Level 1 (Dock Panels & Workspace Modules):** `#FFFFFF`, bounded by a `1px` solid outline of `#CBD5E1`.
- **Level 2 (Active Tool Floating Windows & Coordinate Overlays):** `#FFFFFF`, bounded by `1px` solid `#94A3B8`, reinforced with an ultra-tight technical shadow: `0px 2px 4px rgba(15, 23, 42, 0.08)`.
- **Level 3 (Modal Dialogs, Sensor Calibration Overlays):** `#FFFFFF` surface with a `1px` solid border of `#0B1B3D`, accompanied by an operational shadow: `0px 4px 12px rgba(11, 27, 61, 0.16)`.
- **Command Shell Tier (Header / Rail):** `#0B1B3D` solid fill. Separated from light scientific workspaces by a `1px` high-contrast baseline of `#0284C7`.

## Shapes

The design system uses a strict **Soft Industrial (`roundedness: 1`)** geometry to communicate technical discipline and spatial efficiency.

### Radius Assignments
- **Primary Buttons, Tool Badges, Dropdown Menus:** `0.25rem` (`4px`). Retains strict horizontal/vertical alignment lines.
- **Data Table Cells, Input Fields, Metric Cells:** `0.125rem` (`2px`) or square (`0px`) where bordered within continuous grid tables.
- **Floating Coordinate Chips & Status Dots:** Fully rounded (`9999px`) reserved strictly for live telemetry state pills (e.g., "ORBIT #4182 NOMINAL").
- **Corner Treatments:** Filleted radii must never exceed `0.5rem` (`8px`) on any analytical surface container.

## Components

### Buttons
- **Primary Command:** Solid `#0B1B3D` fill, white `#FFFFFF` text, `1px` border of `#0B1B3D`. Hover: `#0284C7`. Focus-visible: `2px` ring `#0284C7` with `1px` offset.
- **Secondary Tooling:** `#FFFFFF` background, `1px` solid `#CBD5E1`, text `#1E293B`. Hover: `#F1F5F9` background, border `#94A3B8`.
- **Critical Abort / Flush:** White background with `1px` solid `#EF4444`, text `#B91C1C`. Hover: `#FEF2F2`.
- **Metrics Action (Micro):** Height `24px`, padding `0 8px`, `mono-data-sm` typography.

### Input Fields & Filter Steppers
- **Text & Coordinate Fields:** Background `#FFFFFF`, `1px` solid `#CBD5E1`, internal height `28px` (compact) or `32px` (standard). Focus: border `#0284C7`, box-shadow `0 0 0 1px #0284C7`.
- **Coordinate Latitude/Longitude Twin Inputs:** Integrated border group with zero inner gap, separated by a vertical `1px` `#E2E8F0` divider. Leading label "LAT" / "LON" in `label-caps` on `#F1F5F9` backdrop.

### Chips & Telemetry Badges
- **Status Badges:** Height `20px`, padding `0 6px`, radius `2px`.
  - Nominal Telemetry: Background `#ECFDF5`, text `#065F46`, border `1px` solid `#A7F3D0`. Leading status dot: `6px` solid `#10B981`.
  - Calibration Warning: Background `#FFFBEB`, text `#92400E`, border `1px` solid `#FDE68A`.
  - Spectral Band Indicator: Background `#F1F5F9`, text `#0F172A`, border `1px` solid `#CBD5E1`, font `JetBrains Mono`.

### Data Tables (PDS4 / Planetary Data Standard)
- **Header:** Height `28px`, background `#F1F5F9`, text `#475569`, border-bottom `1px` solid `#CBD5E1`, uppercase `label-caps`.
- **Rows:** Alternating striping disallowed. Plain `#FFFFFF` rows, height `28px`, border-bottom `1px` solid `#E2E8F0`. Hover: background `#F8FAFC`. Selected: background `#E0F2FE` with a `2px` solid `#0284C7` left border indicator.
- **Values:** Right-aligned for radiometric numbers, left-aligned for product granule IDs, centered for band counts. All rendered in `JetBrains Mono`.

### Technical Instrument Cards
- Bounded by `1px` solid `#E2E8F0`, `#FFFFFF` surface, no default box shadow.
- Header block: Height `32px`, padding `0 12px`, `#F8FAFC` background with a bottom border of `1px` solid `#E2E8F0`. Displays instrument code (e.g., "TMC-2", "IIRS", "CLASS") on the left and sensor temperature status on the right.
- Card Body: Dense parameter grid layout with `space-sm` gaps, pairing `label-caps` titles with `mono-data-md` readouts.

### Checkboxes & Segmented Selectors
- **Checkboxes:** `14px x 14px`, `1px` border of `#64748B`, radius `2px`. Checked state: `#0B1B3D` fill with white mathematical checkmark.
- **Instrument Band Multi-Select:** Segmented horizontal pill arrays where active bands are indicated by `#0B1B3D` fill with white text, and inactive bands are outlined in `1px` `#CBD5E1` with `#64748B` text.