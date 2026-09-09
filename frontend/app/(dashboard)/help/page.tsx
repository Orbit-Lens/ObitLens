import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>System</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Help &amp; Support</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        ISRO SAC Remote Sensing Support Desk
      </h1>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm font-mono-data-sm text-mono-data-sm flex flex-col gap-space-md">
        <div className="p-space-sm bg-surface-container-low rounded border-l-4 border-secondary">
          <span className="font-bold text-on-surface">Space Applications Centre (SAC), ISRO Ahmedabad</span>
          <p className="text-body-sm text-on-surface-variant mt-1">For Level-3 access escalation or ephemeris kernel anomalies, contact: support.lunar@sac.isro.gov.in</p>
        </div>
      </div>
    </div>
  );
}
