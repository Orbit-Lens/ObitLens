"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { getUser, fetchCurrentUser, logoutUser, UserProfile } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSession = async () => {
      const cachedUser = getUser();
      if (cachedUser && isMounted) {
        setUser(cachedUser);
      }
      const remoteUser = await fetchCurrentUser();
      if (remoteUser && isMounted) {
        setUser(remoteUser);
      }
    };
    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Handle ESC key and focus trapping when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
        hamburgerBtnRef.current?.focus();
      }
    };
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // Focus drawer when opened
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileDrawerOpen]);

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

  const renderNavLinks = (isDrawer = false) => (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
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
                onClick={() => {
                  if (isDrawer) {
                    setMobileDrawerOpen(false);
                    hamburgerBtnRef.current?.focus();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition-all min-h-[44px] ${
                  isActive
                    ? "bg-secondary text-white font-semibold shadow-xs"
                    : "text-on-primary-container hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-secondary focus:text-white focus:rounded focus:shadow-lg focus:outline-none text-xs font-mono font-bold"
      >
        Skip to main content
      </a>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-primary-container text-inverse-on-surface shadow-sm border-b border-white/10 flex items-center justify-between px-3 sm:px-6 select-none">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Drawer Hamburger Trigger (below lg) */}
          <button
            ref={hamburgerBtnRef}
            type="button"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-label={mobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileDrawerOpen}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileDrawerOpen ? "close" : "menu"}
            </span>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center transition-colors group-hover:bg-white/20 shrink-0">
              <Image
                src="/images/logo-emblem.png"
                alt="ISRO Emblem"
                width={28}
                height={28}
                className="h-6 sm:h-7 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-white truncate">
                  <span className="hidden sm:inline">Indian Lunar Remote Sensing</span>
                  <span className="sm:hidden">OrbitLens</span>
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 bg-secondary text-white rounded text-[9px] sm:text-[10px] font-mono font-bold tracking-wide shrink-0">
                  PDS-4 NODE
                </span>
              </div>
              <span className="hidden md:inline text-[11px] text-on-primary-container/90 leading-tight truncate">
                Orbital Photogrammetry &amp; Surface Analysis • ISRO SAC
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Telemetry chips (xl and up) */}
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
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            aria-expanded={showUserMenu}
            aria-label="User profile menu"
            className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-colors text-left select-none focus:outline-none min-h-[44px]"
          >
            <div className="hidden md:flex flex-col text-right font-mono text-xs">
              <span className="text-white font-semibold" suppressHydrationWarning>
                {user?.name || "Dr. A. Sharma"}
              </span>
              <span className="text-on-primary-container text-[11px]" suppressHydrationWarning>
                {user?.role === "admin"
                  ? "Mission Admin / Lead"
                  : user?.role === "researcher"
                  ? "Research Scientist"
                  : "Sr. Scientist, Remote Sensing"}
              </span>
            </div>
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-secondary/80 border border-white/10 flex items-center justify-center text-white shadow-xs font-bold text-sm"
              suppressHydrationWarning
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-primary-container hidden sm:inline">
              {showUserMenu ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/30 py-2 z-50 text-on-surface font-body-sm">
              <div className="px-4 py-2 border-b border-surface-container">
                <div className="font-semibold text-on-surface text-body-md truncate" suppressHydrationWarning>
                  {user?.name || "Dr. A. Sharma"}
                </div>
                <div className="font-mono-data-sm text-[11px] text-on-surface-variant truncate" suppressHydrationWarning>
                  {user?.email || "sakthivel@orbitlens.app"}
                </div>
                <div
                  className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-semibold uppercase tracking-wider"
                  suppressHydrationWarning
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  {user?.role || "Admin"} • Verified
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] hover:bg-surface-container text-on-surface hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  <span>Account &amp; Security Profile</span>
                </Link>
                <Link
                  href="/help"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] hover:bg-surface-container text-on-surface hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">help_center</span>
                  <span>ISRO SAC Support &amp; Help</span>
                </Link>
              </div>

              <div className="border-t border-surface-container pt-1">
                <button
                  type="button"
                  onClick={() => logoutUser()}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] text-error hover:bg-error-container/30 transition-colors text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out of Workstation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Left Sidebar (Persistent on lg and above) */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-7 w-64 z-30 bg-primary-container text-inverse-on-surface flex-col border-r border-white/10 shadow-xs">
        {renderNavLinks(false)}
      </aside>

      {/* Mobile/Tablet Off-Canvas Drawer (Below lg) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setMobileDrawerOpen(false);
              hamburgerBtnRef.current?.focus();
            }}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="relative w-72 max-w-[85vw] bg-primary-container text-inverse-on-surface shadow-2xl flex flex-col z-10 focus:outline-none h-full"
          >
            {/* Drawer Header */}
            <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-white/10 p-1 flex items-center justify-center">
                  <Image
                    src="/images/logo-emblem.png"
                    alt="ISRO Logo"
                    width={20}
                    height={20}
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <span className="font-semibold text-xs text-white uppercase tracking-wider">
                  OrbitLens Navigation
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  hamburgerBtnRef.current?.focus();
                }}
                aria-label="Close drawer"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto">
              {renderNavLinks(true)}
            </div>

            {/* Drawer Footer Telemetry */}
            <div className="p-3 border-t border-white/10 font-mono text-[10px] text-on-primary-container flex flex-col gap-1 bg-black/20">
              <div className="flex items-center justify-between">
                <span>NODE: SAC-AHM-04</span>
                <span className="text-[#10b981] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>LATENCY: 28ms</span>
                <span>CHANDRAYAAN-3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="pl-0 lg:pl-64 flex-1 flex flex-col">
        <main
          id="main-content"
          tabIndex={-1}
          className="relative pt-18 sm:pt-20 pb-12 min-h-screen w-full px-3 sm:px-6 lg:px-8 bg-surface text-on-surface focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Bottom Telemetry Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-7 z-30 bg-primary-container border-t border-white/10 px-3 sm:px-6 text-on-primary-container font-mono text-[10px] sm:text-[11px] flex items-center justify-between select-none">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10b981]"></span>
            <span className="truncate">
              <span className="hidden sm:inline">ISRO SAC Node: </span>SAC-AHM-04
            </span>
          </span>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="hidden sm:inline">Node: <strong className="text-white">ONLINE</strong></span>
          <span className="text-white/20 hidden md:inline">|</span>
          <span className="hidden md:inline">SPICE: <strong className="text-secondary-container">CH2-DE421</strong></span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 font-medium">
          <span className="hidden md:inline">CRS: <strong className="text-white">IAU_LUNAR_2000</strong></span>
          <span className="text-white/20 hidden md:inline">|</span>
          <span>Latency: <strong className="text-[#10b981]">28ms</strong></span>
        </div>
      </footer>
    </div>
  );
}
