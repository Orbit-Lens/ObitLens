"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

interface LunarImage {
  _id: string;
  name: string;
  filename: string;
  format: string;
  sensor: string;
  resolutionMetersPerPixel: number;
  sunAzimuthDeg: number;
  sunElevationDeg: number;
  storageKey: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  status?: string;
  createdAt?: string;
}

export default function DatasetsPage() {
  const router = useRouter();
  const [selectedPayload, setSelectedPayload] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiImages, setApiImages] = useState<LunarImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string>("");

  useEffect(() => {
    async function loadImages() {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch("/api/v1/images?limit=50", { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setApiImages(json.data);
            setSelectedImageId(json.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load images:", err);
      }
    }
    loadImages();
  }, []);

  // Filter images based on payload and search query
  const filteredImages = apiImages.filter((img) => {
    const matchesPayload =
      selectedPayload === "ALL" ||
      img.sensor.toUpperCase().includes(selectedPayload.toUpperCase().replace("-", ""));
    const matchesQuery =
      searchQuery === "" ||
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.sensor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPayload && matchesQuery;
  });

  const selectedImage = apiImages.find((i) => i._id === selectedImageId) || apiImages[0];

  const handleLaunchWorkstation = () => {
    if (!selectedImage) {
      router.push("/new-analysis");
      return;
    }
    // Find a paired image of different sensor or different ID
    const paired = apiImages.find((i) => i._id !== selectedImage._id) || apiImages[0];
    router.push(`/new-analysis?refId=${selectedImage._id}&srcId=${paired ? paired._id : ""}`);
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Breadcrumb & Top Mission Action Bar */}
      <section className="flex flex-col gap-space-xs py-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant text-xs sm:text-sm">
            <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
            <span className="text-outline">/</span>
            <span>Data</span>
            <span className="text-outline">/</span>
            <span className="text-secondary font-medium">Datasets Repository</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-space-sm font-mono-data-sm text-mono-data-sm text-[11px] sm:text-xs">
            <span className="px-space-xs py-1 bg-surface-container text-on-surface-variant rounded">SPICE CK/SPK: <strong className="text-on-surface">V09_RECON</strong></span>
            <span className="px-space-xs py-1 bg-surface-container text-on-surface-variant rounded hidden sm:inline-block">PDS-4 SCHEMA: <strong className="text-on-surface">1.21.0.0</strong></span>
            <span className="inline-flex items-center gap-space-2xs px-space-xs py-1 bg-surface-container text-on-surface-variant rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>CATALOG SYNC: 100%</span>
            </span>
          </div>
        </div>

        {/* Title & Description Strip */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-sm">
          <div className="flex flex-col">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight uppercase font-bold text-xl sm:text-2xl">
              Lunar Scientific Dataset Repository
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Query, inspect and ingest PDS4-compliant lunar orbital imagery, elevation profiles, and cartographic products from Chandrayaan and coordinated reference archives.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-xs w-full lg:w-auto">
            <button className="flex items-center justify-center gap-space-xs px-space-sm py-2 min-h-[44px] bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm rounded hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
              <span>Harvest External PDS Nodes</span>
            </button>
            <button className="flex items-center justify-center gap-space-xs px-space-sm py-2 min-h-[44px] bg-primary text-on-primary font-mono-data-sm text-mono-data-sm rounded hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-[18px]">cloud_download</span>
              <span>Batch Download (3)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Spatial Query Console */}
      <section className="mt-space-sm bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-sm">
        <div className="flex flex-col md:flex-row gap-space-sm">
          <div className="relative flex-1 flex items-center bg-surface-container-low rounded px-space-sm py-2 min-h-[44px]">
            <span className="material-symbols-outlined text-outline text-[18px] mr-space-xs">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets by ID, crater, instrument or coordinates..."
              className="w-full bg-transparent font-mono-data-md text-mono-data-md text-on-surface focus:outline-none placeholder:text-outline placeholder:font-body-sm text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-outline hover:text-on-surface p-1" title="Clear query">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <div className="flex items-center bg-surface-container-low rounded overflow-hidden w-full md:w-auto min-h-[44px]">
            <span className="px-space-sm py-2 font-label-caps text-label-caps uppercase text-on-surface-variant bg-surface-container">LAT/LON</span>
            <input type="text" defaultValue="-85.2° / 128.9°" className="flex-1 md:w-36 px-space-xs font-mono-data-sm text-mono-data-sm bg-transparent text-on-surface focus:outline-none" />
            <span className="px-space-xs font-mono-data-sm text-mono-data-sm text-outline">±0.5°</span>
            <button className="px-space-sm py-2 bg-secondary text-on-secondary font-mono-data-sm text-mono-data-sm hover:bg-on-secondary-container transition-colors flex items-center gap-space-2xs min-h-[44px]">
              <span className="material-symbols-outlined text-[18px]">pin_drop</span>
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Multi-level Granule Filter Matrix */}
        <div className="flex flex-col gap-space-xs pt-space-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-space-xs">
            <span className="w-28 font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider text-xs">Payload:</span>
            <div className="flex flex-wrap items-center gap-1.5 font-mono-data-sm text-mono-data-sm">
              {(["ALL", "OHRC", "TMC-2", "IIRS", "LROC NAC", "DFSAR"] as const).map((payload) => (
                <button
                  key={payload}
                  onClick={() => setSelectedPayload(payload)}
                  className={`px-space-sm py-1.5 min-h-[36px] rounded transition-colors ${
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-space-xs mt-1">
            <span className="w-28 font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider text-xs">Pixel Scale:</span>
            <div className="flex flex-wrap items-center gap-1.5 font-mono-data-sm text-mono-data-sm">
              <button className="px-space-sm py-1.5 min-h-[36px] bg-secondary text-on-secondary rounded font-medium">ALL SCALES</button>
              <button className="px-space-sm py-1.5 min-h-[36px] bg-surface-container text-on-surface rounded hover:bg-surface-container-high">&lt; 0.50 m/px (Ultra High)</button>
              <button className="px-space-sm py-1.5 min-h-[36px] bg-surface-container text-on-surface rounded hover:bg-surface-container-high">0.5 – 5.0 m/px (Stereo DEM)</button>
              <button className="px-space-sm py-1.5 min-h-[36px] bg-surface-container text-on-surface rounded hover:bg-surface-container-high">&gt; 10 m/px (Spectroscopy)</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Content: Table vs Inspector */}
      <section className="mt-space-md grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* LEFT / CENTER: Table & Mobile Cards (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-sm bg-surface-container-lowest rounded-lg p-space-sm shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-space-xs py-space-2xs bg-surface-container-low rounded">
            <div className="flex flex-wrap items-center gap-space-sm font-mono-data-sm text-mono-data-sm text-xs">
              <span className="font-bold text-on-surface">{filteredImages.length} Granules Found</span>
              <span className="text-outline">|</span>
              <span className="text-on-surface-variant truncate max-w-[200px] sm:max-w-none">PDS4 Collection: <code className="text-secondary font-mono-data-sm">calibrated</code></span>
            </div>
            <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-xs">
              <span className="text-on-surface-variant">Sort:</span>
              <span className="text-on-surface font-semibold">Acquisition Time ↓</span>
            </div>
          </div>

          {/* Mobile Card List (< md:) */}
          <div className="flex flex-col divide-y divide-surface-container-high md:hidden">
            {filteredImages.map((item) => {
              const isSelected = selectedImage?._id === item._id;
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedImageId(item._id)}
                  className={`p-3 transition-colors cursor-pointer rounded-lg mb-1 ${
                    isSelected ? "bg-secondary-fixed/40 border border-secondary" : "hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded overflow-hidden bg-primary shadow-xs relative shrink-0">
                        <Image src="/images/crater-terrain-reference.png" alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-secondary text-sm flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-secondary" : "bg-outline-variant"}`}></span>
                          {item.name}
                        </div>
                        <div className="text-xs text-on-surface-variant font-mono">{item.sensor} · {item.resolutionMetersPerPixel} m/px</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ecfdf5] text-[#065f46]">
                      Level-2B
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-on-surface-variant font-mono">
                      {item.width && item.height ? `${item.width}×${item.height}` : "4096×4096"} · Elev: {item.sunElevationDeg || 18.4}°
                    </div>
                    <button
                      className={`px-3 py-1.5 min-h-[44px] rounded font-mono text-xs font-semibold ${
                        isSelected
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface"
                      }`}
                    >
                      {isSelected ? "Active" : "Inspect"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md:) */}
          <div className="hidden md:block overflow-x-auto">
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
                  <th className="py-space-xs px-space-xs">Sun Elevation</th>
                  <th className="py-space-xs px-space-xs">PDS Level</th>
                  <th className="py-space-xs px-space-xs text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {filteredImages.map((item) => {
                  const isSelected = selectedImage?._id === item._id;
                  return (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedImageId(item._id)}
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
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <div className="w-10 h-10 rounded overflow-hidden bg-primary shadow-xs relative">
                          <Image src="/images/crater-terrain-reference.png" alt={item.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{item.sensor}</span>
                          <span className="text-on-surface-variant font-mono-data-sm text-[10px]">{item.format}</span>
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs text-right font-bold text-on-surface">{item.resolutionMetersPerPixel} m/px</td>
                      <td className="py-space-xs px-space-xs text-center text-on-surface-variant">
                        {item.width && item.height ? `${item.width}×${item.height}` : "4096×4096"}
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <div className="flex flex-col">
                          <span className="text-on-surface font-medium">{item.sunElevationDeg || 18.4}° Alt</span>
                          <span className="text-on-surface-variant font-mono-data-sm text-[10px]">{item.sunAzimuthDeg || 120.0}° Az</span>
                        </div>
                      </td>
                      <td className="py-space-xs px-space-xs">
                        <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded text-[11px] font-semibold bg-[#ecfdf5] text-[#065f46]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                          Level-2B Calibrated
                        </span>
                      </td>
                      <td className="py-space-xs px-space-xs text-center">
                        <button className={`px-space-xs py-space-2xs rounded font-mono-data-sm text-mono-data-sm ${
                          isSelected
                            ? "bg-primary text-on-primary hover:bg-secondary"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}>
                          {isSelected ? "Active" : "Inspect"}
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
              <span>Displaying 1–{filteredImages.length} of {apiImages.length} archive records</span>
              <span className="text-outline">|</span>
              <span className="text-on-surface font-medium">Selected: 1 Granule ({((selectedImage?.fileSizeBytes || 33554432) / 1048576).toFixed(1)} MB)</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="px-space-sm py-space-2xs bg-primary text-on-primary rounded font-bold">1</span>
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
                {selectedImage?.name || "CH2_OHRC_0421"}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {selectedImage?.sensor || "OHRC"} Lunar Science Orbital Product Frame
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
                <div>SENSOR: {selectedImage?.sensor || "OHRC"}</div>
                <div className="text-secondary-fixed">SUN ELEV: {selectedImage?.sunElevationDeg || 18.4}°</div>
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
                <span className="text-on-surface font-semibold">{selectedImage?.resolutionMetersPerPixel || 0.25} m/px</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Solar Incidence (i)</span>
                <span className="text-on-surface font-semibold">{((90 - (selectedImage?.sunElevationDeg || 18.4))).toFixed(2)}° (Grazing)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Ephemeris Kernel</span>
                <span className="text-[#065f46] font-semibold flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  SPICE DE421 OK
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">File Size</span>
                <span className="text-on-surface font-semibold">{((selectedImage?.fileSizeBytes || 33554432) / 1048576).toFixed(1)} MB</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <button
              onClick={handleLaunchWorkstation}
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
