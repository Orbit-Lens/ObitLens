"use client";

import { useState } from "react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
  category: "ALGORITHMS" | "COORDINATES" | "CALIBRATION" | "AUTH";
}

const faqs: FaqItem[] = [
  {
    category: "ALGORITHMS",
    question: "Why does feature matching fail over permanently shadowed regions (PSR)?",
    answer:
      "Permanently shadowed lunar craters at latitudes > 85°S lack direct solar illumination. For PSR targets, select the 'SuperPoint' deep-learning detector which learns texture from secondary scattered light, or apply histogram normalization under Analysis Settings.",
  },
  {
    category: "COORDINATES",
    question: "How are pixel coordinates mapped to lunar latitude/longitude?",
    answer:
      "OrbitLens utilizes the IAU_LUNAR_2000 datum with SPICE orbital kernels (de421.bsp) to compute rigorous sensor camera model transformations. The resulting GeoTIFF files include embedded GeoTIFF tags and GDAL-compatible projection metadata.",
  },
  {
    category: "CALIBRATION",
    question: "What is the difference between Level-1 and Level-2B data products?",
    answer:
      "Level-1 imagery contains uncalibrated raw digital numbers (DN) from the detector array. Level-2B products have undergone radiometric dark-current subtraction, flat-field correction, and photometric normalization to physical spectral radiance units.",
  },
  {
    category: "AUTH",
    question: "How does authenticated session rotation work?",
    answer:
      "OrbitLens issues short-lived JWT access tokens (15-minute validity) accompanied by secure HTTP-only refresh tokens (7-day validity). When working in the dashboard, token rotation occurs automatically in the background.",
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === "ALL" || f.category === activeCategory;
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>System</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Help &amp; Support</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface">
          SAC DESK: <strong className="text-[#065f46]">ONLINE</strong>
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            ISRO SAC Remote Sensing Support Desk
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Knowledge base, photogrammetric troubleshooting, keyboard shortcuts, and scientific point of contact.
          </p>
        </div>
        <a
          href="mailto:support.lunar@sac.isro.gov.in"
          className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>
          <span>Contact SAC Support</span>
        </a>
      </div>

      {/* Scientific Point of Contact Banner */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
            Operational Facility
          </span>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Space Applications Centre (SAC), ISRO Ahmedabad
          </h2>
          <span className="text-body-sm text-on-surface-variant font-mono-data-sm">
            Planetary Sciences &amp; Lunar Exploration Division • Ambawadi Vistar, Ahmedabad, Gujarat 380015
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono-data-sm text-xs">
          <div className="p-space-xs bg-surface-container-low rounded border border-surface-container flex flex-col">
            <span className="text-on-surface-variant">Node ID:</span>
            <strong className="text-on-surface">SAC-AHM-LUNAR-04</strong>
          </div>
          <div className="p-space-xs bg-surface-container-low rounded border border-surface-container flex flex-col">
            <span className="text-on-surface-variant">Emergency Hotline:</span>
            <strong className="text-secondary">+91-79-2691-0000</strong>
          </div>
        </div>
      </div>

      {/* Workstation Keyboard Shortcuts Cheat Sheet */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">keyboard</span>
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Workstation Shortcuts
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm font-mono-data-sm text-xs">
          <div className="p-space-sm bg-surface-container-low rounded flex items-center justify-between">
            <span className="text-on-surface-variant">Toggle Inliers:</span>
            <kbd className="px-2 py-0.5 bg-surface-container rounded font-bold text-on-surface">I</kbd>
          </div>
          <div className="p-space-sm bg-surface-container-low rounded flex items-center justify-between">
            <span className="text-on-surface-variant">Split / Overlay:</span>
            <kbd className="px-2 py-0.5 bg-surface-container rounded font-bold text-on-surface">Space</kbd>
          </div>
          <div className="p-space-sm bg-surface-container-low rounded flex items-center justify-between">
            <span className="text-on-surface-variant">Zoom to Footprint:</span>
            <kbd className="px-2 py-0.5 bg-surface-container rounded font-bold text-on-surface">Z</kbd>
          </div>
          <div className="p-space-sm bg-surface-container-low rounded flex items-center justify-between">
            <span className="text-on-surface-variant">Export GeoTIFF:</span>
            <kbd className="px-2 py-0.5 bg-surface-container rounded font-bold text-on-surface">Ctrl+E</kbd>
          </div>
        </div>
      </div>

      {/* FAQ Search & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search lunar remote sensing FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs font-mono-data-sm focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-1.5 font-mono-data-sm text-xs">
          {(["ALL", "ALGORITHMS", "COORDINATES", "CALIBRATION", "AUTH"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeCategory === cat
                  ? "bg-secondary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between gap-space-xs"
          >
            <div>
              <span className="px-2 py-0.5 bg-surface-container text-secondary rounded font-mono-data-sm text-[10px] font-bold uppercase">
                {item.category}
              </span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-2">
                {item.question}
              </h3>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed font-body-sm mt-1">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
