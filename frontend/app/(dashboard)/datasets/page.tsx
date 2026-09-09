"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DatasetsPage() {
  const router = useRouter();
  const [selectedPayload, setSelectedPayload] = useState("ALL");
  const [selectedDataset, setSelectedDataset] = useState("CH2_OHRC_0421");
  const [searchQuery, setSearchQuery] = useState("CH2_OHRC_0421");

  const datasets = [
    {
      uid: "CH2_OHRC_0421",
      fullUid: "CH2_OHRC_20241008_0421_v2",
      thumb: "/images/crater-terrain-reference.png",
      instrument: "OHRC / PAN",
      mode: "Telescopic CCD (0.25m)",
      gsd: "0.25 m/px",
      dim: "4096×4096",
      date: "2024-10-08",
      time: "04:12:18 UTC",
      target: "South Pole Rim",
      level: "Level-2B Calibrated",
      levelColor: "bg-[#ecfdf5] text-[#065f46] dot-[#10b981]",
    },
    {
      uid: "CH2_TMC2_1187",
      fullUid: "CH2_TMC2_20240915_1187_v1",
      thumb: "/images/crater-terrain-reference.png",
      instrument: "TMC-2 / Stereo",
      mode: "Fore-Aft-Nadir Triplet",
      gsd: "5.00 m/px",
      dim: "2048×8192",
      date: "2024-09-15",
      time: "11:34:02 UTC",
      target: "Manzinus C",
      level: "Orthorectified",
      levelColor: "bg-surface-container text-on-surface-variant dot-secondary",
    },
    {
      uid: "CH2_IIRS_0821",
      fullUid: "CH2_IIRS_20240820_0821_v3",
      thumb: "/images/difference-map-visualization.png",
      instrument: "IIRS / Hyperspec",
      mode: "256 Contiguous Bands",
      gsd: "20.0 m/px",
      dim: "1024×4096",
      date: "2024-08-20",
      time: "18:49:50 UTC",
      target: "Amundsen Basin",
      level: "Level-2B Calibrated",
      levelColor: "bg-[#ecfdf5] text-[#065f46] dot-[#10b981]",
    },
    {
      uid: "CH2_OHRC_0398",
      fullUid: "CH2_OHRC_20240712_0398_v1",
      thumb: "/images/crater-terrain-reference.png",
      instrument: "OHRC / PAN",
      mode: "Telescopic CCD (0.28m)",
      gsd: "0.28 m/px",
      dim: "4096×4096",
      date: "2024-07-12",
      time: "09:18:41 UTC",
      target: "Shackleton Crater",
      level: "Level-2B Calibrated",
      levelColor: "bg-[#ecfdf5] text-[#065f46] dot-[#10b981]",
    },
    {
      uid: "CH2_TMC2_1104",
      fullUid: "CH2_TMC2_20240602_1104_v1",
      thumb: "/images/crater-terrain-reference.png",
      instrument: "TMC-2 / Stereo",
      mode: "Triplet Strip Ingestion",
      gsd: "5.00 m/px",
      dim: "2048×4096",
      date: "2024-06-02",
      time: "22:04:15 UTC",
      target: "De Gerlache Floor",
      level: "Level-1 Raw",
      levelColor: "bg-surface-container text-on-surface-variant dot-outline",
    },
    {
      uid: "LROC_NAC_M114",
      fullUid: "LROC_NAC_M1145229188RE",
      thumb: "/images/crater-terrain-reference.png",
      instrument: "LROC NAC / Mono",
      mode: "Reference Archive (NASA)",
      gsd: "0.50 m/px",
      dim: "5064×52224",
      date: "2023-11-19",
      time: "14:02:11 UTC",
      target: "South Pole Rim",
      level: "Orthorectified",
      levelColor: "bg-surface-container text-on-surface-variant dot-secondary",
    },
  ];

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Breadcrumb & Top Mission Action Bar */}
      <section className="flex flex-col gap-space-xs py-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
            <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
            <span className="text-outline">/</span>
            <span>Data</span>
            <span className="text-outline">/</span>
            <span className="text-secondary font-medium">Datasets Repository</span>
          </div>
          <div className="flex items-center gap-space-sm font-mono-data-sm text-mono-data-sm">
            <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface-variant rounded">SPICE CK/SPK: <strong className="text-on-surface">V09_RECON</strong></span>
            <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface-variant rounded">PDS-4 SCHEMA: <strong className="text-on-surface">1.21.0.0</strong></span>
            <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs bg-surface-container text-on-surface-variant rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>CATALOG SYNC: 100%</span>
            </span>
          </div>
        </div>

        {/* Title & Description Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight uppercase font-bold">
              Lunar Scientific Dataset Repository
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Query, inspect and ingest PDS4-compliant lunar orbital imagery, elevation profiles, and cartographic products from Chandrayaan and coordinated reference archives.
            </p>
          </div>
          <div className="flex items-center gap-space-xs">
            <button className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm rounded hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>Harvest External PDS Nodes</span>
            </button>
            <button className="flex items-center gap-space-xs px-space-sm py-space-xs bg-primary text-on-primary font-mono-data-sm text-mono-data-sm rounded hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-[16px]">cloud_download</span>
              <span>Batch Download (3)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Spatial Query Console */}
      <section className="mt-space-sm bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-sm">
        <div className="flex flex-col md:flex-row gap-space-sm">
          <div className="relative flex-1 flex items-center bg-surface-container-low rounded px-space-sm py-space-2xs">
            <span className="material-symbols-outlined text-outline text-[18px] mr-space-xs">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets by ID, crater, instrument or coordinates (e.g. OHRC_0421, Shackleton, 89.9°S)..."
              className="w-full bg-transparent font-mono-data-md text-mono-data-md text-on-surface focus:outline-none placeholder:text-outline placeholder:font-body-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-outline hover:text-on-surface p-space-2xs" title="Clear query">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          <div className="flex items-center bg-surface-container-low rounded overflow-hidden">
            <span className="px-space-sm py-space-xs font-label-caps text-label-caps uppercase text-on-surface-variant bg-surface-container">LAT/LON</span>
            <input type="text" defaultValue="-85.2° / 128.9°" className="w-36 px-space-xs font-mono-data-sm text-mono-data-sm bg-transparent text-on-surface focus:outline-none" />
            <span className="px-space-xs font-mono-data-sm text-mono-data-sm text-outline">±0.5°</span>
            <button className="px-space-sm py-space-xs bg-secondary text-on-secondary font-mono-data-sm text-mono-data-sm hover:bg-on-secondary-container transition-colors flex items-center gap-space-2xs">
              <span className="material-symbols-outlined text-[16px]">pin_drop</span>
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Multi-level Granule Filter Matrix */}
        <div className="flex flex-col gap-space-xs pt-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="w-28 font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Payload:</span>
            <div className="flex flex-wrap items-center gap-space-2xs font-mono-data-sm text-mono-data-sm">
              {(["ALL", "OHRC", "TMC-2", "IIRS", "LROC NAC", "DFSAR"] as const).map((payload) => (
                <button
                  key={payload}
                  onClick={() => setSelectedPayload(payload)}
                  className={`px-space-sm py-space-2xs rounded transition-colors ${
                    selectedPayload === payload
                      ? "bg-primary text-on-primary font-semibold"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {payload === "ALL" ? "ALL (Active)" : payload}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="w-28 font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Pixel Scale:</span>
            <div className="flex flex-wrap items-center gap-space-2xs font-mono-data-sm text-mono-data-sm">
              <button className="px-space-sm py-space-2xs bg-secondary text-on-secondary rounded font-medium">ALL SCALES</button>
              <button className="px-space-sm py-space-2xs bg-surface-container text-on-surface rounded hover:bg-surface-container-high">&lt; 0.50 m/px (Ultra High)</button>
              <button className="px-space-sm py-space-2xs bg-surface-container text-on-surface rounded hover:bg-surface-container-high">0.5 – 5.0 m/px (Stereo DEM)</button>
              <button className="px-space-sm py-space-2xs bg-surface-container text-on-surface rounded hover:bg-surface-container-high">&gt; 10 m/px (Spectroscopy)</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Content: Table vs Inspector */}
      <section className="mt-space-md grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* LEFT / CENTER: Table (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-sm bg-surface-container-lowest rounded-lg p-space-sm shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-space-xs py-space-2xs bg-surface-container-low rounded">
            <div className="flex items-center gap-space-sm font-mono-data-sm text-mono-data-sm">
              <span className="font-bold text-on-surface">6 Granules Found</span>
              <span className="text-outline">|</span>
              <span className="text-on-surface-variant">PDS4 Collection: <code className="text-secondary font-mono-data-sm">urn:isro:ch2:science_archive:data_calibrated</code></span>
            </div>
            <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm">
              <span className="text-on-surface-variant">Sort:</span>
              <span className="text-on-surface font-semibold">Acquisition Time ↓</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data-sm text-mono-data-sm border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant uppercase font-label-caps text-label-caps select-none">
                  <th className="py-space-xs px-space-xs text-center w-8">
                    <input type="checkbox" className="accent-primary" />
                  </th>
                  <th className="py-space-xs px-space-xs">Dataset UID</th>
                  <th className="py-space-xs px-space-xs">Preview</th>
                  <th className="py-space-xs px-space-xs">Instrument / Mode</th>
                  <th className="py-space-xs px-space-xs text-right">GSD</th>
                  <th className="py-space-xs px-space-xs text-center">Raster Dim</th>
                  <th className="py-space-xs px-space-xs">Acq UTC</th>
                  <th className="py-space-xs px-space-xs">Target Morph</th>
                  <th className="py-space-xs px-space-xs">PDS Level</th>
                  <th className="py-space-xs px-space-xs text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {datasets.map((item) => {
                  const isSelected = selectedDataset === item.uid;
                  return (
                    <tr
                      key={item.uid}
                      onClick={() => setSelectedDataset(item.uid)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-secondary-fixed/40 hover:bg-secondary-fixed/60"
                          : "hover:bg-surface-container-low"
                      }`}
                    >
                      <td className="py-space-xs px-space-xs text-center">
                        <input type="checkbox" checked={isSelected} readOnly className="accent-primary" />
                      </td>
                      <td className="py-space-xs px-space-xs font-semibold text-secondary">
                        <div className="flex items-center gap-space-2xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-secondary" : "bg-outline-variant"}`}></span>
                          <span>{item.uid}</span>
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <div className="w-10 h-10 rounded overflow-hidden bg-primary shadow-xs relative">
                          <Image src={item.thumb} alt={item.uid} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{item.instrument}</span>
                          <span className="text-on-surface-variant font-mono-data-sm text-[10px]">{item.mode}</span>
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs text-right font-bold text-on-surface">{item.gsd}</td>
                      <td className="py-space-xs px-space-xs text-center text-on-surface-variant">{item.dim}</td>
                      <td className="py-space-xs px-space-xs">
                        <div className="flex flex-col">
                          <span className="text-on-surface font-medium">{item.date}</span>
                          <span className="text-on-surface-variant font-mono-data-sm text-[10px]">{item.time}</span>
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface text-[11px]">{item.target}</span>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <span className={`inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded text-[11px] font-semibold ${item.levelColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {item.level}
                        </span>
                      </td>
                      <td className="py-space-xs px-space-xs text-center">
                        <button className={`px-space-xs py-space-2xs rounded font-mono-data-sm text-mono-data-sm ${
                          isSelected
                            ? "bg-primary text-on-primary hover:bg-secondary"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}>
                          {isSelected ? "Inspect" : "Select"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs px-space-xs text-on-surface-variant font-mono-data-sm text-mono-data-sm">
            <div className="flex items-center gap-space-xs">
              <span>Displaying 1–6 of 1,482 archive records</span>
              <span className="text-outline">|</span>
              <span className="text-on-surface font-medium">Selected: 1 Granule (34.2 MB)</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="px-space-sm py-space-2xs bg-primary text-on-primary rounded font-bold">1</span>
              <button className="px-space-sm py-space-2xs bg-surface-container rounded text-on-surface hover:bg-surface-container-high">2</button>
              <button className="px-space-sm py-space-2xs bg-surface-container rounded text-on-surface hover:bg-surface-container-high">3</button>
            </div>
          </div>
        </div>

        {/* RIGHT: INSPECTOR DOCK (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-sm bg-surface-container-lowest rounded-lg p-space-md shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-space-2xs bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded">PDS-4 TARGET</span>
                <span className="font-mono-data-sm text-mono-data-sm text-secondary font-bold">CALIBRATED L2B</span>
              </div>
              <span className="font-mono-data-lg text-mono-data-lg text-on-surface font-bold mt-space-2xs tracking-tight">
                {selectedDataset}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                High Resolution Optical Imaging Camera (OHRC) Nadir Frame
              </span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <button className="p-space-xs hover:bg-surface-container rounded text-outline hover:text-on-surface" title="Bookmark Asset">
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
              </button>
              <button className="p-space-xs hover:bg-surface-container rounded text-outline hover:text-on-surface" title="Open Full XML Label">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-square bg-primary rounded overflow-hidden shadow-inner flex items-center justify-center group">
            <Image
              src="/images/crater-terrain-reference.png"
              alt="Orthorectified high resolution optical raster of a lunar impact crater"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-[1px] bg-secondary-fixed/50"></div>
              <div className="h-full w-[1px] bg-secondary-fixed/50 absolute"></div>
              <div className="w-16 h-16 rounded-full border border-secondary-fixed/70 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffb77d] animate-ping"></div>
              </div>
              <div className="absolute top-2 left-2 px-space-xs py-space-2xs bg-primary-container/85 text-inverse-on-surface font-mono-data-sm text-[10px] rounded backdrop-blur">
                <div>ORBIT: 1245 | IMG: 89</div>
                <div className="text-secondary-fixed">SUN ELEV: 18.4°</div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-space-xs py-space-2xs bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-[10px] rounded backdrop-blur">
                <span>85.2418° S, 128.9204° E</span>
              </div>
            </div>
          </div>

          {/* Telemetry Matrix */}
          <div className="flex flex-col gap-space-2xs bg-surface-container-low p-space-sm rounded">
            <div className="flex items-center justify-between mb-space-2xs">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-semibold">PDS4 Orbital Telemetry</span>
              <span className="font-mono-data-sm text-mono-data-sm text-secondary">IAU_2000_MOON</span>
            </div>
            <div className="grid grid-cols-2 gap-x-space-md gap-y-space-xs font-mono-data-sm text-mono-data-sm">
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Pixel Ground Scale</span>
                <span className="text-on-surface font-semibold">0.250 m/px @ 100km</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Solar Incidence (i)</span>
                <span className="text-on-surface font-semibold">81.58° (Grazing)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Ephemeris Kernel</span>
                <span className="text-[#065f46] font-semibold flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  SPICE DE421 OK
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Radiometric Units</span>
                <span className="text-on-surface font-semibold">W / (m² · sr · μm)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <button
              onClick={() => router.push("/new-analysis")}
              className="w-full py-space-sm bg-primary-container text-on-primary hover:bg-secondary rounded font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-space-xs shadow transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary-fixed">biotech</span>
              <span>Launch Analysis Workstation</span>
            </button>
            <div className="grid grid-cols-2 gap-space-xs">
              <button className="py-space-xs bg-surface-container text-on-surface hover:bg-surface-container-high rounded font-body-sm text-body-sm flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">public</span>
                <span>Open in 3D GIS</span>
              </button>
              <button className="py-space-xs bg-surface-container text-on-surface hover:bg-surface-container-high rounded font-body-sm text-body-sm flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export XML Bundle</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
