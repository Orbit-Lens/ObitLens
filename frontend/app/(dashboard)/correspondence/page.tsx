"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface TiePoint {
  id: number;
  refX: number;
  refY: number;
  srcX: number;
  srcY: number;
  residualPx: number;
  isInlier: boolean;
}

const mockPairs = [
  {
    id: "PAIR-01",
    name: "CH2_OHRC_0421 ↔ CH2_TMC2_1187",
    refSensor: "OHRC (0.25 m/px)",
    srcSensor: "TMC-2 (5.0 m/px)",
    target: "Lunar South Pole (89.9°S, 180.0°E)",
    inliers: 842,
    total: 1146,
    ratio: 91.4,
    meanResidual: 0.48,
  },
  {
    id: "PAIR-02",
    name: "CH2_OHRC_0410 ↔ CH2_OHRC_0411",
    refSensor: "OHRC (0.25 m/px)",
    srcSensor: "OHRC (0.25 m/px)",
    target: "Connecting Ridge Crater Rim",
    inliers: 3120,
    total: 3450,
    ratio: 90.4,
    meanResidual: 0.39,
  },
  {
    id: "PAIR-03",
    name: "CH2_IIRS_0821 ↔ CH2_TMC2_1187",
    refSensor: "IIRS (Hyperspectral)",
    srcSensor: "TMC-2 (5.0 m/px)",
    target: "Shoemaker Crater Wall",
    inliers: 1208,
    total: 1320,
    ratio: 91.5,
    meanResidual: 0.54,
  },
];

const sampleTiePoints: TiePoint[] = [
  { id: 1, refX: 342.1, refY: 184.6, srcX: 341.6, srcY: 185.0, residualPx: 0.32, isInlier: true },
  { id: 2, refX: 512.4, refY: 220.8, srcX: 511.9, srcY: 221.4, residualPx: 0.41, isInlier: true },
  { id: 3, refX: 180.9, refY: 410.2, srcX: 182.5, srcY: 413.8, residualPx: 1.84, isInlier: false },
  { id: 4, refX: 680.3, refY: 340.5, srcX: 679.8, srcY: 340.9, residualPx: 0.28, isInlier: true },
  { id: 5, refX: 420.0, refY: 512.1, srcX: 419.6, srcY: 512.4, residualPx: 0.35, isInlier: true },
  { id: 6, refX: 790.2, refY: 160.4, srcX: 795.1, srcY: 168.2, residualPx: 2.15, isInlier: false },
  { id: 7, refX: 250.7, refY: 620.3, srcX: 250.2, srcY: 620.8, residualPx: 0.44, isInlier: true },
  { id: 8, refX: 610.5, refY: 710.0, srcX: 610.1, srcY: 710.3, residualPx: 0.26, isInlier: true },
];

