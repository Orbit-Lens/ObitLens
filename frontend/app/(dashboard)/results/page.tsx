"use client";

import { useState } from "react";
import Link from "next/link";

interface BenchmarkResult {
  id: string;
  refImage: string;
  srcImage: string;
  sensorPair: string;
  rmse: number;
  inlierRatio: number;
  ssim: number;
  transformModel: string;
  status: "PASSED" | "INLIER WARN" | "FAILED";
  runDate: string;
  durationMs: number;
}

const initialResults: BenchmarkResult[] = [
  {
    id: "REG-2024-CH2-9182",
    refImage: "CH2_OHRC_0421",
    srcImage: "CH2_TMC2_1187",
    sensorPair: "OHRC ↔ TMC-2",
    rmse: 0.52,
    inlierRatio: 92.4,
    ssim: 0.884,
    transformModel: "Homography (8 DOF)",
    status: "PASSED",
    runDate: "2024-10-08 14:24",
    durationMs: 4180,
  },
  {
    id: "REG-2024-CH2-9181",
    refImage: "CH2_OHRC_0410",
    srcImage: "CH2_OHRC_0411",
    sensorPair: "OHRC Mosaic",
    rmse: 0.39,
    inlierRatio: 95.1,
    ssim: 0.912,
    transformModel: "Affine (6 DOF)",
    status: "PASSED",
    runDate: "2024-10-07 20:10",
    durationMs: 3200,
  },
  {
    id: "REG-2024-CH2-9180",
    refImage: "CH2_IIRS_0821",
    srcImage: "CH2_TMC2_1187",
    sensorPair: "IIRS ↔ TMC-2",
    rmse: 0.68,
    inlierRatio: 88.5,
    ssim: 0.842,
    transformModel: "Homography (8 DOF)",
    status: "PASSED",
    runDate: "2024-10-07 16:45",
    durationMs: 5120,
  },
  {
    id: "REG-2024-CH3-9179",
    refImage: "CH3_LPDC_0019",
    srcImage: "CH2_OHRC_0389",
    sensorPair: "LPDC ↔ OHRC",
    rmse: 1.04,
    inlierRatio: 74.2,
    ssim: 0.805,
    transformModel: "Thin-Plate Spline",
    status: "INLIER WARN",
    runDate: "2024-10-06 11:30",
    durationMs: 7890,
  },
  {
    id: "REG-2024-CH2-9178",
    refImage: "CH2_TMC2_0940",
    srcImage: "LROC_NAC_M114",
    sensorPair: "TMC-2 ↔ LROC",
    rmse: 0.45,
    inlierRatio: 96.2,
    ssim: 0.895,
    transformModel: "Homography (8 DOF)",
    status: "PASSED",
    runDate: "2024-10-05 09:15",
    durationMs: 2940,
  },
];

