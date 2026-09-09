import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>System</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Settings</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        Scientific Workstation Configuration
      </h1>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm font-mono-data-sm text-mono-data-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
          <div className="flex flex-col">
            <span className="font-bold text-on-surface">GPU Hardware Acceleration</span>
            <span className="text-body-sm text-on-surface-variant">Allocate 4x NVIDIA A100 Tensor Core cluster</span>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
        </div>
        <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
          <div className="flex flex-col">
            <span className="font-bold text-on-surface">Automatic Ephemeris Sync</span>
            <span className="text-body-sm text-on-surface-variant">Sync SPICE kernels on orbit pass telemetry ingest</span>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
        </div>
      </div>
    </div>
  );
}
