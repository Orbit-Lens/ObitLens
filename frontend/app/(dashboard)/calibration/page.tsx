"use client";

import { useState } from "react";
import Link from "next/link";

interface SensorCalib {
  sensor: string;
  fullName: string;
  gsd: string;
  status: "CALIBRATED" | "NOMINAL" | "UPDATING";
  flatFieldVersion: string;
  darkCurrentOffset: number;
  distortionCoeffs: { k1: number; k2: number; p1: number; p2: number };
  radiometricGain: number;
  lastCalibrated: string;
}

const sensorProfiles: Record<string, SensorCalib> = {
  OHRC: {
    sensor: "OHRC",
    fullName: "Orbital High Resolution Camera (Chandrayaan-2)",
    gsd: "0.25 m/pixel @ 100km altitude",
    status: "CALIBRATED",
    flatFieldVersion: "SAC-OHRC-FF-v4.2",
    darkCurrentOffset: 14.2,
    distortionCoeffs: { k1: -0.0142, k2: 0.0031, p1: 0.0004, p2: -0.0002 },
    radiometricGain: 1.042,
    lastCalibrated: "2024-10-08 09:30 UTC",
  },
  TMC2: {
    sensor: "TMC-2",
    fullName: "Terrain Mapping Camera-2 (Chandrayaan-2)",
    gsd: "5.0 m/pixel triplet stereoscopic",
    status: "CALIBRATED",
    flatFieldVersion: "SAC-TMC2-FF-v3.8",
    darkCurrentOffset: 18.6,
    distortionCoeffs: { k1: -0.0215, k2: 0.0048, p1: 0.0008, p2: -0.0005 },
    radiometricGain: 0.985,
    lastCalibrated: "2024-10-07 18:15 UTC",
  },
  IIRS: {
    sensor: "IIRS",
    fullName: "Imaging Infrared Spectrometer (0.8 - 5.0 µm)",
    gsd: "80.0 m/pixel hyperspectral",
    status: "NOMINAL",
    flatFieldVersion: "SAC-IIRS-FF-v2.1",
    darkCurrentOffset: 32.1,
    distortionCoeffs: { k1: -0.0089, k2: 0.0012, p1: 0.0001, p2: -0.0001 },
    radiometricGain: 1.018,
    lastCalibrated: "2024-10-06 14:00 UTC",
  },
};

