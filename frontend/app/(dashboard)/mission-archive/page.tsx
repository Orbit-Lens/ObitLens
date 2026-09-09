import Link from "next/link";

export default function MissionArchivePage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>Data</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Mission Archive</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        Chandrayaan Mission Archive &amp; PDS Nodes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-xs border-l-4 border-primary-container">
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Chandrayaan-3 Payload Node</span>
          <span className="font-mono-data-sm text-mono-data-sm text-secondary">SAC-AHM-CH3-ARCHIVE</span>
          <p className="text-body-sm text-on-surface-variant">LHDAC, LPDC hazard avoidance and landing site photogrammetry.</p>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-xs border-l-4 border-secondary">
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Chandrayaan-2 OHRC Archive</span>
          <span className="font-mono-data-sm text-mono-data-sm text-secondary">ISDA-BLR-CH2-OHRC</span>
          <p className="text-body-sm text-on-surface-variant">0.25m Ultra-high resolution global south pole footprint coverage.</p>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-xs border-l-4 border-secondary-container">
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Coordinated NASA LROC Node</span>
          <span className="font-mono-data-sm text-mono-data-sm text-secondary">PDS-GEO-NASA-ASU</span>
          <p className="text-body-sm text-on-surface-variant">LROC NAC/WAC ground control points and global DEM basemaps.</p>
        </div>
      </div>
    </div>
  );
}
