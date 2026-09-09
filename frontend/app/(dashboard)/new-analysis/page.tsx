"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [detector, setDetector] = useState<"SIFT" | "ORB" | "SuperPoint">("SIFT");
  const [matcher, setMatcher] = useState<"FLANN" | "LightGlue" | "SuperGlue">("FLANN");
  const [keypointBudget, setKeypointBudget] = useState(5000);
  const [estimator, setEstimator] = useState<"RANSAC" | "USAC" | "MAGSAC++">("MAGSAC++");
  const [matrixModel, setMatrixModel] = useState<"Homography" | "Affine" | "Rigid">("Homography");
  const [isExecuting, setIsExecuting] = useState(false);
  const [execStatus, setExecStatus] = useState("");

  const handleRunPipeline = () => {
    setIsExecuting(true);
    setExecStatus("EXECUTING SIFT / MAGSAC++...");
    setTimeout(() => {
      setExecStatus("ANALYSIS COMPLETE (3,842 TIE-POINTS)");
      setTimeout(() => {
        router.push("/registration");
      }, 1200);
    }, 1800);
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* BREADCRUMB & METADATA BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm py-space-sm">
        <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span className="text-outline-variant">/</span>
          <span className="hover:text-secondary">Workspace</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">New Analysis</span>
        </div>
        <div className="flex items-center gap-space-md font-mono-data-sm text-mono-data-sm">
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            PIPELINE ID: <span className="text-secondary font-semibold">PR-LUNAR-2024-8849</span>
          </span>
          <span className="text-on-surface-variant">NODE: SAC-AHM-04</span>
        </div>
      </div>

      {/* WORKFLOW STEPPER */}
      <div className="mt-space-xs mb-space-md p-space-sm bg-surface-container-low rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          {/* Step 01 Active */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-primary text-on-primary shadow-sm">
            <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center font-mono-data-sm text-mono-data-sm font-bold text-on-secondary">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary-fixed">Step 01 • Active</span>
              <span className="font-headline-sm text-headline-sm truncate text-on-primary">01 Select Images</span>
            </div>
            <span className="ml-auto material-symbols-outlined text-[18px] text-secondary-container animate-pulse">radio_button_checked</span>
          </div>

          {/* Step 02 Pending */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container text-on-surface-variant">
            <div className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">
              02
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Step 02 • Queued</span>
              <span className="font-headline-sm text-headline-sm truncate text-on-surface">Configure Analysis</span>
            </div>
            <span className="ml-auto material-symbols-outlined text-[18px] text-outline-variant">schedule</span>
          </div>

          {/* Step 03 Pending */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container text-on-surface-variant">
            <div className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">
              03
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">Step 03 • Execution</span>
              <span className="font-headline-sm text-headline-sm truncate text-on-surface">Run Pipeline</span>
            </div>
            <span className="ml-auto material-symbols-outlined text-[18px] text-outline-variant">bolt</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DUAL FRAME PHOTOGRAMMETRY VIEWPORTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg mb-space-lg">
        {/* Panel A: REFERENCE IMAGE */}
        <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-space-md py-space-sm bg-primary text-on-primary">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Frame A • Reference Master</span>
              <span className="font-headline-sm text-headline-sm text-on-primary">REFERENCE IMAGE (PRIMARY FRAME)</span>
            </div>
            <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm">
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">OHRC-CAM</span>
            </div>
          </div>
          <div className="relative w-full h-80 bg-primary-container overflow-hidden group">
            <Image
              src="/images/crater-terrain-reference.png"
              alt="Lunar South Pole High Resolution Orthomosaic"
              fill
              className="object-cover select-none transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 flex items-center justify-center opacity-75">
                <span className="material-symbols-outlined text-secondary-fixed text-[36px]">filter_center_focus</span>
              </div>
            </div>
            <div className="absolute top-space-sm left-space-sm flex flex-wrap gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm font-semibold backdrop-blur-sm shadow-sm">
                OHRC
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-secondary-fixed-dim font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                0.25 m/px GSD
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                GeoTIFF PDS4
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                4096 × 4096 px
              </span>
            </div>
            <div className="absolute bottom-space-sm right-space-sm px-2 py-1 rounded bg-primary/80 backdrop-blur-sm text-on-primary font-mono-data-sm text-mono-data-sm flex items-center gap-2">
              <span>Scale: 1:25,000</span>
              <div className="w-10 h-1 bg-secondary"></div>
              <span>500 m</span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs font-mono-data-sm text-mono-data-sm">
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Orbit No.</span>
                <span className="text-on-surface font-semibold">1245</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Geographic Target</span>
                <span className="text-on-surface font-semibold truncate">South Pole Rim</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sun Angle</span>
                <span className="text-on-surface font-semibold">18.4° Solar Alt</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">PDS Product UID</span>
                <span className="text-secondary font-semibold truncate">CH2_OHRC_20241008</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs">
              <div className="flex items-center gap-space-xs">
                <button className="px-space-sm py-1 rounded bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-medium hover:bg-secondary transition-colors flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">cached</span> Change Frame
                </button>
                <button className="px-space-sm py-1 rounded bg-surface-container-highest text-on-surface font-mono-data-sm text-mono-data-sm font-medium hover:bg-surface-variant transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span> View Metadata
                </button>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-0.5 rounded bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                  Spectral: <strong className="text-on-surface font-semibold">PAN (450–900 nm)</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel B: SOURCE IMAGE */}
        <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-space-md py-space-sm bg-primary-container text-inverse-on-surface">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Frame B • Registration Target</span>
              <span className="font-headline-sm text-headline-sm text-inverse-on-surface">SOURCE IMAGE (TO BE REGISTERED)</span>
            </div>
            <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm">
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">TMC-2 STEREO</span>
            </div>
          </div>
          <div className="relative w-full h-80 bg-primary-container overflow-hidden group">
            <Image
              src="/images/crater-terrain-reference.png"
              alt="Terrain Mapping Camera Crater Oblique Strip"
              fill
              className="object-cover select-none transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 flex items-center justify-center opacity-75">
                <span className="material-symbols-outlined text-secondary-container text-[36px]">adjust</span>
              </div>
            </div>
            <div className="absolute top-space-sm left-space-sm flex flex-wrap gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm font-semibold backdrop-blur-sm shadow-sm">
                TMC-2
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-secondary-fixed-dim font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                5.0 m/px GSD
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                GeoTIFF Level-2B
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                2048 × 2048 px
              </span>
            </div>
            <div className="absolute bottom-space-sm right-space-sm px-2 py-1 rounded bg-primary/80 backdrop-blur-sm text-on-primary font-mono-data-sm text-mono-data-sm flex items-center gap-2">
              <span>Scale: 1:100,000</span>
              <div className="w-8 h-1 bg-secondary"></div>
              <span>2 km</span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs font-mono-data-sm text-mono-data-sm">
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Orbit No.</span>
                <span className="text-on-surface font-semibold">1187</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Geographic Target</span>
                <span className="text-on-surface font-semibold truncate">Manzinus C</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sun Angle</span>
                <span className="text-on-surface font-semibold">22.1° Solar Alt</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">PDS Product UID</span>
                <span className="text-secondary font-semibold truncate">CH2_TMC2_20240915</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs">
              <div className="flex items-center gap-space-xs">
                <button className="px-space-sm py-1 rounded bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-medium hover:bg-secondary transition-colors flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">cached</span> Change Frame
                </button>
                <button className="px-space-sm py-1 rounded bg-surface-container-highest text-on-surface font-mono-data-sm text-mono-data-sm font-medium hover:bg-surface-variant transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">grid_4x4</span> Resample Grid
                </button>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-0.5 rounded bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                  Geometry: <strong className="text-on-surface font-semibold">Stereo Nadir (0°)</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: METADATA MATRIX */}
      <div className="mb-space-lg bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">difference</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">METADATA &amp; GEOMETRY COMPARISON MATRIX</span>
          </div>
          <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">
            COORDINATE REFERENCE: <strong className="text-on-surface">IAU_2000_MOON SPHERE (R=1737.4 KM)</strong>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data-sm text-mono-data-sm">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-2.5 px-space-md font-semibold">Parameter / Sensor State</th>
                <th className="py-2.5 px-space-md font-semibold">Reference Image (OHRC)</th>
                <th className="py-2.5 px-space-md font-semibold">Source Image (TMC-2)</th>
                <th className="py-2.5 px-space-md font-semibold">Delta &amp; Alignment Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 text-on-surface">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Center Latitude</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">85.2418° S</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">85.2492° S</td>
                <td className="py-2.5 px-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high font-medium text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Δ 0.0074° (~820 m) • Within Overlap Envelope
                  </span>
                </td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Center Longitude</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">128.9204° E</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">128.9110° E</td>
                <td className="py-2.5 px-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high font-medium text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Δ 0.0094° (~105 m)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Solar Elevation</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">18.42°</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">22.10°</td>
                <td className="py-2.5 px-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                    Δ 3.68° • Shadow Parallax Warning: Minor
                  </span>
                </td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Solar Azimuth</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">312.4°</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">309.8°</td>
                <td className="py-2.5 px-space-md text-on-surface-variant font-mono-data-sm">
                  Δ 2.6° (Illumination Vector Co-aligned)
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Sensor Emission Angle</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">0.85°</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">2.14°</td>
                <td className="py-2.5 px-space-md text-on-surface-variant font-mono-data-sm">
                  Δ 1.29° (Off-Nadir Distortion Minimal)
                </td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Geodetic Datum / CRS</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">IAU_2000_MOON</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">IAU_2000_MOON</td>
                <td className="py-2.5 px-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high font-medium text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Identical Geodesic Datum
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: PROCESSING CONFIGURATION & ALGORITHM PIPELINE */}
      <div className="mb-space-lg">
        <div className="flex items-center gap-space-sm mb-space-sm">
          <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Processing Configuration &amp; Algorithm Pipeline</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Group 1: Preprocessing */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-low -mx-space-md -mt-space-md px-space-md pt-space-md rounded-t-xl">
              <div className="flex items-center gap-space-xs">
                <span className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center font-mono-data-sm text-mono-data-sm font-bold">1</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">PREPROCESSING</span>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Signal Prep</span>
            </div>
            <div className="flex flex-col gap-space-sm mt-space-xs">
              <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                <input defaultChecked type="checkbox" className="mt-0.5 rounded accent-primary text-on-primary w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">Radiometric Normalization</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Level-2B Sensor Gain &amp; Solar Flux correction</span>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                <input defaultChecked type="checkbox" className="mt-0.5 rounded accent-primary text-on-primary w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">Contrast Normalization</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">CLAHE adaptive histogram equalization (Clip limit: 2.4)</span>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                <input defaultChecked type="checkbox" className="mt-0.5 rounded accent-primary text-on-primary w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">Bilateral Filtering</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Regolith speckle &amp; cosmic ray noise suppression</span>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors opacity-75">
                <input type="checkbox" className="mt-0.5 rounded accent-primary text-on-primary w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">Shadow Mask Exclusion</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Threshold solar incidence angle &gt; 82° in crater floors</span>
                </div>
              </label>
            </div>
          </div>

          {/* Group 2: Feature Detection */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-low -mx-space-md -mt-space-md px-space-md pt-space-md rounded-t-xl">
              <div className="flex items-center gap-space-xs">
                <span className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center font-mono-data-sm text-mono-data-sm font-bold">2</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">FEATURE DETECTION &amp; MATCHING</span>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Extraction</span>
            </div>
            <div className="flex flex-col gap-space-md mt-space-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Feature Detector Engine</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg">
                  {(["SIFT", "ORB", "SuperPoint"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setDetector(item)}
                      className={`py-1.5 text-center font-mono-data-sm text-mono-data-sm transition-colors rounded ${
                        detector === item
                          ? "font-semibold bg-primary text-on-primary shadow-sm"
                          : "font-medium text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Tie-Point Correspondence Engine</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg">
                  {(["FLANN", "LightGlue", "SuperGlue"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setMatcher(item)}
                      className={`py-1.5 text-center font-mono-data-sm text-mono-data-sm transition-colors rounded ${
                        matcher === item
                          ? "font-semibold bg-primary text-on-primary shadow-sm"
                          : "font-medium text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      {item === "FLANN" ? "FLANN (k-d)" : item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Feature Point Target Budget</span>
                  <span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">{keypointBudget.toLocaleString()} Keypoints</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={keypointBudget}
                  onChange={(e) => setKeypointBudget(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-mono-data-sm font-mono-data-sm text-on-surface-variant">
                  <span>1k</span>
                  <span>5k (Optimal)</span>
                  <span>20k</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                <span className="font-body-sm text-body-sm font-medium text-on-surface">Sub-pixel Refinement</span>
                <span className="font-mono-data-sm text-mono-data-sm px-space-xs py-0.5 rounded bg-surface-container font-semibold text-on-surface">
                  Quadratic Interpolation
                </span>
              </div>
            </div>
          </div>

          {/* Group 3: Verification */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-low -mx-space-md -mt-space-md px-space-md pt-space-md rounded-t-xl">
              <div className="flex items-center gap-space-xs">
                <span className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center font-mono-data-sm text-mono-data-sm font-bold">3</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">GEOMETRIC VERIFICATION</span>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Epipolar Fit</span>
            </div>
            <div className="flex flex-col gap-space-md mt-space-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Robust Model Estimator</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg">
                  {(["RANSAC", "USAC", "MAGSAC++"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setEstimator(item)}
                      className={`py-1.5 text-center font-mono-data-sm text-mono-data-sm transition-colors rounded ${
                        estimator === item
                          ? "font-semibold bg-primary text-on-primary shadow-sm"
                          : "font-medium text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Spatial Transformation Matrix</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg">
                  {(["Homography", "Affine", "Rigid"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setMatrixModel(item)}
                      className={`py-1.5 text-center font-mono-data-sm text-mono-data-sm text-[11px] truncate px-1 transition-colors rounded ${
                        matrixModel === item
                          ? "font-semibold bg-primary text-on-primary shadow-sm"
                          : "font-medium text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      {item === "Homography" ? "Homography (3x3)" : item === "Rigid" ? "Rigid (SE2)" : item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-space-xs">
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Inlier Error</span>
                  <span className="font-mono-data-md text-mono-data-md font-semibold text-on-surface">2.0 px</span>
                </div>
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Max Iter</span>
                  <span className="font-mono-data-md text-mono-data-md font-semibold text-on-surface">10,000</span>
                </div>
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Confidence</span>
                  <span className="font-mono-data-md text-mono-data-md font-semibold text-on-surface">99.9%</span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm p-space-sm rounded bg-surface-container-high text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px]">memory</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">CUDA ACCELERATION</span>
                  <span className="font-mono-data-sm text-mono-data-sm font-medium truncate">CuPy / TensorRT Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STICKY ACTION BAR */}
      <div className="sticky bottom-7 z-30 p-space-md rounded-xl bg-primary-container text-inverse-on-surface shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md font-mono-data-sm text-mono-data-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
            <span className="text-secondary-fixed font-semibold">ESTIMATED RUNTIME: ~4.2s</span>
          </div>
          <span className="text-on-primary-container hidden sm:inline">•</span>
          <span className="text-on-primary-container hidden sm:inline">Allocated Cluster: NVIDIA A100 Tensor Core (SAC-NODE-04)</span>
        </div>

        <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
          <button className="px-space-md py-2 rounded font-mono-data-sm text-mono-data-sm font-medium text-inverse-on-surface hover:bg-primary transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset to Default ISRO Profile
          </button>

          <button
            type="button"
            onClick={handleRunPipeline}
            disabled={isExecuting}
            className={`px-space-xl py-2.5 rounded text-on-secondary font-headline-sm text-headline-sm font-semibold shadow-[0_0_15px_rgba(91,184,254,0.4)] transition-all flex items-center gap-2 ${
              isExecuting
                ? "bg-[#10b981] text-white"
                : "bg-secondary hover:bg-secondary-container hover:text-on-secondary-container"
            }`}
          >
            {isExecuting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>{execStatus}</span>
              </>
            ) : (
              <>
                <span>RUN CORRESPONDENCE ANALYSIS</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
