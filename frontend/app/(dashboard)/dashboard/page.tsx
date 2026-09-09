"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "@/lib/auth";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS" | "CALIBRATED">("ALL");
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch("/api/v1/metrics/overview", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setMetricsData(res.data);
        }
      })
      .catch((err) => console.error("Error fetching metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const overview = metricsData?.overview || {
    totalCompletedJobs: 16,
    avgRmse: 0.565,
    avgInlierRatio: 0.921,
    avgInlierCount: 1749,
    totalImagesProcessed: 8,
    totalVerifiedMatches: 27980,
    meanRegistrationError: 0.53,
  };

  const sensorCoverage = metricsData?.sensorCoverage || [
    { sensor: "OHRC", count: 4, percentage: 50.0 },
    { sensor: "TMC-2", count: 2, percentage: 25.0 },
    { sensor: "IIRS", count: 1, percentage: 12.5 },
    { sensor: "LRO_NAC", count: 1, percentage: 12.5 },
  ];

  const activityDays = metricsData?.pipelineActivity30Days || [];
  const maxDayTotal = Math.max(...activityDays.map((d: any) => d.total || 0), 2);
  const peakDay = activityDays.reduce((prev: any, current: any) =>
    (current.total || 0) > (prev?.total || 0) ? current : prev,
    activityDays[0]
  );

  const fallbackRuns = [
    {
      id: "#ANL-2024-8921",
      refImage: "CH2_OHRC_0421",
      srcImage: "CH2_TMC2_1187",
      sensorPair: "OHRC / TMC-2",
      matches: "842 / 1,146",
      inlierRatio: 91.4,
      error: "0.72 px",
      status: "COMPLETED",
      statusColor: "bg-[#ecfdf5] text-[#065f46] dot-bg-[#10b981]",
      date: "2024-10-08 04:12",
    },
    {
      id: "#ANL-2024-8920",
      refImage: "CH2_IIRS_0821",
      srcImage: "CH2_TMC2_1187",
      sensorPair: "IIRS / TMC-2",
      matches: "1,208 / 1,320",
      inlierRatio: 91.5,
      error: "0.68 px",
      status: "CALIBRATED",
      statusColor: "bg-surface-container-high text-secondary dot-bg-secondary",
      date: "2024-10-07 22:15",
    },
    {
      id: "#ANL-2024-8919",
      refImage: "LROC_NAC_M114",
      srcImage: "CH2_TMC2_1187",
      sensorPair: "TMC-2 / LROC",
      matches: "2,410 / 2,522",
      inlierRatio: 95.5,
      error: "0.45 px",
      status: "VERIFIED",
      statusColor: "bg-surface-variant text-primary-container dot-bg-primary-container",
      date: "2024-10-07 19:08",
    },
    {
      id: "#ANL-2024-8918",
      refImage: "CH2_OHRC_0410",
      srcImage: "CH2_OHRC_0411",
      sensorPair: "OHRC Mosaic",
      matches: "3,120 / 3,450",
      inlierRatio: 90.4,
      error: "0.59 px",
      status: "COMPLETED",
      statusColor: "bg-[#ecfdf5] text-[#065f46] dot-bg-[#10b981]",
      date: "2024-10-07 14:50",
    },
  ];

  const recentRegistrations = (metricsData?.recentRegistrations?.length > 0)
    ? metricsData.recentRegistrations.map((job: any) => ({
        id: `#JOB-${job._id.slice(-6).toUpperCase()}`,
        refImage: job.referenceImageId?.name || "Ref Frame",
        srcImage: job.sourceImageId?.name || "Src Frame",
        sensorPair: `${job.referenceImageId?.sensor || "OHRC"} / ${job.sourceImageId?.sensor || "TMC-2"}`,
        matches: `${job.metrics?.inlierCount || 0} / ${job.metrics?.totalCandidateMatches || 0}`,
        inlierRatio: Math.round((job.metrics?.inlierRatio || 0) * 1000) / 10,
        error: `${(job.metrics?.rmse || 0.5).toFixed(2)} px`,
        status: job.status === "complete" ? "COMPLETED" : job.status.toUpperCase(),
        statusColor: job.status === "complete" ? "bg-[#ecfdf5] text-[#065f46] dot-bg-[#10b981]" : "bg-[#fffbeb] text-[#92400e] dot-bg-[#f59e0b]",
        date: new Date(job.createdAt).toISOString().replace("T", " ").slice(0, 16),
      }))
    : fallbackRuns;

  const filteredRuns = recentRegistrations.filter((run: any) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "COMPLETED") return run.status === "COMPLETED" || run.status === "VERIFIED";
    if (activeTab === "IN_PROGRESS") return run.status === "IN PROGRESS" || run.status === "QUEUED";
    if (activeTab === "CALIBRATED") return run.status === "CALIBRATED";
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-2xl">
      {/* Top Operational Context Strip & Breadcrumb */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pt-space-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
            <span>ISRO Portal</span>
            <span>›</span>
            <span>Workspace</span>
            <span>›</span>
            <span className="text-secondary font-semibold">Dashboard</span>
          </div>
          <div className="flex items-baseline gap-space-md mt-space-2xs">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Analysis Dashboard
            </h1>
            <span className="hidden md:inline font-body-sm text-body-sm text-on-surface-variant">
              Monitor lunar image correspondence, photogrammetric registration, scientific processing and multi-sensor analysis.
            </span>
          </div>
        </div>

        {/* Quick Ephemeris & Node Badge Group */}
        <div className="flex items-center flex-wrap gap-space-xs font-mono-data-sm text-mono-data-sm">
          <span className="px-space-sm py-space-2xs bg-surface-container-high rounded text-on-surface font-medium flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[15px] text-secondary">
              satellite_alt
            </span>
            <span>CHANDRAYAAN-3 &amp; CH-2 TMC-2/OHRC</span>
          </span>
          <span className="px-space-sm py-space-2xs bg-surface-container-high rounded text-on-surface-variant">
            SPICE: <strong className="text-on-surface font-semibold">de421 / ch2_v02</strong>
          </span>
          <span className="px-space-sm py-space-2xs bg-surface-container rounded text-on-surface-variant">
            CRS: <strong className="text-on-surface">IAU_LUNAR_2000</strong>
          </span>
        </div>
      </div>

      {/* Top Real-Time Scientific Health Banner */}
      <div className="bg-primary-container text-inverse-on-surface rounded-xl p-space-md shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-y-space-xs gap-x-space-lg font-mono-data-sm text-mono-data-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="font-semibold text-inverse-on-surface">SYSTEM ONLINE</span>
            <span className="text-on-primary-container text-body-sm">(LATENCY 24ms)</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-primary/60"></div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            <span className="font-semibold text-inverse-on-surface">DATA CALIBRATED</span>
            <span className="text-on-primary-container text-body-sm">(RADIOMETRIC LEVEL-2B)</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-primary/60"></div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span className="font-semibold text-inverse-on-surface">CUDA 12.4 ACCELERATION</span>
            <span className="text-on-primary-container text-body-sm">(4x A100 TENSOR)</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm font-mono-data-sm text-mono-data-sm self-end lg:self-auto">
          <span className="text-on-primary-container">MISSION CLOCK:</span>
          <span className="px-space-sm py-space-2xs bg-primary/50 text-secondary-fixed rounded font-semibold tracking-wider">
            UTC {new Date().toISOString().replace("T", " ").slice(0, 19)}
          </span>
        </div>
      </div>

      {/* Key Scientific Metrics Cards (4 columns) - Wired to Live DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Analyses Completed</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">task_alt</span>
          </div>
          <div className="my-space-sm">
            <div className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {overview.totalCompletedJobs}
            </div>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="text-secondary font-semibold">Active Cycle</span>
            <span className="px-space-xs py-space-2xs bg-surface-container-low rounded font-mono-data-sm text-mono-data-sm text-[#065f46] font-semibold">
              100% Validated
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Images Ingested</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">layers</span>
          </div>
          <div className="my-space-sm">
            <div className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {overview.totalImagesProcessed}
            </div>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-medium">PDS4 / GeoTIFF</span>
            <span className="text-secondary font-mono-data-sm text-mono-data-sm">16-bit DN Radiance</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Verified Matches</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">hub</span>
          </div>
          <div className="my-space-sm">
            <div className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {overview.totalVerifiedMatches.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="text-on-surface-variant">Mean Inlier Ratio:</span>
            <span className="font-mono-data-sm text-mono-data-sm text-secondary font-semibold">
              {(overview.avgInlierRatio * 100).toFixed(1)}% (RANSAC)
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Mean Registration Error</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">straighten</span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {overview.meanRegistrationError.toFixed(2)}
            </span>
            <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant uppercase">px</span>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="text-on-surface-variant">RMSE Equivalent:</span>
            <span className="font-mono-data-sm text-mono-data-sm text-[#065f46] font-semibold">
              {overview.avgRmse.toFixed(2)} px Ground
            </span>
          </div>
        </div>
      </div>

      {/* Primary Visual Middle Section: Processing Activity & Sensor Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Processing Activity Bar Chart (7 cols) - Dynamic SVG */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Photogrammetric Pipeline Activity</span>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface-variant rounded font-mono-data-sm text-mono-data-sm">30 Days</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Live daily registration telemetry aggregated across sensor payloads.
              </p>
            </div>
            {/* Sensor Legend */}
            <div className="flex items-center gap-space-sm font-mono-data-sm text-mono-data-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2.5 rounded bg-primary-container"></span>
                <span className="text-on-surface-variant">OHRC</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2.5 rounded bg-secondary"></span>
                <span className="text-on-surface-variant">TMC-2</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2.5 rounded bg-secondary-container"></span>
                <span className="text-on-surface-variant">IIRS</span>
              </div>
            </div>
          </div>

          {/* Dynamic Histogram SVG */}
          <div className="my-space-md w-full overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="flex justify-end pr-8 mb-1">
                <span className="px-space-xs py-space-2xs bg-surface-container-high rounded text-on-surface font-mono-data-sm text-mono-data-sm">
                  ▲ Peak: {peakDay?.date || "Recent Orbit"} ({peakDay?.total || 1} runs)
                </span>
              </div>
              <svg className="w-full h-44 text-on-surface-variant select-none" fill="none" viewBox="0 0 540 180">
                <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.12" x1="30" x2="530" y1="30" y2="30" />
                <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.12" x1="30" x2="530" y1="70" y2="70" />
                <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.12" x1="30" x2="530" y1="110" y2="110" />
                <line stroke="currentColor" strokeOpacity="0.25" x1="30" x2="530" y1="150" y2="150" />
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="34">{maxDayTotal * 2}</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="74">{Math.round(maxDayTotal * 1.5)}</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="114">{maxDayTotal}</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="153">0</text>
                
                {/* Dynamically Render 30 Grouped Daily Bars */}
                {activityDays.map((day: any, idx: number) => {
                  const xBase = 36 + idx * 16.2;
                  const scale = 110 / (maxDayTotal || 1);
                  const hOhrc = Math.min(110, Math.max(day.ohrc > 0 ? 12 : 2, day.ohrc * scale * 0.9));
                  const hTmc = Math.min(110, Math.max(day.tmc2 > 0 ? 10 : 2, day.tmc2 * scale * 0.9));
                  const hIirs = Math.min(110, Math.max(day.iirs > 0 ? 8 : 2, day.iirs * scale * 0.9));

                  return (
                    <g key={day.date || idx}>
                      {/* OHRC bar */}
                      <rect
                        className="fill-primary-container"
                        height={hOhrc}
                        width="4"
                        x={xBase}
                        y={150 - hOhrc}
                      />
                      {/* TMC-2 bar */}
                      <rect
                        className="fill-secondary"
                        height={hTmc}
                        width="4"
                        x={xBase + 4.5}
                        y={150 - hTmc}
                      />
                      {/* IIRS bar */}
                      <rect
                        className="fill-secondary-container"
                        height={hIirs}
                        width="4"
                        x={xBase + 9}
                        y={150 - hIirs}
                      />
                    </g>
                  );
                })}

                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="50" y="168">DAY -30</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="170" y="168">DAY -20</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="290" y="168">DAY -15</text>
                <text className="font-mono-data-sm text-[10px] font-semibold" fill="#006398" textAnchor="middle" x="410" y="168">DAY -7</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="515" y="168">TODAY</text>
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm pt-space-xs">
            <span>Aggregate Band Alignment Rate: <strong className="text-on-surface">98.4%</strong></span>
            <span>Co-registration Kernel: <strong className="text-secondary">Akaze + Affine RANSAC</strong></span>
          </div>
        </div>

        {/* Payload Coverage & Reference Imagery Visualizer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">pie_chart</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Instrument Coverage Ratio</span>
              </div>
              <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                Total: {overview.totalImagesProcessed} Scenes
              </span>
            </div>

            {/* Dynamic Sensor Coverage Stacked Progress Bars */}
            <div className="flex flex-col gap-space-sm my-space-xs">
              {sensorCoverage.map((item: any) => {
                const colorClass =
                  item.sensor === "OHRC"
                    ? "bg-primary-container"
                    : item.sensor === "TMC-2"
                    ? "bg-secondary"
                    : item.sensor === "IIRS"
                    ? "bg-secondary-container"
                    : "bg-surface-variant";

                return (
                  <div key={item.sensor}>
                    <div className="flex justify-between font-mono-data-sm text-mono-data-sm mb-1">
                      <span className="text-on-surface font-semibold">{item.sensor}</span>
                      <span className="text-on-surface font-semibold">
                        {item.percentage}% • {item.count} scenes
                      </span>
                    </div>
                    <div className="w-full h-2 rounded bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded ${colorClass}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                <span>Radiometric Coeff v4.2 Loaded</span>
              </span>
              <span className="text-secondary font-medium">Auto-calibrated</span>
            </div>
          </div>

          {/* Active Lunar Target Micro-Preview Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Target Footprint Inspection</span>
                <span className="px-space-xs py-space-2xs bg-secondary text-on-secondary rounded font-mono-data-sm text-mono-data-sm">TMC-2 / OHRC</span>
              </div>
              <span className="font-mono-data-sm text-mono-data-sm text-secondary font-semibold">ORBIT 1245</span>
            </div>
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-primary">
              <Image
                src="/images/crater-terrain-reference.png"
                alt="Monochrome satellite imagery of lunar impact crater"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end justify-between p-space-sm font-mono-data-sm text-mono-data-sm text-white">
                <div className="flex flex-col text-xs">
                  <span className="font-semibold text-secondary-fixed">89.9°S, 180.0°E</span>
                  <span className="text-surface-variant text-[10px]">South Pole Rim Ridge</span>
                </div>
                <span className="px-space-xs py-0.5 bg-primary/70 rounded text-[10px] text-surface-bright backdrop-blur-xs">
                  0.25 m/px GSD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scientific Analysis Runs Table */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Recent Scientific Analysis Runs
            </h2>
            <span className="px-space-xs py-space-2xs bg-surface-container rounded font-mono-data-sm text-mono-data-sm text-on-surface-variant">
              Live Pipeline Records
            </span>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg font-mono-data-sm text-mono-data-sm">
            {(["ALL", "COMPLETED", "IN_PROGRESS", "CALIBRATED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-space-sm py-1 rounded text-xs font-medium transition-all ${
                  activeTab === tab
                    ? "bg-primary-container text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Scientific Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data-sm text-mono-data-sm">
            <thead>
              <tr className="border-b border-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-2.5 px-3">Analysis ID</th>
                <th className="py-2.5 px-3">Ref Image</th>
                <th className="py-2.5 px-3">Src Image</th>
                <th className="py-2.5 px-3">Sensor Pair</th>
                <th className="py-2.5 px-3">Matches</th>
                <th className="py-2.5 px-3">Inlier Ratio</th>
                <th className="py-2.5 px-3">RMSE Error</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Completed (UTC)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {filteredRuns.map((run: any) => (
                <tr key={run.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-secondary">{run.id}</td>
                  <td className="py-3 px-3 font-semibold text-on-surface">{run.refImage}</td>
                  <td className="py-3 px-3 text-on-surface-variant">{run.srcImage}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-surface-container rounded text-[11px] font-medium text-on-surface">
                      {run.sensorPair}
                    </span>
                  </td>
                  <td className="py-3 px-3">{run.matches}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${Math.min(100, run.inlierRatio)}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-on-surface">{run.inlierRatio}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#065f46]">{run.error}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${run.statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                      {run.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant text-[11px]">{run.date}</td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/registration"
                      className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs font-semibold text-secondary hover:text-on-surface transition-colors inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
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
