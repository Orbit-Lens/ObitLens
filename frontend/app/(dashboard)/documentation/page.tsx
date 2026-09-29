"use client";

import { useState } from "react";
import Link from "next/link";

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<"API" | "PDS4" | "CRS" | "WORKFLOWS">("API");

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>Methods</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Documentation</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface">
          API v1.0.0 // PDS4 v1.21
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            PDS4 Standards &amp; Developer Manual
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Technical specifications, REST API documentation, lunar coordinate reference systems, and integration guides.
          </p>
        </div>
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          <span>FastAPI Interactive Docs</span>
        </a>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        {(["API", "PDS4", "CRS", "WORKFLOWS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-mono-data-sm text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-secondary text-white shadow-xs"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab === "API"
              ? "REST API Reference"
              : tab === "PDS4"
              ? "PDS-4 Product Schema"
              : tab === "CRS"
              ? "Lunar Coordinate Frames"
              : "End-to-End Workflows"}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: API */}
      {activeTab === "API" && (
        <div className="flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#ecfdf5] text-[#065f46] font-mono-data-sm text-xs font-bold rounded">
                POST
              </span>
              <code className="font-mono-data-md text-on-surface font-semibold text-sm">/api/v1/jobs/register</code>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Dispatches a sub-pixel lunar image registration job to the GPU processing pipeline.
            </p>
            <div className="bg-primary-container text-white p-space-md rounded-lg font-mono-data-sm text-xs overflow-x-auto">
              <pre>{`curl -X POST http://localhost:5000/api/v1/jobs/register \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "referenceImageId": "6a9d6ad0f14be50d908ad701",
    "sourceImageId": "6a9d6ad0f14be50d908ad702",
    "algorithm": "sift",
    "matcher": "flann",
    "transformModel": "homography",
    "parameters": {
      "keypointBudget": 5000,
      "ransacThreshold": 2.0,
      "illuminationCorrection": true
    }
  }'`}</pre>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container text-secondary font-mono-data-sm text-xs font-bold rounded">
                GET
              </span>
              <code className="font-mono-data-md text-on-surface font-semibold text-sm">/api/v1/jobs/:jobId</code>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Polls the live status, progress percentage, transformation matrix, and artifact download URLs.
            </p>
            <div className="bg-primary-container text-white p-space-md rounded-lg font-mono-data-sm text-xs overflow-x-auto">
              <pre>{`// Response payload (200 OK)
{
  "success": true,
  "data": {
    "_id": "6a9d6ad0f14be50d908ad705",
    "status": "complete",
    "progress": 100,
    "metrics": {
      "rmse": 0.52,
      "inlierCount": 842,
      "totalCandidateMatches": 1146,
      "inlierRatio": 0.914,
      "meanReprojectionError": 0.48
    },
    "artifacts": {
      "registeredImageUrl": "http://localhost:5000/api/v1/storage/download/ch2_registered.tif",
      "differenceMapUrl": "http://localhost:5000/api/v1/storage/download/difference_map.png"
    }
  }
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PDS4 */}
      {activeTab === "PDS4" && (
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md font-mono-data-sm text-xs">
          <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              PDS-4 Label Template (Product_Observational)
            </span>
            <span className="text-secondary font-bold">XML Schema v1.21</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Every registered output raster is wrapped in a compliant PDS-4 observational product label conforming to the Planetary Data System standard.
          </p>
          <div className="bg-primary-container text-secondary-fixed p-space-md rounded-lg overflow-x-auto">
            <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<Product_Observational xmlns="http://pds.nasa.gov/pds4/pds/v1">
  <Identification_Area>
    <logical_identifier>urn:isro:pds4:ch2:ohrc:registered_0421</logical_identifier>
    <version_id>1.0</version_id>
    <title>Chandrayaan-2 OHRC Registered Orthorectified Raster</title>
    <information_model_version>1.21.0.0</information_model_version>
    <product_class>Product_Observational</product_class>
  </Identification_Area>
  <Observation_Area>
    <Time_Coordinates>
      <start_date_time>2024-10-08T04:12:00.000Z</start_date_time>
      <stop_date_time>2024-10-08T04:12:12.450Z</stop_date_time>
    </Time_Coordinates>
    <Target_Identification>
      <name>Moon</name>
      <type>Satellite</type>
    </Target_Identification>
  </Observation_Area>
  <File_Area_Observational>
    <File>
      <file_name>CH2_OHRC_0421_REG.TIF</file_name>
      <file_size unit="byte">42890124</file_size>
    </File>
  </File_Area_Observational>
</Product_Observational>`}</pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CRS */}
      {activeTab === "CRS" && (
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Lunar Coordinate Reference Systems (CRS)
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              OrbitLens standardizes all registration datasets into IAU_LUNAR_2000 planetary coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-mono-data-sm text-xs">
            <div className="p-space-md bg-surface-container-low rounded flex flex-col gap-2">
              <span className="font-bold text-secondary text-sm">IAU_LUNAR_2000 (Spherical &amp; Orthographic)</span>
              <p className="text-on-surface-variant">
                Standard lunar reference sphere with equatorial radius R = 1737.4 km. Used for polar stereographic projections centered at 89.9°S.
              </p>
              <div className="text-[11px] text-on-surface bg-surface-container p-2 rounded">
                PROJCS[&quot;Moon_2000_SouthPole_Stereographic&quot;,<br />
                GEOGCS[&quot;GCS_Moon_2000&quot;,<br />
                DATUM[&quot;D_Moon_2000&quot;, SPHEROID[&quot;Moon_2000_IAU_IAG&quot;,1737400.0,0.0]],<br />
                PRIMEM[&quot;Reference_Meridian&quot;,0.0],<br />
                UNIT[&quot;Degree&quot;,0.0174532925199433]]
              </div>
            </div>

            <div className="p-space-md bg-surface-container-low rounded flex flex-col gap-2">
              <span className="font-bold text-primary-container text-sm">SPICE Ephemeris Kernel Matrices (DE421)</span>
              <p className="text-on-surface-variant">
                Provides frame transformations between the Chandrayaan-2/3 spacecraft body frame, camera optical boresight, and J2000 inertial frame.
              </p>
              <div className="text-[11px] text-on-surface bg-surface-container p-2 rounded">
                Spacecraft clock: SCLK_CH2_2024<br />
                Instrument kernel: ch2_ohrc_v04.ti<br />
                Leapseconds kernel: naif0012.tls<br />
                Planetary ephemeris: de421.bsp
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WORKFLOWS */}
      {activeTab === "WORKFLOWS" && (
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Recommended Operational Workflows
          </h2>
          <div className="space-y-3 font-mono-data-sm text-xs">
            <div className="p-space-sm bg-surface-container-low rounded border-l-4 border-secondary">
              <span className="font-bold text-on-surface text-sm">Workflow A: Cross-Sensor Alignment (OHRC ↔ TMC-2)</span>
              <p className="text-on-surface-variant text-body-sm mt-1">
                When co-registering high-resolution 0.25m OHRC with 5.0m TMC-2: select SIFT detector with FLANN k-d matching, enable Lommel-Seeliger photometric correction, and run MAGSAC++ homography.
              </p>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded border-l-4 border-primary-container">
              <span className="font-bold text-on-surface text-sm">Workflow B: Steep Relief Crater Wall Registration</span>
              <p className="text-on-surface-variant text-body-sm mt-1">
                For crater basins with steep parallax (e.g. Shackleton rim): select Thin-Plate Spline (TPS) transformation model with 2.5px reprojection error budget to accommodate terrain elevation disparities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
