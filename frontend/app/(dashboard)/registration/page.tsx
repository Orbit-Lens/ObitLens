"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RegistrationPage() {
  const [viewportMode, setViewportMode] = useState<"tri-split" | "swipe" | "flicker">("tri-split");

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm">
      {/* BREADCRUMB & METRIC STATUS RIBBON */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded shadow-sm">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-mono-data-sm text-mono-data-sm">
            <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-secondary">Workspace</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary font-semibold">Registration</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Lunar Image Registration</h1>
            <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface font-mono-data-sm text-mono-data-sm font-semibold">
              REG-2024-CH2-9182
            </span>
          </div>
        </div>

        {/* Telemetry State Capsules */}
        <div className="flex flex-wrap items-center gap-space-xs font-mono-data-sm text-mono-data-sm">
          <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-[#ecfdf5] text-[#065f46] rounded">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="font-semibold tracking-wide uppercase font-label-caps text-label-caps">Alignment Converged</span>
            <span className="text-xs opacity-75">(L-M Optimized)</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container text-on-surface rounded">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">SSIM Index</span>
            <span className="font-semibold text-secondary">0.884</span>
            <span className="text-outline-variant">|</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">RMSE</span>
            <span className="font-semibold text-on-surface">0.72 px</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-primary-container text-on-primary rounded">
            <span className="material-symbols-outlined text-[14px] text-secondary-container">satellite_alt</span>
            <span className="font-mono-data-sm text-mono-data-sm">SPICE: CK/SPK Aligned</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE SPLIT: 3-PANEL VIEWPORT + RIGHT INSPECTOR DOCK */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* LEFT: THREE VIEWPORTS (9 COLS) */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col gap-space-md">
          {/* Controller Bar */}
          <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-space-xs rounded font-mono-data-sm text-mono-data-sm">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Multi-Viewport Mode</span>
              <div className="flex items-center bg-surface-container-highest rounded p-0.5">
                {(["tri-split", "swipe", "flicker"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewportMode(mode)}
                    className={`px-space-xs py-space-2xs rounded font-mono-data-sm text-mono-data-sm capitalize ${
                      viewportMode === mode
                        ? "bg-primary-container text-on-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {mode === "tri-split" ? "1:1:1 Tri-Split" : mode === "swipe" ? "Swipe Overlay" : "Flicker Blend"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary cursor-pointer hover:opacity-80">zoom_in</span>
              <span className="text-on-surface font-semibold">100% GSD</span>
              <span className="material-symbols-outlined text-[16px] text-secondary cursor-pointer hover:opacity-80">zoom_out</span>
              <span className="text-outline-variant">|</span>
              <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-on-surface">sync</span>
              <span>Synchronized Pan</span>
            </div>
          </div>

          {/* 3 Visualization Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
            {/* PANEL 1: REFERENCE FRAME */}
            <div className="flex flex-col bg-surface-container-lowest rounded shadow-sm overflow-hidden group">
              <div className="flex items-center justify-between px-space-sm py-space-xs bg-surface-container-high">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">1. REFERENCE FRAME</span>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface font-label-caps text-label-caps uppercase rounded">
                  OHRC (0.25 m/px)
                </span>
              </div>
              <div className="relative w-full aspect-square bg-primary overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/crater-terrain-reference.png"
                  alt="Lunar South Pole crater landscape reference frame"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 pointer-events-none p-space-xs flex flex-col justify-between font-mono-data-sm text-mono-data-sm text-inverse-on-surface bg-gradient-to-b from-primary/60 via-transparent to-primary/80">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/70 px-space-xs py-space-2xs rounded backdrop-blur-xs">Orbit: #1245 (Pass A)</span>
                    <span className="bg-secondary/80 text-on-secondary px-space-xs py-space-2xs rounded uppercase font-label-caps text-label-caps">Master Control</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col text-xs leading-tight">
                      <span className="text-secondary-fixed">Sub-solar: 85.2°S, 128.9°E</span>
                      <span className="text-surface-variant text-[10px]">Solar Elevation: 18.4°</span>
                    </div>
                    <div className="flex items-center gap-space-2xs bg-primary/80 px-space-xs py-space-2xs rounded">
                      <span className="material-symbols-outlined text-[13px] text-secondary-fixed">navigation</span>
                      <span className="font-bold">N</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-space-sm bg-surface-container-low flex flex-col gap-space-2xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Target Feature</span>
                  <span className="text-on-surface font-medium">Crater Rim Ridge</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Dynamic Range</span>
                  <span className="text-on-surface">14-bit Radiance</span>
                </div>
              </div>
            </div>

            {/* PANEL 2: SOURCE FRAME (WARPED) */}
            <div className="flex flex-col bg-surface-container-lowest rounded shadow-sm overflow-hidden group">
              <div className="flex items-center justify-between px-space-sm py-space-xs bg-surface-container-high">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">2. SOURCE (WARPED)</span>
                </div>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-secondary-container font-label-caps text-label-caps uppercase rounded font-semibold">
                  TMC-2 (Bicubic)
                </span>
              </div>
              <div className="relative w-full aspect-square bg-primary overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/crater-terrain-reference.png"
                  alt="Resampled and bicubically warped TMC-2 lunar impact crater top-down satellite view"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 pointer-events-none p-space-xs flex flex-col justify-between font-mono-data-sm text-mono-data-sm text-inverse-on-surface bg-gradient-to-b from-primary/60 via-transparent to-primary/80">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/70 px-space-xs py-space-2xs rounded backdrop-blur-xs">Resampled: 0.25m Grid</span>
                    <span className="bg-primary-container text-secondary-fixed px-space-xs py-space-2xs rounded uppercase font-label-caps text-label-caps">H-Matrix Active</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col text-xs leading-tight">
                      <span className="text-secondary-fixed">Gain Ratio: 1.042 (Matched)</span>
                      <span className="text-surface-variant text-[10px]">Affine Skew: 0.0041</span>
                    </div>
                    <span className="bg-primary/80 px-space-xs py-space-2xs rounded text-xs">Orbit 1245</span>
                  </div>
                </div>
              </div>
              <div className="p-space-sm bg-surface-container-low flex flex-col gap-space-2xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Interpolation</span>
                  <span className="text-on-surface font-medium">Bicubic Catmull-Rom</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Histogram Gain</span>
                  <span className="text-on-surface">Radiometrically Matched</span>
                </div>
              </div>
            </div>

            {/* PANEL 3: DIFFERENCE MAP */}
            <div className="flex flex-col bg-surface-container-lowest rounded shadow-sm overflow-hidden group">
              <div className="flex items-center justify-between px-space-sm py-space-xs bg-surface-container-high">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                  <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">3. DIFFERENCE MAP</span>
                </div>
                <span className="px-space-xs py-space-2xs bg-error-container text-on-error-container font-label-caps text-label-caps uppercase rounded font-semibold">
                  Residual &amp; Δ DEM
                </span>
              </div>
              <div className="relative w-full aspect-square bg-primary overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/difference-map-visualization.png"
                  alt="Elevation difference map overlay with rainbow residual gradient"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 pointer-events-none p-space-xs flex flex-col justify-between font-mono-data-sm text-mono-data-sm text-inverse-on-surface bg-gradient-to-b from-primary/60 via-transparent to-primary/80">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/70 px-space-xs py-space-2xs rounded backdrop-blur-xs">Schrödinger Basin DEM</span>
                    <span className="bg-secondary text-on-secondary px-space-xs py-space-2xs rounded uppercase font-label-caps text-label-caps">Δ -15m to +15m</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col text-xs leading-tight">
                      <span className="text-secondary-fixed">Vector Scale: 1px = 5.0m</span>
                      <span className="text-surface-variant text-[10px]">LRO NAC / Kaguya TC Ref</span>
                    </div>
                    <span className="bg-primary/80 px-space-xs py-space-2xs rounded text-xs font-bold">133.4°E</span>
                  </div>
                </div>
              </div>
              <div className="p-space-sm bg-surface-container-low flex flex-col gap-space-2xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Error Vectors</span>
                  <span className="text-on-surface font-medium">Horiz (Cyan) / Vert (Mag)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Residual Status</span>
                  <span className="text-secondary font-semibold">Max Divergence &lt; 2.4m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photogrammetric Layer Banner */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-secondary-fixed">
                <span className="material-symbols-outlined text-[24px]">layers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">Spatial Overlay Channels</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Configure layer blending opacity and false-color chromatic discrepancy maps</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <label className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm bg-surface-container px-space-sm py-space-xs rounded cursor-pointer">
                <input defaultChecked type="checkbox" className="w-3.5 h-3.5 accent-primary-container rounded" />
                <span>Displacement Vectors (3D)</span>
              </label>
              <label className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm bg-surface-container px-space-sm py-space-xs rounded cursor-pointer">
                <input defaultChecked type="checkbox" className="w-3.5 h-3.5 accent-primary-container rounded" />
                <span>Elevation Gradient (-15m/+15m)</span>
              </label>
              <label className="flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm bg-surface-container px-space-sm py-space-xs rounded cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-primary-container rounded" />
                <span>High-pass Edge Contours</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT: INSPECTOR DOCK (3 COLS) */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col gap-space-md">
          {/* SECTION A: TRANSFORMATION PARAMETERS */}
          <div className="bg-surface-container-lowest rounded shadow-sm overflow-hidden">
            <div className="px-space-md py-space-sm bg-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">transform</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">Transformation Parameters</span>
              </div>
              <span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">Planar 3×3</span>
            </div>
            <div className="p-space-md flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Homography Matrix (H)</span>
                  <span className="font-mono-data-sm text-mono-data-sm text-secondary font-medium">Normalized</span>
                </div>
                <div className="bg-surface-container-highest p-space-sm rounded font-mono-data-sm text-mono-data-sm text-on-surface select-all leading-relaxed">
                  <div className="flex justify-between">
                    <span>[&nbsp;&nbsp;0.98421</span>
                    <span>-0.01248</span>
                    <span className="font-semibold text-secondary">&nbsp;142.81&nbsp;]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>[&nbsp;&nbsp;0.01192</span>
                    <span>&nbsp;0.98390</span>
                    <span className="font-semibold text-secondary">-84.15&nbsp;]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>[&nbsp;-0.00001</span>
                    <span>&nbsp;0.00000</span>
                    <span>&nbsp;&nbsp;&nbsp;1.00&nbsp;]</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-xs font-mono-data-sm text-mono-data-sm">
                <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Scale Ratio</span>
                  <span className="font-bold text-on-surface mt-0.5">1 : 19.88</span>
                  <span className="text-[10px] text-on-surface-variant">(0.25m vs 5.0m)</span>
                </div>
                <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Azimuth Rot (θ)</span>
                  <span className="font-bold text-secondary mt-0.5">+0.712°</span>
                  <span className="text-[10px] text-on-surface-variant">Clockwise yaw</span>
                </div>
                <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Translation ΔX</span>
                  <span className="font-bold text-on-surface mt-0.5">+142.81 px</span>
                  <span className="text-[10px] text-on-surface-variant">+35.70 m lunar</span>
                </div>
                <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
                  <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Translation ΔY</span>
                  <span className="font-bold text-on-surface mt-0.5">-84.15 px</span>
                  <span className="text-[10px] text-on-surface-variant">-21.03 m lunar</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-mono-data-sm font-mono-data-sm p-space-xs bg-surface-container rounded">
                <span className="text-on-surface-variant">Shear Distortion:</span>
                <span className="font-bold text-on-surface">0.0041 <span className="text-xs font-normal text-on-surface-variant">(Near-zero affine)</span></span>
              </div>
            </div>
          </div>

          {/* SECTION B: QUALITY METRICS */}
          <div className="bg-surface-container-lowest rounded shadow-sm overflow-hidden">
            <div className="px-space-md py-space-sm bg-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">analytics</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">Quality &amp; Metrics</span>
              </div>
              <span className="px-space-xs py-space-2xs bg-[#ecfdf5] text-[#065f46] rounded font-label-caps text-label-caps uppercase font-semibold">91.4% Inliers</span>
            </div>
            <div className="p-space-md flex flex-col gap-space-sm font-mono-data-sm text-mono-data-sm">
              <div className="flex items-center justify-between pb-space-xs">
                <span className="text-on-surface-variant">Mean Reprojection Err:</span>
                <span className="font-bold text-on-surface">0.72 px <span className="text-xs text-secondary font-normal">(Sub-pixel verified)</span></span>
              </div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="text-on-surface-variant">Overall RMSE:</span>
                <span className="font-bold text-on-surface">1.04 px <span className="text-xs text-on-surface-variant font-normal">(~0.26 m ground)</span></span>
              </div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="text-on-surface-variant">Inlier Sample Consensus:</span>
                <span className="font-bold text-on-surface">842 / 921 points</span>
              </div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="text-on-surface-variant">Structural Similarity (SSIM):</span>
                <span className="font-bold text-secondary">0.884 <span className="text-xs bg-surface-container px-space-xs py-space-2xs rounded">EXCELLENT</span></span>
              </div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="text-on-surface-variant">Mutual Information (MI):</span>
                <span className="font-bold text-on-surface">1.42 bits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Peak SNR (PSNR):</span>
                <span className="font-bold text-on-surface">34.8 dB</span>
              </div>
            </div>
          </div>

          {/* SECTION C: RESIDUAL ERROR HISTOGRAM */}
          <div className="bg-surface-container-lowest rounded shadow-sm overflow-hidden flex flex-col">
            <div className="px-space-md py-space-sm bg-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">bar_chart</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">Residual Error Histogram</span>
              </div>
              <span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">Bin: 0.1 px</span>
            </div>
            <div className="p-space-md flex flex-col gap-space-xs">
              <div className="w-full h-36 relative bg-surface-container-lowest flex items-end pt-4 pb-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 280 90" preserveAspectRatio="none">
                  <line className="text-surface-variant" stroke="currentColor" strokeDasharray="2 2" strokeWidth="0.75" x1="0" x2="280" y1="18" y2="18" />
                  <line className="text-surface-variant" stroke="currentColor" strokeDasharray="2 2" strokeWidth="0.75" x1="0" x2="280" y1="45" y2="45" />
                  <line className="text-surface-variant" stroke="currentColor" strokeWidth="0.75" x1="0" x2="280" y1="72" y2="72" />
                  
                  <rect className="text-surface-variant fill-current" height="6" width="12" x="10" y="74" />
                  <rect className="text-surface-variant fill-current" height="12" width="12" x="25" y="68" />
                  <rect className="text-secondary-fixed-dim fill-current" height="25" width="12" x="40" y="55" />
                  <rect className="text-secondary-fixed-dim fill-current" height="40" width="12" x="55" y="40" />
                  <rect className="text-secondary fill-current" height="58" width="12" x="70" y="22" />
                  <rect className="text-secondary fill-current" height="70" width="12" x="85" y="10" />
                  <rect className="text-primary-container fill-current" height="74" width="12" x="100" y="6" />
                  <rect className="text-secondary fill-current" height="66" width="12" x="115" y="14" />
                  <rect className="text-secondary fill-current" height="52" width="12" x="130" y="28" />
                  <rect className="text-secondary-fixed-dim fill-current" height="36" width="12" x="145" y="44" />
                  <rect className="text-secondary-fixed-dim fill-current" height="22" width="12" x="160" y="58" />
                  <rect className="text-surface-variant fill-current" height="12" width="12" x="175" y="68" />
                  <rect className="text-surface-variant fill-current" height="7" width="12" x="190" y="73" />
                  <rect className="text-surface-variant fill-current" height="4" width="12" x="205" y="76" />
                  <rect className="text-surface-variant fill-current" height="2" width="12" x="220" y="78" />
                  
                  <line stroke="#ba1a1a" strokeDasharray="3 2" strokeWidth="1.5" x1="106" x2="106" y1="0" y2="80" />
                  <polygon fill="#ba1a1a" points="102,0 110,0 106,6" />
                </svg>
              </div>
              <div className="flex justify-between font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                <span>0.0 px</span>
                <span className="text-error font-semibold flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Mean: 0.72 px
                </span>
                <span>2.0 px</span>
              </div>
              <div className="p-space-xs bg-surface-container rounded text-body-sm font-body-sm text-on-surface-variant flex items-center gap-space-xs mt-space-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                <span>98.6% of matched tie-points fall within sub-pixel bounds (&lt; 1.5 px).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="mt-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm w-full md:w-auto">
          <Link href="/new-analysis" className="px-space-md py-space-xs bg-surface-container text-on-surface hover:bg-surface-container-high rounded font-body-md text-body-md flex items-center gap-space-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Tie-Points</span>
          </Link>
          <button className="px-space-md py-space-xs bg-surface-container text-on-surface hover:bg-surface-container-high rounded font-body-md text-body-md flex items-center gap-space-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Generate Verification Report</span>
          </button>
        </div>
        <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
          <button className="px-space-md py-space-xs bg-surface-container-high text-on-surface hover:bg-surface-variant rounded font-body-md text-body-md flex items-center gap-space-xs transition-colors">
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Result Session</span>
          </button>
          <button className="px-space-md py-space-xs bg-primary-container text-on-primary hover:bg-secondary rounded font-body-md text-body-md font-semibold flex items-center gap-space-xs shadow-sm transition-all hover:shadow">
            <span className="material-symbols-outlined text-[18px] text-secondary-fixed">download</span>
            <span>Export Registered GeoTIFF (COG)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* BATCH METADATA FOOTER TAG */}
      <div className="flex items-center justify-between px-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <div>Processing Seed: 0x9AF842BD | Sensor Radiance Rig: SAC/ISRO-CH2-08</div>
        <div>IAU/IAG Lunar Geodetic Frame 2000 | Ortho Engine: GDAL/RPC-V4</div>
      </div>
    </div>
  );
}
