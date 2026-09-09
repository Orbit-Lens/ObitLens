import Link from "next/link";
import Image from "next/image";

export default function CorrespondencePage() {
  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span className="text-outline">/</span>
          <span>Workspace</span>
          <span className="text-outline">/</span>
          <span className="text-secondary font-semibold">Correspondence</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface">
          FEATURE MATCHING ENGINE: <strong className="text-secondary">SIFT + FLANN k-d</strong>
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
          Tie-Point Feature Correspondence
        </h1>
        <Link href="/new-analysis" className="px-space-sm py-space-xs bg-primary-container text-on-primary font-mono-data-sm text-mono-data-sm rounded hover:bg-secondary transition-colors">
          + New Correspondence Pair
        </Link>
      </div>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-md">
        <div className="relative w-full h-96 bg-primary rounded overflow-hidden flex items-center justify-center">
          <Image src="/images/crater-terrain-reference.png" alt="Feature correspondence map" fill className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <div className="p-space-md bg-primary-container/90 text-inverse-on-surface backdrop-blur rounded-lg text-center flex flex-col items-center gap-space-xs">
              <span className="material-symbols-outlined text-[36px] text-secondary-container">forum</span>
              <span className="font-headline-sm text-headline-sm font-semibold">Interactive Feature Tie-Point Mesh</span>
              <span className="font-mono-data-sm text-mono-data-sm text-on-primary-container">3,842 Filtered Inlier Vectors (RANSAC r=0.75)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
