"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
}

function NewAnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refIdParam = searchParams.get("refId");
  const srcIdParam = searchParams.get("srcId");

  const [images, setImages] = useState<LunarImage[]>([]);
  const [refImageId, setRefImageId] = useState<string>("");
  const [srcImageId, setSrcImageId] = useState<string>("");

  const [detector, setDetector] = useState<"SIFT" | "ORB" | "SuperPoint">("SIFT");
  const [matcher, setMatcher] = useState<"FLANN" | "LightGlue" | "SuperGlue">("FLANN");
  const [keypointBudget, setKeypointBudget] = useState(5000);
  const [estimator, setEstimator] = useState<"RANSAC" | "USAC" | "MAGSAC++">("MAGSAC++");
  const [matrixModel, setMatrixModel] = useState<"Homography" | "Affine" | "Rigid">("Homography");
  const [illuminationCorrection, setIlluminationCorrection] = useState(true);
  const [reprojThreshold, setReprojThreshold] = useState(2.0);

  const [isExecuting, setIsExecuting] = useState(false);
  const [execStatus, setExecStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load available catalog images
  useEffect(() => {
    async function loadCatalog() {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch("/api/v1/images?limit=50", { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            const list: LunarImage[] = json.data;
            setImages(list);

            const initialRef = refIdParam && list.some((i) => i._id === refIdParam)
              ? refIdParam
              : (list.find((i) => i.sensor === "OHRC")?._id || list[0]._id);

            const initialSrc = srcIdParam && list.some((i) => i._id === srcIdParam)
              ? srcIdParam
              : (list.find((i) => i.sensor === "TMC-2" && i._id !== initialRef)?._id ||
                 list.find((i) => i._id !== initialRef)?._id ||
                 list[0]._id);

            setRefImageId(initialRef);
            setSrcImageId(initialSrc);
          }
        }
      } catch (err) {
        console.error("Failed to load images for analysis:", err);
      }
    }
    loadCatalog();
  }, [refIdParam, srcIdParam]);

  const refImage = images.find((i) => i._id === refImageId) || images[0];
  const srcImage = images.find((i) => i._id === srcImageId) || images[1] || images[0];

  const handleRunPipeline = async () => {
    if (!refImageId || !srcImageId) {
      setErrorMessage("Please select both a reference and a source image.");
      return;
    }
    if (refImageId === srcImageId) {
      setErrorMessage("Source and Reference images must be different.");
      return;
    }

    setIsExecuting(true);
    setErrorMessage("");
    setExecStatus("DISPATCHING PHOTOGRAMMETRIC PIPELINE...");

    const token = getToken();
    try {
      const res = await fetch("/api/v1/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sourceImageId: srcImageId,
          referenceImageId: refImageId,
          algorithm: detector === "SuperPoint" ? "learned" : "classical",
          transformModel: matrixModel.toLowerCase() === "affine" ? "affine" : "homography",
          parameters: {
            coverageTargetCells: 64,
            ratioThreshold: 0.75,
            ransacReprojThreshold: reprojThreshold,
            maxPyramidLevels: 4,
            illuminationCorrection,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to create registration job");
      }

      setExecStatus("REGISTRATION QUEUED • OPENING WORKSPACE...");
      setTimeout(() => {
        router.push(`/registration?jobId=${json.data._id}`);
      }, 1000);
    } catch (err: any) {
      setIsExecuting(false);
      setErrorMessage(err.message || "Failed to start pipeline analysis");
    }
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

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="mb-space-sm p-space-sm bg-error-container text-on-error-container rounded-lg font-mono-data-sm text-mono-data-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="hover:opacity-75">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

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
              <span className="font-headline-sm text-headline-sm text-on-primary truncate">REFERENCE FRAME</span>
            </div>
            <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm">
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">
                {refImage?.sensor || "OHRC"}
              </span>
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
                {refImage?.sensor || "OHRC"}
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-secondary-fixed-dim font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                {refImage?.resolutionMetersPerPixel || 0.25} m/px GSD
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                {refImage?.format || "GEOTIFF"}
              </span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs font-mono-data-sm text-mono-data-sm">
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sensor</span>
                <span className="text-on-surface font-semibold">{refImage?.sensor || "OHRC"}</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Product</span>
                <span className="text-on-surface font-semibold truncate">{refImage?.name || "CH2_OHRC_0421"}</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sun Angle</span>
                <span className="text-on-surface font-semibold">{refImage?.sunElevationDeg || 18.4}° Alt</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Azimuth</span>
                <span className="text-secondary font-semibold truncate">{refImage?.sunAzimuthDeg || 120.0}°</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs">
              <div className="flex items-center gap-space-xs">
                <select
                  value={refImageId}
                  onChange={(e) => setRefImageId(e.target.value)}
                  className="px-space-sm py-1 rounded bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-medium hover:bg-secondary transition-colors cursor-pointer focus:outline-none"
                >
                  {images.map((img) => (
                    <option key={img._id} value={img._id} className="bg-surface-container text-on-surface">
                      {img.name} ({img.sensor} • {img.resolutionMetersPerPixel}m)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-0.5 rounded bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                  GSD: <strong className="text-on-surface font-semibold">{refImage?.resolutionMetersPerPixel || 0.25} m/px</strong>
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
              <span className="font-headline-sm text-headline-sm text-inverse-on-surface truncate">SOURCE FRAME</span>
            </div>
            <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm">
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">
                {srcImage?.sensor || "TMC-2"}
              </span>
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
                {srcImage?.sensor || "TMC-2"}
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-secondary-fixed-dim font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                {srcImage?.resolutionMetersPerPixel || 5.0} m/px GSD
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-container/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm backdrop-blur-sm shadow-sm">
                {srcImage?.format || "GEOTIFF"}
              </span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs font-mono-data-sm text-mono-data-sm">
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sensor</span>
                <span className="text-on-surface font-semibold">{srcImage?.sensor || "TMC-2"}</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Product</span>
                <span className="text-on-surface font-semibold truncate">{srcImage?.name || "CH2_TMC2_1187"}</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sun Angle</span>
                <span className="text-on-surface font-semibold">{srcImage?.sunElevationDeg || 21.4}° Alt</span>
              </div>
              <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Azimuth</span>
                <span className="text-secondary font-semibold truncate">{srcImage?.sunAzimuthDeg || 122.1}°</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs">
              <div className="flex items-center gap-space-xs">
                <select
                  value={srcImageId}
                  onChange={(e) => setSrcImageId(e.target.value)}
                  className="px-space-sm py-1 rounded bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-medium hover:bg-secondary transition-colors cursor-pointer focus:outline-none"
                >
                  {images.map((img) => (
                    <option key={img._id} value={img._id} className="bg-surface-container text-on-surface">
                      {img.name} ({img.sensor} • {img.resolutionMetersPerPixel}m)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="px-space-xs py-0.5 rounded bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                  GSD: <strong className="text-on-surface font-semibold">{srcImage?.resolutionMetersPerPixel || 5.0} m/px</strong>
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
                <th className="py-2.5 px-space-md font-semibold">Reference Image ({refImage?.sensor || "OHRC"})</th>
                <th className="py-2.5 px-space-md font-semibold">Source Image ({srcImage?.sensor || "TMC-2"})</th>
                <th className="py-2.5 px-space-md font-semibold">Delta &amp; Alignment Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 text-on-surface">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Ground Sampling Distance (GSD)</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">{refImage?.resolutionMetersPerPixel || 0.25} m/px</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">{srcImage?.resolutionMetersPerPixel || 5.0} m/px</td>
                <td className="py-2.5 px-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high font-medium text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Scale Ratio 1 : {((srcImage?.resolutionMetersPerPixel || 5.0) / (refImage?.resolutionMetersPerPixel || 0.25)).toFixed(1)}x
                  </span>
                </td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Solar Elevation</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">{refImage?.sunElevationDeg || 18.4}°</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">{srcImage?.sunElevationDeg || 21.4}°</td>
                <td className="py-2.5 px-space-md">
                  <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Δ {Math.abs((refImage?.sunElevationDeg || 18.4) - (srcImage?.sunElevationDeg || 21.4)).toFixed(2)}° • Minimal Shadow Delta
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-2.5 px-space-md font-medium text-on-surface-variant">Solar Azimuth</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">{refImage?.sunAzimuthDeg || 120.0}°</td>
                <td className="py-2.5 px-space-md font-semibold text-on-surface">{srcImage?.sunAzimuthDeg || 122.1}°</td>
                <td className="py-2.5 px-space-md text-on-surface-variant font-mono-data-sm">
                  Δ {Math.abs((refImage?.sunAzimuthDeg || 120.0) - (srcImage?.sunAzimuthDeg || 122.1)).toFixed(1)}° (Illumination Vector Co-aligned)
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
                <input
                  type="checkbox"
                  checked={illuminationCorrection}
                  onChange={(e) => setIlluminationCorrection(e.target.checked)}
                  className="mt-0.5 rounded accent-primary text-on-primary w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">Radiometric Normalization</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Sensor Gain &amp; Solar Flux correction</span>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                <input defaultChecked type="checkbox" className="mt-0.5 rounded accent-primary text-on-primary w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">Contrast Normalization</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">CLAHE adaptive histogram equalization</span>
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
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Exclude extreme shadowing in crater floors</span>
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
                  <select
                    value={reprojThreshold}
                    onChange={(e) => setReprojThreshold(Number(e.target.value))}
                    className="bg-transparent font-mono-data-md text-mono-data-md font-semibold text-on-surface focus:outline-none cursor-pointer"
                  >
                    <option value={1.5}>1.5 px</option>
                    <option value={2.0}>2.0 px</option>
                    <option value={3.0}>3.0 px</option>
                  </select>
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
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">ACCELERATION</span>
                  <span className="font-mono-data-sm text-mono-data-sm font-medium truncate">Multi-core OpenMP / CUDA</span>
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
            <span className="text-secondary-fixed font-semibold">
              {isExecuting ? execStatus : "SYSTEM READY FOR PIPELINE RUN"}
            </span>
          </div>
          <span className="text-on-primary-container hidden sm:inline">•</span>
          <span className="text-on-primary-container hidden sm:inline">Ref: {refImage?.name} ↔ Src: {srcImage?.name}</span>
        </div>

        <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setDetector("SIFT");
              setMatrixModel("Homography");
              setKeypointBudget(5000);
              setReprojThreshold(2.0);
              setIlluminationCorrection(true);
            }}
            className="px-space-md py-2 rounded font-mono-data-sm text-mono-data-sm font-medium text-inverse-on-surface hover:bg-primary transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset to Default ISRO Profile
          </button>

          <button
            type="button"
            onClick={handleRunPipeline}
            disabled={isExecuting}
            className={`px-space-xl py-2.5 rounded text-on-secondary font-headline-sm text-headline-sm font-semibold shadow-[0_0_15px_rgba(91,184,254,0.4)] transition-all flex items-center gap-2 ${
              isExecuting
                ? "bg-[#10b981] text-white cursor-not-allowed"
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

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono">Loading Analysis Workstation...</div>}>
      <NewAnalysisContent />
    </Suspense>
  );
}

