import Link from "next/link";

export default function AnalysisMethodsPage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md">
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>Methods</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Analysis Methods</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        Algorithmic Pipeline Specification
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-mono-data-sm text-mono-data-sm">
        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-xs">
          <span className="font-headline-sm text-headline-sm font-bold text-primary-container">SIFT / AKAZE Feature Extractor</span>
          <p className="text-body-sm text-on-surface-variant">Scale-invariant feature transform tuned for lunar crater rim micro-textures under extreme low solar elevation.</p>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-xs">
          <span className="font-headline-sm text-headline-sm font-bold text-secondary">USAC / MAGSAC++ Robust Fitting</span>
          <p className="text-body-sm text-on-surface-variant">Marginalized sample consensus for sub-pixel homography and affine matrix estimation.</p>
        </div>
      </div>
    </div>
  );
}
