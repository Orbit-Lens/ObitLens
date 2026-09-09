import Link from "next/link";

export default function DocumentationPage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>Methods</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Documentation</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        PDS4 Standards &amp; Developer Manual
      </h1>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm font-mono-data-sm text-mono-data-sm flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded">
          <span className="material-symbols-outlined text-secondary text-[24px]">description</span>
          <div className="flex flex-col">
            <span className="font-bold text-on-surface">PDS4 Product Label Specification (V1.21)</span>
            <span className="text-body-sm text-on-surface-variant">XML schema requirements for planetary remote-sensing products.</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm p-space-sm bg-surface-container-low rounded">
          <span className="material-symbols-outlined text-secondary text-[24px]">terminal</span>
          <div className="flex flex-col">
            <span className="font-bold text-on-surface">REST API Integration Guide</span>
            <span className="text-body-sm text-on-surface-variant">Endpoints for job dispatch, image registration, and GeoTIFF downloads.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