export default function CorrespondencePage() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [filterMode, setFilterMode] = useState<"ALL" | "INLIERS" | "OUTLIERS">("ALL");
  const [showVectorOverlay, setShowVectorOverlay] = useState(true);
  const [matchThreshold, setMatchThreshold] = useState(0.75);

  const activePair = mockPairs[selectedPairIndex];
  const filteredPoints = sampleTiePoints.filter((pt) => {
    if (filterMode === "INLIERS") return pt.isInlier;
    if (filterMode === "OUTLIERS") return !pt.isInlier;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>Workspace</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Correspondence</span>
        </div>
        <div className="flex items-center gap-2 font-mono-data-sm text-mono-data-sm">
          <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface">
            MATCHER: <strong className="text-secondary">SIFT + FLANN k-d</strong>
          </span>
          <span className="px-space-xs py-space-2xs bg-surface-container-high rounded text-on-surface">
            USAC RANSAC: <strong className="text-[#065f46]">ACTIVE</strong>
          </span>
        </div>
      </div>

      {/* Header with Title and Action CTA */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            Tie-Point Feature Correspondence
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Inspect, filter, and calibrate tie-point correspondences between lunar multi-sensor image pairs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/new-analysis"
            className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Analysis Run</span>
          </Link>
        </div>
      </div>

      {/* Pair Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {mockPairs.map((pair, idx) => (
          <button
            key={pair.id}
            onClick={() => setSelectedPairIndex(idx)}
            className={`px-3 py-2 rounded-lg font-mono-data-sm text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedPairIndex === idx
                ? "bg-primary-container text-white border-primary shadow-xs"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-secondary-container">sync_alt</span>
            <span>{pair.name}</span>
          </button>
        ))}
      </div>

      {/* Telemetry & Metrics Ribbon for Selected Pair */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Verified Inliers</span>
          <div className="font-mono-data-lg text-display-lg text-on-surface font-bold mt-1">
            {activePair.inliers.toLocaleString()}
          </div>
          <span className="font-mono-data-sm text-xs text-[#065f46] font-semibold">
            {activePair.ratio}% of {activePair.total.toLocaleString()} total
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Mean Residual</span>
          <div className="font-mono-data-lg text-display-lg text-on-surface font-bold mt-1">
            {activePair.meanResidual.toFixed(2)} <span className="text-xs uppercase text-on-surface-variant">px</span>
          </div>
          <span className="font-mono-data-sm text-xs text-secondary font-semibold">
            Sub-pixel precision
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sensor Reference</span>
          <div className="font-mono-data-md text-on-surface font-bold mt-1 truncate">
            {activePair.refSensor}
          </div>
          <span className="font-mono-data-sm text-xs text-on-surface-variant">
            Base Coordinate Frame
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Target Footprint</span>
          <div className="font-mono-data-md text-on-surface font-bold mt-1 truncate">
            {activePair.target}
          </div>
          <span className="font-mono-data-sm text-xs text-secondary font-semibold">
            High Solar Elevation Shadow
          </span>
        </div>
      </div>

      {/* Main Correspondence Visualizer & Controls */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
        {/* Controls Toolbar */}
        <div className="p-space-md bg-surface-container-high/60 border-b border-surface-container flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps uppercase font-bold text-on-surface">Filter View:</span>
            {(["ALL", "INLIERS", "OUTLIERS"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-2.5 py-1 rounded font-mono-data-sm text-[11px] font-semibold transition-colors ${
                  filterMode === m
                    ? "bg-secondary text-white shadow-xs"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 font-mono-data-sm text-mono-data-sm text-on-surface">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showVectorOverlay}
                onChange={(e) => setShowVectorOverlay(e.target.checked)}
                className="w-4 h-4 accent-secondary rounded"
              />
              <span>Vector Overlay</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-xs">Lowe Ratio:</span>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(parseFloat(e.target.value))}
                className="w-20 accent-secondary cursor-pointer"
              />
              <span className="px-2 py-0.5 bg-surface-container rounded font-bold text-secondary text-xs">{matchThreshold}</span>
            </div>
          </div>
        </div>

        {/* Dual-Pane Imagery Inspection Canvas */}
        <div className="relative w-full h-[460px] bg-primary overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/20">
          {/* Reference Image Pane */}
          <div className="relative w-full h-full bg-black/90 flex flex-col">
            <Image
              src="/images/crater-terrain-reference.png"
              alt="Reference Lunar Frame"
              fill
              className="object-cover opacity-90"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-white font-mono-data-sm text-xs flex items-center gap-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span className="font-semibold">REF: CH2_OHRC_0421</span>
            </div>
            {showVectorOverlay && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {filteredPoints.map((pt) => (
                  <circle
                    key={`ref-${pt.id}`}
                    cx={`${(pt.refX / 900) * 100}%`}
                    cy={`${(pt.refY / 800) * 100}%`}
                    r="4"
                    fill={pt.isInlier ? "#10b981" : "#ef4444"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            )}
          </div>

          {/* Source Image Pane */}
          <div className="relative w-full h-full bg-black/90 flex flex-col">
            <Image
              src="/images/crater-terrain-reference.png"
              alt="Source Lunar Frame"
              fill
              className="object-cover opacity-80 filter brightness-110"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-white font-mono-data-sm text-xs flex items-center gap-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span className="font-semibold">SRC: CH2_TMC2_1187</span>
            </div>
            {showVectorOverlay && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {filteredPoints.map((pt) => (
                  <circle
                    key={`src-${pt.id}`}
                    cx={`${(pt.srcX / 900) * 100}%`}
                    cy={`${(pt.srcY / 800) * 100}%`}
                    r="4"
                    fill={pt.isInlier ? "#10b981" : "#ef4444"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Bottom Legend & Summary */}
        <div className="p-space-sm bg-surface-container-high/40 px-space-md flex flex-wrap items-center justify-between font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span>RANSAC Inliers ({sampleTiePoints.filter((p) => p.isInlier).length})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
              <span>Rejected Outliers ({sampleTiePoints.filter((p) => !p.isInlier).length})</span>
            </span>
          </div>
          <span className="text-secondary font-medium">Coordinate System: IAU_LUNAR_2000 (Orthographic)</span>
        </div>
      </div>

      {/* Tie-Point Correspondence Coordinates Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-space-md bg-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">table_view</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Tie-Point Coordinate Manifest ({filteredPoints.length} Points)
            </span>
          </div>
          <button
            type="button"
            onClick={() => alert("Exported tie-point table to CSV.")}
            className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-mono-data-sm text-xs flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data-sm text-mono-data-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-2.5 px-4">Point ID</th>
                <th className="py-2.5 px-4">Ref Coordinate (X, Y)</th>
                <th className="py-2.5 px-4">Src Coordinate (X, Y)</th>
                <th className="py-2.5 px-4">Residual Error</th>
                <th className="py-2.5 px-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {filteredPoints.map((pt) => (
                <tr key={pt.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-secondary">#TP-{String(pt.id).padStart(4, "0")}</td>
                  <td className="py-2.5 px-4 text-on-surface font-semibold">
                    ({pt.refX.toFixed(1)}, {pt.refY.toFixed(1)})
                  </td>
                  <td className="py-2.5 px-4 text-on-surface-variant">
                    ({pt.srcX.toFixed(1)}, {pt.srcY.toFixed(1)})
                  </td>
                  <td className="py-2.5 px-4 font-bold text-on-surface">
                    {pt.residualPx.toFixed(2)} px
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        pt.isInlier
                          ? "bg-[#ecfdf5] text-[#065f46]"
                          : "bg-[#fef2f2] text-[#991b1b]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pt.isInlier ? "bg-[#10b981]" : "bg-[#ef4444]"}`}></span>
                      {pt.isInlier ? "INLIER" : "OUTLIER"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
