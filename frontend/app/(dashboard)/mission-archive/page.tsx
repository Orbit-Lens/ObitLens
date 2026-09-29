"use client";

import { useState } from "react";
import Link from "next/link";

interface MissionNode {
  id: string;
  name: string;
  agency: string;
  instruments: string[];
  orbitType: string;
  altitudeKm: number;
  activeBundles: number;
  totalVolumeGb: number;
  status: "ONLINE" | "SYNCHRONIZED" | "STANDBY";
  pdsEndpoint: string;
}

const missionNodes: MissionNode[] = [
  {
    id: "ISRO-CH2-SAC",
    name: "Chandrayaan-2 Lunar Orbiter",
    agency: "ISRO / DOS",
    instruments: ["OHRC (0.25m)", "TMC-2 (5.0m)", "IIRS (0.8-5.0µm)", "CLASS (X-ray)"],
    orbitType: "Circular Polar 90°",
    altitudeKm: 100,
    activeBundles: 42,
    totalVolumeGb: 1420.5,
    status: "ONLINE",
    pdsEndpoint: "pds.issdc.gov.in/ch2-archive",
  },
  {
    id: "ISRO-CH3-ISTRAC",
    name: "Chandrayaan-3 Mission Node",
    agency: "ISRO / DOS",
    instruments: ["LPDC (Lander)", "LHDAC (Hazard Detection)", "SHAPE (Spectro-polarimetry)"],
    orbitType: "Landing Site 69.37°S, 32.35°E",
    altitudeKm: 0,
    activeBundles: 18,
    totalVolumeGb: 580.2,
    status: "SYNCHRONIZED",
    pdsEndpoint: "pds.issdc.gov.in/ch3-archive",
  },
  {
    id: "NASA-LRO-PDS",
    name: "NASA Lunar Reconnaissance Orbiter (Co-Registration)",
    agency: "NASA / ASU PDS",
    instruments: ["LROC NAC (0.5m)", "LROC WAC (100m)", "LOLA (Altimetry DEM)"],
    orbitType: "Elliptical Polar",
    altitudeKm: 50,
    activeBundles: 86,
    totalVolumeGb: 4890.0,
    status: "ONLINE",
    pdsEndpoint: "pds-geosciences.wustl.edu/lro",
  },
];

export default function MissionArchivePage() {
  const [selectedNode, setSelectedNode] = useState<string>("ISRO-CH2-SAC");

  const active = missionNodes.find((n) => n.id === selectedNode) || missionNodes[0];

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>Data</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Mission Archive</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface">
          PDS-4 FEDERATION: <strong className="text-[#065f46]">ONLINE</strong>
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            Chandrayaan Mission Archive &amp; PDS-4 Nodes
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Planetary data system nodes for Chandrayaan-2/3 payloads, coordinated NASA LRO ground control, and ISSDC data repositories.
          </p>
        </div>
        <Link
          href="/datasets"
          className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[16px]">dataset</span>
          <span>Browse Active Datasets</span>
        </Link>
      </div>

      {/* Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {missionNodes.map((node) => (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            className={`p-space-md rounded-xl cursor-pointer transition-all border flex flex-col justify-between gap-space-sm ${
              selectedNode === node.id
                ? "bg-surface-container-lowest border-secondary shadow-sm ring-1 ring-secondary"
                : "bg-surface-container-lowest border-outline-variant/30 hover:border-secondary/50 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-caps text-label-caps uppercase font-bold text-secondary">
                  {node.agency}
                </span>
                <span className="px-2 py-0.5 bg-[#ecfdf5] text-[#065f46] rounded text-[10px] font-mono-data-sm font-bold">
                  ● {node.status}
                </span>
              </div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{node.name}</h2>
              <span className="font-mono-data-sm text-xs text-on-surface-variant">{node.orbitType}</span>
            </div>

            <div className="pt-space-xs border-t border-surface-container flex items-center justify-between font-mono-data-sm text-xs text-on-surface-variant">
              <span>{node.activeBundles} PDS Bundles</span>
              <span className="font-bold text-on-surface">{node.totalVolumeGb.toLocaleString()} GB</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Detailed Architecture */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">Federated Archive Node</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{active.name}</h2>
          </div>
          <div className="flex items-center gap-2 font-mono-data-sm text-xs">
            <span className="text-on-surface-variant">Endpoint:</span>
            <code className="px-2 py-1 bg-surface-container rounded text-secondary font-bold select-all">
              https://{active.pdsEndpoint}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md font-mono-data-sm text-xs">
          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Orbital Altitude</span>
            <span className="font-mono-data-lg text-headline-sm text-on-surface font-bold">{active.altitudeKm} km</span>
            <span className="text-[11px] text-secondary">Polar Circular Mapping</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">PDS-4 Archive Bundles</span>
            <span className="font-mono-data-lg text-headline-sm text-on-surface font-bold">{active.activeBundles} Bundles</span>
            <span className="text-[11px] text-[#065f46]">100% Schema Validated</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Telemetry Footprint</span>
            <span className="font-mono-data-lg text-headline-sm text-on-surface font-bold">{active.totalVolumeGb.toLocaleString()} GB</span>
            <span className="text-[11px] text-on-surface-variant">Cloud COG GeoTIFF Ready</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">SPICE Geometry Kernels</span>
            <span className="font-mono-data-lg text-headline-sm text-on-surface font-bold">DE421 / CH2_V02</span>
            <span className="text-[11px] text-secondary">IAU_LUNAR_2000 CRS</span>
          </div>
        </div>

        {/* Instruments Mounted */}
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
            Mounted Scientific Payloads &amp; Sensors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {active.instruments.map((inst, idx) => (
              <div key={idx} className="p-3 rounded bg-surface-container-low flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">satellite</span>
                <span className="font-mono-data-sm text-xs font-bold text-on-surface">{inst}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