export default function ResultsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filtered = initialResults.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.refImage.toLowerCase().includes(search.toLowerCase()) ||
      r.srcImage.toLowerCase().includes(search.toLowerCase()) ||
      r.sensorPair.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>Workspace</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Results Archive</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface">
          ARCHIVE SIZE: <strong className="text-secondary">{initialResults.length} Registrations</strong>
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            Registration Benchmark Archive
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Historical validation benchmarks, sub-pixel accuracy metrics, SSIM indices, and export packages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Exporting full benchmark catalog to CSV.")}
          className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Export Catalog</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Validated Runs</span>
          <span className="font-mono-data-lg text-display-lg text-on-surface font-bold mt-1">128</span>
          <span className="font-mono-data-sm text-xs text-[#065f46] font-semibold">100% PDS-4 Conforming</span>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Mean RMSE</span>
          <span className="font-mono-data-lg text-display-lg text-on-surface font-bold mt-1">
            0.52 <span className="text-xs font-normal text-on-surface-variant">px</span>
          </span>
          <span className="font-mono-data-sm text-xs text-secondary font-semibold">Ground scale: &lt; 0.15m</span>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Mean SSIM</span>
          <span className="font-mono-data-lg text-display-lg text-on-surface font-bold mt-1">0.887</span>
          <span className="font-mono-data-sm text-xs text-[#065f46] font-semibold">High Structural Match</span>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Mean Execution</span>
          <span className="font-mono-data-lg text-display-lg text-on-surface font-bold mt-1">
            3.8 <span className="text-xs font-normal text-on-surface-variant">sec</span>
          </span>
          <span className="font-mono-data-sm text-xs text-on-surface-variant">GPU-accelerated kernel</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by ID, sensor pair, or image name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 min-h-[44px] bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-mono-data-sm focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono-data-sm text-xs">
          <span className="text-on-surface-variant font-semibold mr-1">Status:</span>
          {(["ALL", "PASSED", "INLIER WARN", "FAILED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 min-h-[36px] rounded transition-colors ${
                filterStatus === s
                  ? "bg-primary-container text-white shadow-xs font-semibold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results View */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        {/* Mobile Stacked Card View (< md:) */}
        <div className="flex flex-col divide-y divide-surface-container/60 md:hidden p-2">
          {filtered.map((row) => (
            <div key={row.id} className="p-3 hover:bg-surface-container-low/40 transition-colors rounded-lg mb-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-bold text-secondary text-sm">{row.id}</div>
                  <div className="text-xs text-on-surface font-semibold">{row.sensorPair}</div>
                  <div className="text-[11px] text-on-surface-variant font-mono">{row.refImage} ↔ {row.srcImage}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    row.status === "PASSED"
                      ? "bg-[#ecfdf5] text-[#065f46]"
                      : "bg-[#fffbeb] text-[#92400e]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${row.status === "PASSED" ? "bg-[#10b981]" : "bg-[#f59e0b]"}`}></span>
                  {row.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 bg-surface-container-low px-2.5 rounded font-mono text-xs">
                <div>
                  <span className="text-on-surface-variant text-[10px] block">RMSE</span>
                  <span className="font-bold text-on-surface">{row.rmse.toFixed(2)} px</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] block">Inliers</span>
                  <span className="font-bold text-[#065f46]">{row.inlierRatio}%</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] block">SSIM</span>
                  <span className="font-bold text-on-surface">{row.ssim.toFixed(3)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-[11px] font-mono text-on-surface-variant">{row.runDate}</span>
                <Link
                  href="/registration"
                  className="px-3 py-2 min-h-[44px] bg-surface-container hover:bg-surface-container-high rounded text-xs font-semibold text-secondary hover:text-on-surface transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Inspect Report</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md:) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left font-mono-data-sm text-mono-data-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Sensor Pair</th>
                <th className="py-3 px-4">Ref ↔ Src Frame</th>
                <th className="py-3 px-4">RMSE</th>
                <th className="py-3 px-4">Inliers</th>
                <th className="py-3 px-4">SSIM</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Run Time</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-secondary">{row.id}</td>
                  <td className="py-3 px-4 font-semibold text-on-surface">{row.sensorPair}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                    {row.refImage} ↔ {row.srcImage}
                  </td>
                  <td className="py-3 px-4 font-bold text-on-surface">{row.rmse.toFixed(2)} px</td>
                  <td className="py-3 px-4 text-[#065f46] font-semibold">{row.inlierRatio}%</td>
                  <td className="py-3 px-4 text-on-surface">{row.ssim.toFixed(3)}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-[11px]">{row.transformModel}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        row.status === "PASSED"
                          ? "bg-[#ecfdf5] text-[#065f46]"
                          : "bg-[#fffbeb] text-[#92400e]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === "PASSED" ? "bg-[#10b981]" : "bg-[#f59e0b]"}`}></span>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant text-[11px]">{row.runDate}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href="/registration"
                      className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs font-semibold text-secondary hover:text-on-surface transition-colors inline-flex items-center gap-1"
                    >
                      <span>Report</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
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
