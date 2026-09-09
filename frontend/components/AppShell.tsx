"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { getUser, fetchCurrentUser, logoutUser, UserProfile } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(() => (typeof window !== "undefined" ? getUser() : null));
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  const navGroups = [
    {
      title: "WORKSPACE",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        { label: "New Analysis", path: "/new-analysis", icon: "biotech" },
        { label: "Correspondence", path: "/correspondence", icon: "forum" },
        { label: "Registration", path: "/registration", icon: "app_registration" },
        { label: "Results", path: "/results", icon: "fact_check" },
      ],
    },
    {
      title: "DATA",
      items: [
        { label: "Datasets", path: "/datasets", icon: "dataset" },
        { label: "Mission Archive", path: "/mission-archive", icon: "inventory_2" },
        { label: "Processing History", path: "/processing-history", icon: "manage_history" },
      ],
    },
    {
      title: "METHODS",
      items: [
        { label: "Analysis Methods", path: "/analysis-methods", icon: "function" },
        { label: "Calibration", path: "/calibration", icon: "tune" },
        { label: "Documentation", path: "/documentation", icon: "menu_book" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Settings", path: "/settings", icon: "settings" },
        { label: "Help", path: "/help", icon: "help_center" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-primary-container text-inverse-on-surface shadow-sm border-b border-white/10 flex items-center justify-between px-6 select-none">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center transition-colors group-hover:bg-white/20">
              <Image
                src="/images/logo-emblem.png"
                alt="ISRO Emblem"
                width={28}
                height={28}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-sm uppercase tracking-wider text-white">
                  Indian Lunar Remote Sensing
                </span>
                <span className="px-2 py-0.5 bg-secondary text-white rounded text-[10px] font-mono font-bold tracking-wide">
                  PDS-4 NODE
                </span>
              </div>
              <span className="text-[11px] text-on-primary-container/90 leading-tight">
                Orbital Photogrammetry &amp; Surface Analysis • ISRO SAC
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Telemetry chips */}
        <div className="hidden xl:flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-1.5 rounded-md">
            <span className="text-on-primary-container text-[10px] uppercase font-bold tracking-wider">
              Agency:
            </span>
            <span className="text-white font-medium">DOS | ISRO</span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-1.5 rounded-md">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-white text-[11px] font-bold tracking-wider uppercase">
              DSN ONLINE
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-1.5 rounded-md">
            <span className="text-on-primary-container text-[10px] uppercase font-bold tracking-wider">
              Mission:
            </span>
            <span className="text-white font-medium">CHANDRAYAAN-3</span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-3 py-1.5 rounded-md">
            <span className="text-on-primary-container text-[10px] uppercase font-bold tracking-wider">
              Target:
            </span>
            <span className="text-secondary-container font-medium">
              Lunar South Pole (89.9°S)
            </span>
          </div>
        </div>

        {/* Dynamic User Profile with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-left select-none focus:outline-none"
          >
            <div className="hidden md:flex flex-col text-right font-mono text-xs">
              <span className="text-white font-semibold">{user?.name || "Dr. A. Sharma"}</span>
              <span className="text-on-primary-container text-[11px]">
                {user?.role === "admin"
                  ? "Mission Admin / Lead"
                  : user?.role === "researcher"
                  ? "Research Scientist"
                  : "Sr. Scientist, Remote Sensing"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary/80 border border-white/10 flex items-center justify-center text-white shadow-xs font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-primary-container">
              {showUserMenu ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/30 py-2 z-50 text-on-surface font-body-sm">
              <div className="px-4 py-2 border-b border-surface-container">
                <div className="font-semibold text-on-surface text-body-md truncate">{user?.name || "Dr. A. Sharma"}</div>
                <div className="font-mono-data-sm text-[11px] text-on-surface-variant truncate">{user?.email || "sakthivel@orbitlens.app"}</div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  {user?.role || "Admin"} • Verified
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-container text-on-surface hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  <span>Account &amp; Security Profile</span>
                </Link>
                <Link
                  href="/help"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-container text-on-surface hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">help_center</span>
                  <span>ISRO SAC Support &amp; Help</span>
                </Link>
              </div>

              <div className="border-t border-surface-container pt-1">
                <button
                  type="button"
                  onClick={() => logoutUser()}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-error hover:bg-error-container/30 transition-colors text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out of Workstation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 bottom-7 w-64 z-40 bg-primary-container text-inverse-on-surface overflow-y-auto flex flex-col border-r border-white/10 shadow-xs">
        <nav className="flex-1 px-3 py-4 flex flex-col gap-5">
          {navGroups.map((group, gIdx) => (
            <div
              key={group.title}
              className={`flex flex-col gap-1 ${
                gIdx === navGroups.length - 1 ? "mt-auto" : ""
              }`}
            >
              <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase text-on-primary-container/80 tracking-widest">
                {group.title}
              </span>
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all ${
                      isActive
                        ? "bg-secondary text-white font-semibold shadow-xs"
                        : "text-on-primary-container hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Workspace Area */}
      <div className="pl-64 flex-1">
        <main className="relative pt-20 pb-10 min-h-screen w-full px-8 bg-surface text-on-surface">
          {children}
        </main>
      </div>

      {/* Bottom Telemetry Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-7 z-40 bg-primary-container border-t border-white/10 px-6 text-on-primary-container font-mono text-[11px] flex items-center justify-between select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>ISRO SAC Node: SAC-AHM-LUNAR-04</span>
          </span>
          <span className="text-white/20">|</span>
          <span>Node: <strong className="text-white">ONLINE</strong></span>
          <span className="text-white/20">|</span>
          <span>SPICE: <strong className="text-secondary-container">CH2-DE421</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>CRS: <strong className="text-white">IAU_LUNAR_2000</strong></span>
          <span className="text-white/20">|</span>
          <span>Latency: <strong className="text-[#10b981]">28ms</strong></span>
        </div>
      </footer>
    </div>
  );
}
