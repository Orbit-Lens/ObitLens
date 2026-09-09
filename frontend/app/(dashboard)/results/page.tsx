import Link from "next/link";

export default function ResultsPage() {
  const pastResults = [
    { id: "REG-2024-CH2-9182", pair: "OHRC-0421 ↔ TMC2-1187", rmse: "0.72 px", ssim: "0.884", status: "PASSED", date: "2024-10-08" },
    { id: "REG-2024-CH2-9181", pair: "OHRC-0410 ↔ OHRC-0411", rmse: "0.59 px", ssim: "0.912", status: "PASSED", date: "2024-10-07" },
    { id: "REG-2024-CH2-9180", pair: "IIRS-0884 ↔ TMC2-1140", rmse: "0.68 px", ssim: "0.875", status: "PASSED", date: "2024-10-07" },
    { id: "REG-2024-CH3-9179", pair: "LPDC-0019 ↔ OHRC-0389", rmse: "1.04 px", ssim: "0.825", status: "INLIER WARN", date: "2024-10-06" },
  ];

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm">
      <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
          <span className="text-outline">/</span>
          <span>Workspace</span>
          <span className="text-outline">/</span>
          <span className="text-secondary font-semibold">Results Archive</span>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container text-on-surface">TOTAL RUNS: 128</span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
        Past Registration Benchmark Results
      </h1>

      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
        <table className="w-full text-left font-mono-data-sm text-mono-data-sm border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase">
              <th className="py-space-xs px-space-sm">Registration ID</th>
              <th className="py-space-xs px-space-sm">Sensor Pair</th>
              <th className="py-space-xs px-space-sm text-right">Mean RMSE</th>
              <th className="py-space-xs px-space-xs">SSIM Index</th>
              <th className="py-space-xs px-space-xs">Benchmark Result</th>
              <th className="py-space-xs px-space-xs">Run Date</th>
              <th className="py-space-xs px-space-xs text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {pastResults.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-low">
                <td className="py-space-sm px-space-sm font-semibold text-secondary">{row.id}</td>
                <td className="py-space-sm px-space-sm text-on-surface">{row.pair}</td>
                <td className="py-space-sm px-space-sm text-right font-bold text-on-surface">{row.rmse}</td>
                <td className="py-space-sm px-space-xs text-on-surface">{row.ssim}</td>
                <td className="py-space-sm px-space-xs">
                  <span className="px-space-xs py-space-2xs rounded bg-[#ecfdf5] text-[#065f46] font-semibold text-[11px]">
                    {row.status}
                  </span>
                </td>
                <td className="py-space-sm px-space-xs text-on-surface-variant">{row.date}</td>
                <td className="py-space-sm px-space-xs text-right">
                  <Link href="/registration" className="px-space-xs py-space-2xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded">
                    Inspect Report
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
