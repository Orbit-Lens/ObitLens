import Link from "next/link";

export default function CalibrationPage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>Methods</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Calibration</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        Radiometric &amp; Sensor Calibration Rig
      </h1>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm font-mono-data-sm text-mono-data-sm">
        <div className="flex justify-between pb-space-xs border-b border-surface-container-high">
          <span>OHRC Flat-field Correction Matrix</span>
          <span className="text-secondary font-bold">LOADED (v4.2)</span>
        </div>
        <div className="flex justify-between py-space-xs border-b border-surface-container-high">
          <span>TMC-2 Optical Distortion Profile (Polynomial)</span>
          <span className="text-secondary font-bold">CALIBRATED</span>
        </div>
        <div className="flex justify-between pt-space-xs">
          <span>IIRS Dark-current Subtraction Kernel</span>
          <span className="text-[#10b981] font-bold">NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
