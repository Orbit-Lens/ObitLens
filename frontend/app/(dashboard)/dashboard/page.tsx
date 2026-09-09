"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS" | "CALIBRATED">("ALL");
  const [logFilter, setLogFilter] = useState("");

  const analysisRuns = [
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
      refImage: "CH3_LAND_0019",
      srcImage: "CH2_OHRC_0389",
      sensorPair: "LPDC / OHRC",
      matches: "619 / 750",
      inlierRatio: 82.5,
      error: "1.04 px",
      status: "IN PROGRESS",
      statusColor: "bg-[#fffbeb] text-[#92400e] dot-bg-[#f59e0b]",
      date: "2024-10-08 02:44",
    },
    {
      id: "#ANL-2024-8919",
      refImage: "CH2_IIRS_0884",
      srcImage: "CH2_TMC2_1140",
      sensorPair: "IIRS / TMC-2",
      matches: "1,208 / 1,320",
      inlierRatio: 91.5,
      error: "0.68 px",
      status: "CALIBRATED",
      statusColor: "bg-surface-container-high text-secondary dot-bg-secondary",
      date: "2024-10-07 22:15",
    },
    {
      id: "#ANL-2024-8918",
      refImage: "CH2_TMC2_1092",
      srcImage: "LROC_NAC_M138",
      sensorPair: "TMC-2 / LROC",
      matches: "2,410 / 2,522",
      inlierRatio: 95.5,
      error: "0.45 px",
      status: "VERIFIED",
      statusColor: "bg-surface-variant text-primary-container dot-bg-primary-container",
      date: "2024-10-07 19:08",
    },
    {
      id: "#ANL-2024-8917",
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

  const filteredRuns = analysisRuns.filter((run) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "COMPLETED") return run.status === "COMPLETED" || run.status === "VERIFIED";
    if (activeTab === "IN_PROGRESS") return run.status === "IN PROGRESS";
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
            2024-10-08 14:24:19 UTC
          </span>
        </div>
      </div>

      {/* Key Scientific Metrics Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Analyses Completed</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">task_alt</span>
          </div>
          <div className="my-space-sm">
            <div className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">128</div>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="text-secondary font-semibold">+14 this cycle</span>
            <span className="px-space-xs py-space-2xs bg-surface-container-low rounded font-mono-data-sm text-mono-data-sm">99.2% success</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Images Processed</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">layers</span>
          </div>
          <div className="my-space-sm">
            <div className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">342</div>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-medium">1.84 TB PDS4/GeoTIFF</span>
            <span className="text-secondary font-mono-data-sm text-mono-data-sm">16-bit DN</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Verified Matches</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">hub</span>
          </div>
          <div className="my-space-sm">
            <div className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">24,681</div>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="text-on-surface-variant">Mean Inlier Ratio:</span>
            <span className="font-mono-data-sm text-mono-data-sm text-secondary font-semibold">91.4% (RANSAC)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Mean Registration Error</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">straighten</span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span className="font-mono-data-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">0.84</span>
            <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant uppercase">px</span>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
            <span className="text-on-surface-variant">RMSE Equivalent:</span>
            <span className="font-mono-data-sm text-mono-data-sm text-[#065f46] font-semibold">0.18 m Ground</span>
          </div>
        </div>
      </div>

      {/* Primary Visual Middle Section: Processing Activity & Sensor Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Processing Activity Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Photogrammetric Pipeline Activity</span>
                <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface-variant rounded font-mono-data-sm text-mono-data-sm">30 Days</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Comparative telemetry of daily dataset processing runs per sensor payload.</p>
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

          {/* Histogram Graphic */}
          <div className="my-space-md w-full overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="flex justify-end pr-14 mb-1">
                <span className="px-space-xs py-space-2xs bg-surface-container-high rounded text-on-surface font-mono-data-sm text-mono-data-sm">
                  ▲ Peak: Orbit 1245 (42 products)
                </span>
              </div>
              <svg className="w-full h-44 text-on-surface-variant select-none" fill="none" viewBox="0 0 540 180">
                <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.12" x1="30" x2="530" y1="30" y2="30" />
                <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.12" x1="30" x2="530" y1="70" y2="70" />
                <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.12" x1="30" x2="530" y1="110" y2="110" />
                <line stroke="currentColor" strokeOpacity="0.25" x1="30" x2="530" y1="150" y2="150" />
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="34">40</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="74">25</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="114">10</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="end" x="24" y="153">0</text>
                
                {/* Sampled slots */}
                <rect className="fill-primary-container" height="35" width="7" x="42" y="115" />
                <rect className="fill-secondary" height="25" width="7" x="50" y="125" />
                <rect className="fill-secondary-container" height="12" width="7" x="58" y="138" />

                <rect className="fill-primary-container" height="52" width="7" x="69" y="98" />
                <rect className="fill-secondary" height="40" width="7" x="77" y="110" />
                <rect className="fill-secondary-container" height="18" width="7" x="85" y="132" />

                <rect className="fill-primary-container" height="65" width="7" x="96" y="85" />
                <rect className="fill-secondary" height="48" width="7" x="104" y="102" />
                <rect className="fill-secondary-container" height="22" width="7" x="112" y="128" />

                <rect className="fill-primary-container" height="78" width="7" x="150" y="72" />
                <rect className="fill-secondary" height="62" width="7" x="158" y="88" />
                <rect className="fill-secondary-container" height="30" width="7" x="166" y="120" />

                <rect className="fill-primary-container" height="90" width="7" x="204" y="60" />
                <rect className="fill-secondary" height="72" width="7" x="212" y="78" />
                <rect className="fill-secondary-container" height="35" width="7" x="220" y="115" />

                <rect className="fill-primary-container" height="98" width="7" x="285" y="52" />
                <rect className="fill-secondary" height="80" width="7" x="293" y="70" />
                <rect className="fill-secondary-container" height="38" width="7" x="301" y="112" />

                <rect className="fill-primary-container" height="118" width="7" x="339" y="32" />
                <rect className="fill-secondary" height="102" width="7" x="347" y="48" />
                <rect className="fill-secondary-container" height="65" width="7" x="355" y="85" />

                <rect className="fill-primary-container" height="92" width="7" x="393" y="58" />
                <rect className="fill-secondary" height="76" width="7" x="401" y="74" />
                <rect className="fill-secondary-container" height="40" width="7" x="409" y="110" />

                <rect className="fill-primary-container" height="106" width="7" x="474" y="44" />
                <rect className="fill-secondary" height="90" width="7" x="482" y="60" />
                <rect className="fill-secondary-container" height="50" width="7" x="490" y="100" />

                <rect className="fill-primary-container" height="112" width="7" x="501" y="38" />
                <rect className="fill-secondary" height="96" width="7" x="509" y="54" />
                <rect className="fill-secondary-container" height="54" width="7" x="517" y="96" />

                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="50" y="168">SEP 08</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="160" y="168">SEP 15</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="270" y="168">SEP 22</text>
                <text className="font-mono-data-sm text-[10px] font-semibold" fill="#006398" textAnchor="middle" x="350" y="168">OCT 01*</text>
                <text className="font-mono-data-sm text-[10px]" fill="currentColor" textAnchor="middle" x="450" y="168">OCT 06</text>
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
              <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Total: 342 Scenes</span>
            </div>
            <div className="flex flex-col gap-space-sm my-space-xs">
              <div>
                <div className="flex justify-between font-mono-data-sm text-mono-data-sm mb-1">
                  <span className="text-on-surface font-semibold">OHRC (High Resolution 0.25 m/px)</span>
                  <span className="text-on-surface font-semibold">42% • 144 scenes</span>
                </div>
                <div className="w-full h-2 rounded bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary-container rounded" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono-data-sm text-mono-data-sm mb-1">
                  <span className="text-on-surface font-semibold">TMC-2 Triplet Stereo (5.0 m/px)</span>
                  <span className="text-on-surface font-semibold">34% • 116 scenes</span>
                </div>
                <div className="w-full h-2 rounded bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary rounded" style={{ width: "34%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono-data-sm text-mono-data-sm mb-1">
                  <span className="text-on-surface font-semibold">IIRS Hyperspectral (250 bands)</span>
                  <span className="text-on-surface font-semibold">16% • 55 scenes</span>
                </div>
                <div className="w-full h-2 rounded bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary-container rounded" style={{ width: "16%" }}></div>
                </div>
              </div>
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
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
              <div className="absolute top-2 left-2 flex items-center gap-space-xs">
                <span className="px-space-xs py-space-2xs bg-primary/80 backdrop-blur text-inverse-on-surface rounded font-mono-data-sm text-mono-data-sm">
                  LAT: 45.25°S | LON: 128.92°E
                </span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono-data-sm text-mono-data-sm text-inverse-on-surface">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed">wb_sunny</span>
                  <span>Sun Elevation: 18.4°</span>
                </span>
                <span className="bg-secondary px-space-xs py-space-2xs rounded text-[10px] uppercase font-semibold">
                  Orthorectified 5m
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
              <span>Target Region: <strong className="text-on-surface">Manzinus C / South Pole Margin</strong></span>
              <Link href="/registration" className="text-secondary hover:underline flex items-center gap-1 font-medium">
                <span>Explore 3D Mesh</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Workspace: Data Table + Live Telemetry Terminal */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
        {/* Recent Scientific Analysis Runs (8 cols) */}
        <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Recent Scientific Analysis Runs</span>
                <span className="px-space-xs py-space-2xs bg-surface-container-high text-on-surface font-mono-data-sm text-mono-data-sm rounded font-medium">
                  5 Active Tasks
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">PDS-4 compliant photogrammetric registration batches and inlier verification logs.</p>
            </div>
            {/* Segmented Tab Filter */}
            <div className="flex items-center bg-surface-container-low p-space-2xs rounded-lg font-mono-data-sm text-mono-data-sm">
              {(["ALL", "COMPLETED", "IN_PROGRESS", "CALIBRATED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-space-sm py-space-2xs rounded transition-colors ${
                    activeTab === tab
                      ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* High-Density Government PDS-4 Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data-sm text-mono-data-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-caps text-label-caps">
                  <th className="py-space-xs px-space-sm font-semibold">Analysis ID</th>
                  <th className="py-space-xs px-space-sm font-semibold">Ref / Source Image</th>
                  <th className="py-space-xs px-space-sm font-semibold">Sensor Pair</th>
                  <th className="py-space-xs px-space-sm font-semibold text-right">Matches</th>
                  <th className="py-space-xs px-space-sm font-semibold">Inlier Ratio</th>
                  <th className="py-space-xs px-space-sm font-semibold text-right">Error</th>
                  <th className="py-space-xs px-space-sm font-semibold">Status</th>
                  <th className="py-space-xs px-space-sm font-semibold">Acquisition</th>
                  <th className="py-space-xs px-space-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-surface-container-low/60 transition-colors bg-surface-container-lowest">
                    <td className="py-space-sm px-space-sm font-semibold text-secondary">{run.id}</td>
                    <td className="py-space-sm px-space-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-on-surface font-medium">{run.refImage}</span>
                        <span className="text-on-surface-variant text-[10px]">{run.srcImage}</span>
                      </div>
                    </td>
                    <td className="py-space-sm px-space-sm">
                      <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface text-[10px]">{run.sensorPair}</span>
                    </td>
                    <td className="py-space-sm px-space-sm text-right text-on-surface font-medium">{run.matches}</td>
                    <td className="py-space-sm px-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <div className="w-16 h-1.5 rounded bg-surface-container overflow-hidden">
                          <div className="h-full bg-[#10b981]" style={{ width: `${run.inlierRatio}%` }}></div>
                        </div>
                        <span className="text-on-surface font-medium">{run.inlierRatio}%</span>
                      </div>
                    </td>
                    <td className="py-space-sm px-space-sm text-right text-on-surface">{run.error}</td>
                    <td className="py-space-sm px-space-sm">
                      <span className={`inline-flex items-center gap-1 px-space-xs py-space-2xs rounded text-[10px] font-semibold ${run.statusColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{run.status}</span>
                      </span>
                    </td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant">{run.date}</td>
                    <td className="py-space-sm px-space-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href="/registration" className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-secondary" title="View In Matrix">
                          <span className="material-symbols-outlined text-[16px]">grid_view</span>
                        </Link>
                        <button className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-secondary" title="Download PDS4">
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                        <button className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-secondary" title="Log">
                          <span className="material-symbols-outlined text-[16px]">terminal</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Telemetry Stream Log Console (4 cols) */}
        <div className="xl:col-span-4 bg-primary-container text-inverse-on-surface rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-xs pb-space-xs border-b border-primary/40">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-primary">
                  Pipeline Telemetry Stream
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button className="px-space-xs py-space-2xs bg-primary/60 hover:bg-primary rounded text-on-primary-container text-[10px] font-mono-data-sm">
                  Flush
                </button>
                <button className="px-space-xs py-space-2xs bg-secondary hover:bg-secondary/80 rounded text-on-secondary text-[10px] font-mono-data-sm font-semibold">
                  Export Dump
                </button>
              </div>
            </div>

            {/* Monospace Scrolling Log Console */}
            <div className="h-64 overflow-y-auto font-mono-data-sm text-[11px] leading-relaxed space-y-1 pr-1 text-on-primary-container select-text">
              <div><span className="text-[#10b981]">[14:24:19.004]</span> <span className="text-secondary-fixed">SYS_INIT:</span> Node SAC-AHM-LUNAR-04 pipeline socket attached.</div>
              <div><span className="text-[#10b981]">[14:24:18.892]</span> <span className="text-on-primary">PDS4_LOAD:</span> Ingested granule CH2_OHRC_0421.lbl (2048x4096 16-bit).</div>
              <div><span className="text-[#10b981]">[14:24:18.520]</span> <span className="text-secondary-container">AKAZE_EXTRACT:</span> Extracted 4,210 keypoints (octave depth=4).</div>
              <div><span className="text-[#10b981]">[14:24:17.910]</span> <span className="text-on-primary">RANSAC_FIT:</span> USAC_MAGSAC converged in 42 iterations (inliers=91.4%).</div>
              <div><span className="text-[#10b981]">[14:24:16.440]</span> <span className="text-tertiary-fixed font-semibold">WARP_BICUBIC:</span> Applied homography H-matrix (RMSE=0.72px).</div>
              <div><span className="text-[#10b981]">[14:24:15.110]</span> <span className="text-[#10b981]">GEOTIFF_EXPORT:</span> Generated COG output CH2_OHRC_REG_0421.tif.</div>
              <div><span className="text-[#10b981]">[14:24:12.801]</span> <span className="text-secondary-fixed">SPICE_EPHEM:</span> Updated DE421 ephemeris state vector (ck/spk synced).</div>
            </div>
          </div>

          {/* Active Ephemeris Vector readout card */}
          <div className="mt-space-md p-space-xs bg-primary/60 rounded font-mono-data-sm text-mono-data-sm text-on-primary-container flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] uppercase font-label-caps text-on-primary-container/80">
              <span>Active Ephemeris Vector</span>
              <span className="text-[#10b981]">SPICE SYNC OK</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>Orb Alt: <strong className="text-on-primary">102.4 km</strong></div>
              <div>Vel: <strong className="text-on-primary">1.62 km/s</strong></div>
              <div>Sub-Solar: <strong className="text-secondary-fixed">88.4°S 12.1°E</strong></div>
              <div>Frame: <strong className="text-on-primary">MOON_ME</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
