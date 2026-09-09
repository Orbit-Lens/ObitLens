import Link from "next/link";

export default function ProcessingHistoryPage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>Data</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Processing History</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        Node Execution &amp; Processing Audit Log
      </h1>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
        <div className="font-mono-data-sm text-mono-data-sm space-y-2 text-on-surface">
          <div className="p-space-xs bg-surface-container-low rounded border-l-2 border-[#10b981]">
            <span className="text-secondary font-bold">[2024-10-08 14:24:19 UTC]</span> EXEC: Job #PR-LUNAR-2024-8849 completed. Inlier ratio: 91.4%. GPU Runtime: 4.18s.
          </div>
          <div className="p-space-xs bg-surface-container-low rounded border-l-2 border-secondary">
            <span className="text-secondary font-bold">[2024-10-08 11:10:02 UTC]</span> CALIB: Applied radiometric gain coefficients v4.2 to OHRC_0421.
          </div>
          <div className="p-space-xs bg-surface-container-low rounded border-l-2 border-primary-container">
            <span className="text-secondary font-bold">[2024-10-07 22:15:44 UTC]</span> SPICE: Synchronized DE421 ephemeris kernel matrices.
          </div>
        </div>
      </div>
    </div>
  );
}
