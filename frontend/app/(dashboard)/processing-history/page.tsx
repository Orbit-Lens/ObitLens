"use client";

import { useState } from "react";
import Link from "next/link";

interface AuditEntry {
  id: string;
  timestamp: string;
  operation: "REGISTRATION" | "CALIBRATION" | "SPICE" | "INGESTION" | "AUTH";
  severity: "SUCCESS" | "INFO" | "WARN" | "ERROR";
  operator: string;
  summary: string;
  details: string;
  durationMs?: number;
}

const auditHistory: AuditEntry[] = [
  {
    id: "LOG-8849",
    timestamp: "2026-09-09 17:53:59 UTC",
    operation: "AUTH",
    severity: "SUCCESS",
    operator: "sakthivel@orbitlens.app",
    summary: "User authenticated successfully (Session #13 active)",
    details: "JWT keypair validated via HMAC SHA-256. IP: ::1. Workstation: Windows 11.",
  },
  {
    id: "LOG-8848",
    timestamp: "2026-09-08 14:24:19 UTC",
    operation: "REGISTRATION",
    severity: "SUCCESS",
    operator: "sakthivel@orbitlens.app",
    summary: "Sub-pixel co-registration completed for CH2_OHRC_0421 ↔ CH2_TMC2_1187",
    details: "Algorithm: SIFT + MAGSAC++. Inliers: 842 / 1,146 (91.4%). RMSE: 0.52 px.",
    durationMs: 4180,
  },
  {
    id: "LOG-8847",
    timestamp: "2026-09-08 11:10:02 UTC",
    operation: "CALIBRATION",
    severity: "INFO",
    operator: "system_cron",
    summary: "Applied radiometric gain matrix coefficients v4.2 to OHRC focal plane",
    details: "Corrected flat-field variance to < 0.08% RMS across 16-cell CCD detector array.",
    durationMs: 920,
  },
  {
    id: "LOG-8846",
    timestamp: "2026-09-07 22:15:44 UTC",
    operation: "SPICE",
    severity: "INFO",
    operator: "ephemeris_daemon",
    summary: "Synchronized DE421 ephemeris & IAU_LUNAR_2000 planetary constants",
    details: "Checked planetary constants kernel pck00010.tpc. Lunar South Pole sub-solar point computed.",
    durationMs: 450,
  },
  {
    id: "LOG-8845",
    timestamp: "2026-09-07 19:40:12 UTC",
    operation: "INGESTION",
    severity: "SUCCESS",
    operator: "sakthivel@orbitlens.app",
    summary: "Ingested PDS4 GeoTIFF scene CH2_TMC2_1187 from ISSDC staging bucket",
    details: "Resolution: 5.0m. Sun azimuth: 78.4°. Stored in S3 bucket orbitlens-imagery.",
    durationMs: 2400,
  },
  {
    id: "LOG-8844",
    timestamp: "2026-09-06 16:30:22 UTC",
    operation: "REGISTRATION",
    severity: "WARN",
    operator: "sakthivel@orbitlens.app",
    summary: "High parallax residual detected in LPDC-0019 over deep crater wall",
    details: "Inlier ratio dropped to 74.2%. Re-ran with Thin-Plate Spline non-rigid deformation model.",
    durationMs: 7890,
  },
];

export default function ProcessingHistoryPage() {
  const [filterOp, setFilterOp] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = auditHistory.filter((entry) => {
    const matchSearch =
      entry.id.toLowerCase().includes(search.toLowerCase()) ||
      entry.summary.toLowerCase().includes(search.toLowerCase()) ||
      entry.details.toLowerCase().includes(search.toLowerCase()) ||
      entry.operator.toLowerCase().includes(search.toLowerCase());
    const matchOp = filterOp === "ALL" || entry.operation === filterOp;
    const matchSev = filterSeverity === "ALL" || entry.severity === filterSeverity;
    return matchSearch && matchOp && matchSev;
  });

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span>/</span>
          <span>Data</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Processing History</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container rounded text-on-surface">
          AUDIT LOG: <strong className="text-secondary">{auditHistory.length} Recorded Events</strong>
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            Node Execution &amp; Processing Audit Log
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Immutable audit trail of photogrammetry runs, SPICE synchronization, radiometric updates, and mission operator actions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Exporting audit log manifest to JSON.")}
          className="px-space-md py-2 bg-primary-container text-on-primary rounded hover:bg-secondary transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search audit records by keyword, ID, operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-mono-data-sm focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 font-mono-data-sm text-xs">
          <span className="text-on-surface-variant font-semibold">Operation:</span>
          {(["ALL", "REGISTRATION", "CALIBRATION", "SPICE", "INGESTION", "AUTH"] as const).map((op) => (
            <button
              key={op}
              onClick={() => setFilterOp(op)}
              className={`px-2 py-1 rounded transition-colors ${
                filterOp === op
                  ? "bg-secondary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {op}
            </button>
          ))}
          <span className="text-on-surface-variant font-semibold ml-2">Severity:</span>
          {(["ALL", "SUCCESS", "INFO", "WARN"] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-1 rounded transition-colors ${
                filterSeverity === sev
                  ? "bg-primary-container text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Timeline Cards */}
      <div className="flex flex-col gap-space-sm">
        {filtered.map((item) => {
          const borderColor =
            item.severity === "SUCCESS"
              ? "border-l-[#10b981]"
              : item.severity === "WARN"
              ? "border-l-[#f59e0b]"
              : item.severity === "ERROR"
              ? "border-l-[#dc2626]"
              : "border-l-secondary";

          return (
            <div
              key={item.id}
              className={`p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 border-l-4 ${borderColor} flex flex-col gap-space-xs`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data-sm text-xs font-bold text-secondary">{item.id}</span>
                  <span className="px-2 py-0.5 rounded font-mono-data-sm text-[10px] font-bold bg-surface-container text-on-surface">
                    {item.operation}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono-data-sm text-[10px] font-bold uppercase ${
                      item.severity === "SUCCESS"
                        ? "bg-[#ecfdf5] text-[#065f46]"
                        : item.severity === "WARN"
                        ? "bg-[#fffbeb] text-[#92400e]"
                        : item.severity === "ERROR"
                        ? "bg-[#fef2f2] text-[#991b1b]"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    ● {item.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono-data-sm text-xs text-on-surface-variant">
                  {item.durationMs && (
                    <span>
                      Duration: <strong className="text-on-surface">{(item.durationMs / 1000).toFixed(2)}s</strong>
                    </span>
                  )}
                  <span>{item.timestamp}</span>
                </div>
              </div>

              <div className="font-semibold text-body-md text-on-surface mt-1">{item.summary}</div>
              <p className="text-body-sm text-on-surface-variant font-mono-data-sm leading-relaxed">{item.details}</p>

              <div className="pt-2 border-t border-surface-container/60 flex items-center justify-between font-mono-data-sm text-xs text-on-surface-variant">
                <span>
                  Authorized Operator: <strong className="text-on-surface">{item.operator}</strong>
                </span>
                <span className="text-[11px] text-secondary">Cryptographically Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