export default function CalibrationPage() {
  const [selectedSensor, setSelectedSensor] = useState<string>("OHRC");
  const [solarElevationDeg, setSolarElevationDeg] = useState<number>(18.4);
  const [isApplying, setIsApplying] = useState(false);

  const calib = sensorProfiles[selectedSensor] || sensorProfiles["OHRC"];

  const handleApplyCalibration = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      alert(`Radiometric calibration parameters updated for ${calib.sensor}.`);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>Methods</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Calibration</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container rounded font-mono-data-sm text-mono-data-sm text-on-surface">
          RIG STATUS: <strong className="text-[#065f46]">ONLINE</strong>
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            Radiometric &amp; Optical Calibration Rig
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Calibrate instrument flat-fields, optical distortion polynomials, and dark-current noise offsets for Chandrayaan payloads.
          </p>
        </div>
        <button
          type="button"
          onClick={handleApplyCalibration}
          disabled={isApplying}
          className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>{isApplying ? "Updating..." : "Commit Calibration Matrix"}</span>
        </button>
      </div>

      {/* Sensor Selection Tabs */}
      <div className="flex items-center gap-2">
        {Object.keys(sensorProfiles).map((k) => (
          <button
            key={k}
            onClick={() => setSelectedSensor(k)}
            className={`px-4 py-2 rounded-lg font-mono-data-sm text-xs font-semibold transition-all border ${
              selectedSensor === k
                ? "bg-primary-container text-white border-primary shadow-xs"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low"
            }`}
          >
            {k} Profile
          </button>
        ))}
      </div>

      {/* Sensor Status Banner */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{calib.fullName}</span>
            <span className="px-2 py-0.5 bg-[#ecfdf5] text-[#065f46] rounded text-[11px] font-mono-data-sm font-bold">
              ● {calib.status}
            </span>
          </div>
          <span className="text-body-sm text-on-surface-variant font-mono-data-sm">{calib.gsd}</span>
        </div>
        <div className="flex items-center gap-4 font-mono-data-sm text-xs text-on-surface-variant">
          <span>Matrix: <strong className="text-secondary font-semibold">{calib.flatFieldVersion}</strong></span>
          <span>Calibrated: <strong className="text-on-surface">{calib.lastCalibrated}</strong></span>
        </div>
      </div>

      {/* Calibration Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {/* Optical Distortion Polynomial Profile */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between gap-space-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps uppercase font-bold text-on-surface">
                Radial &amp; Tangential Distortion
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">lens</span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-space-sm">
              Brown-Conrady polynomial correction parameters applied to eliminate lens focal curvature.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono-data-sm text-xs">
            <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
              <span className="text-on-surface-variant">Radial k1</span>
              <span className="font-bold text-on-surface">{calib.distortionCoeffs.k1}</span>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
              <span className="text-on-surface-variant">Radial k2</span>
              <span className="font-bold text-on-surface">{calib.distortionCoeffs.k2}</span>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
              <span className="text-on-surface-variant">Tangential p1</span>
              <span className="font-bold text-on-surface">{calib.distortionCoeffs.p1}</span>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded flex flex-col">
              <span className="text-on-surface-variant">Tangential p2</span>
              <span className="font-bold text-on-surface">{calib.distortionCoeffs.p2}</span>
            </div>
          </div>
        </div>

        {/* Radiometric Correction & Dark Current Offset */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between gap-space-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps uppercase font-bold text-on-surface">
                Radiometric Gain &amp; Offset
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">exposure</span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-space-sm">
              Converts 16-bit digital number (DN) radiance counts into calibrated physical spectral flux ($W / (m^2 \\cdot sr \\cdot \\mu m)$).
            </p>
          </div>
          <div className="flex flex-col gap-2 font-mono-data-sm text-xs">
            <div className="p-space-xs bg-surface-container-low rounded flex justify-between items-center">
              <span className="text-on-surface-variant">Dark Current Subtraction:</span>
              <span className="font-bold text-secondary">+{calib.darkCurrentOffset} DN</span>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded flex justify-between items-center">
              <span className="text-on-surface-variant">Radiometric Multiplier:</span>
              <span className="font-bold text-[#065f46]">{calib.radiometricGain}</span>
            </div>
          </div>
        </div>

        {/* Solar Incidence Angle Compensation */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between gap-space-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps uppercase font-bold text-on-surface">
                Lommel-Seeliger Photometric Normalization
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">wb_sunny</span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-space-sm">
              Compensates for severe shadow lengthening at polar latitudes near 89.9°S.
            </p>
          </div>
          <div className="flex flex-col gap-2 font-mono-data-sm text-xs">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Simulated Solar Elevation:</span>
              <span className="font-bold text-secondary">{solarElevationDeg.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="2"
              max="45"
              step="0.5"
              value={solarElevationDeg}
              onChange={(e) => setSolarElevationDeg(parseFloat(e.target.value))}
              className="w-full accent-secondary cursor-pointer"
            />
            <div className="text-[11px] text-on-surface-variant">
              Cos(i) photometric weighting factor: <strong className="text-on-surface">{(Math.cos((solarElevationDeg * Math.PI) / 180)).toFixed(3)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Flat Field Calibration Matrix Heatmap Preview */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">grid_on</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              CCD Focal Plane Sensor Response Uniformity (Flat-Field 16-Cell Matrix)
            </span>
          </div>
          <span className="font-mono-data-sm text-xs text-on-surface-variant">Variance: &lt; 0.08% RMS</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono-data-sm text-xs text-center py-2">
          {Array.from({ length: 16 }).map((_, idx) => {
            const val = (1.0 + (idx % 3 === 0 ? 0.008 : idx % 2 === 0 ? -0.006 : 0.002)).toFixed(4);
            return (
              <div
                key={idx}
                className="p-3 rounded bg-surface-container border border-surface-container-high flex flex-col items-center justify-center hover:bg-secondary/10 transition-colors"
              >
                <span className="text-[10px] text-on-surface-variant font-medium">CELL {idx + 1}</span>
                <span className="font-bold text-secondary mt-0.5">{val}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
