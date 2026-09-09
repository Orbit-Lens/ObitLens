"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, fetchCurrentUser, logoutUser, UserProfile } from "@/lib/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(() => (typeof window !== "undefined" ? getUser() : null));
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [ephemerisSync, setEphemerisSync] = useState(true);
  const [subPixelRefine, setSubPixelRefine] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  return (
    <div className="flex flex-col w-full gap-space-md py-space-sm font-body-md pb-space-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-secondary">ISRO Portal</Link>
        <span>/</span>
        <span>System</span>
        <span>/</span>
        <span className="text-secondary font-semibold">Settings</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase font-bold tracking-tight">
            Scientific Workstation &amp; Account Settings
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage authenticated mission credentials, node authorization, and photogrammetric pipeline environment.
          </p>
        </div>
        <span className="px-space-xs py-space-2xs bg-surface-container-high text-on-surface font-mono-data-sm text-mono-data-sm rounded self-start">
          Node: SAC-AHM-LUNAR-04
        </span>
      </div>

      {/* Flag / Context Note for user */}
      <div className="p-space-sm bg-surface-container text-on-surface-variant rounded border border-outline-variant/30 flex items-start gap-space-xs font-body-sm">
        <span className="material-symbols-outlined text-secondary text-body-md shrink-0 mt-0.5">verified_user</span>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-on-surface text-label-caps uppercase">System Identity Notice</span>
          <span className="text-[12px] text-on-surface-variant">
            Profile credentials are authenticated directly against the OrbitLens Node/Express backend and MongoDB Atlas registry.
          </span>
        </div>
      </div>

      {/* SECTION 1: ACCOUNT PROFILE & CREDENTIALS */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="px-space-md py-space-sm bg-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
              Authenticated Scientist Profile
            </span>
          </div>
          <span className="px-space-xs py-0.5 bg-[#ecfdf5] text-[#065f46] rounded text-[10px] font-mono-data-sm uppercase font-semibold">
            ● Active Session
          </span>
        </div>

        <div className="p-space-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md font-mono-data-sm text-mono-data-sm">
          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Full Name</span>
            <span className="font-bold text-on-surface text-body-md font-body-md">{user?.name || "Dr. A. Sharma"}</span>
            <span className="text-[10px] text-secondary">Authorized Remote Sensing Operator</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Official Email</span>
            <span className="font-medium text-on-surface text-mono-data-md">{user?.email || "sakthivel@orbitlens.app"}</span>
            <span className="text-[10px] text-on-surface-variant">Domain: ISRO SAC / Academic</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">System Role</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 bg-primary-container text-on-primary rounded text-label-caps font-semibold uppercase text-[11px]">
                {user?.role || "Admin"}
              </span>
              <span className="text-[11px] text-on-surface-variant">Level-3 Privileges</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Full pipeline dispatch &amp; audit access</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Internal User Identifier</span>
            <span className="font-mono-data-sm text-on-surface select-all">{user?.id || "6a9d6ad0f14be50d908ad7bc"}</span>
            <span className="text-[10px] text-on-surface-variant">MongoDB ObjectId hash</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-1">
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Security Protocol</span>
            <span className="font-medium text-on-surface">JWT / TLS 1.3 Strict</span>
            <span className="text-[10px] text-secondary font-mono-data-sm">Token expiry: 15m (Auto-rotating refresh)</span>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded flex flex-col justify-between">
            <div>
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">Session Management</span>
              <div className="text-[11px] text-on-surface-variant mt-1">Invalidate workstation security context</div>
            </div>
            <button
              type="button"
              onClick={() => logoutUser()}
              className="mt-2 h-8 px-3 bg-error-container text-on-error-container hover:bg-error hover:text-white rounded font-body-sm text-body-sm font-semibold flex items-center justify-center gap-1.5 transition-colors self-start"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out Workstation</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: WORKSTATION ENVIRONMENT */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="px-space-md py-space-sm bg-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-bold">
              Photogrammetric Environment Preferences
            </span>
          </div>
        </div>

        <div className="p-space-md flex flex-col gap-space-sm font-body-sm">
          <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
            <div className="flex flex-col">
              <span className="font-bold text-on-surface">CUDA Hardware Acceleration</span>
              <span className="text-body-sm text-on-surface-variant">Allocate 4x NVIDIA A100 Tensor Core cluster for sub-pixel homography fitting</span>
            </div>
            <input
              type="checkbox"
              checked={gpuAcceleration}
              onChange={(e) => setGpuAcceleration(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
            <div className="flex flex-col">
              <span className="font-bold text-on-surface">Automatic SPICE Ephemeris Kernel Sync</span>
              <span className="text-body-sm text-on-surface-variant">Synchronize SPK/CK kernels on Chandrayaan orbit pass telemetry ingest</span>
            </div>
            <input
              type="checkbox"
              checked={ephemerisSync}
              onChange={(e) => setEphemerisSync(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
            <div className="flex flex-col">
              <span className="font-bold text-on-surface">Sub-Pixel L-M Optimization by Default</span>
              <span className="text-body-sm text-on-surface-variant">Perform Levenberg-Marquardt patch correlation on all correspondence runs</span>
            </div>
            <input
              type="checkbox"
              checked={subPixelRefine}
              onChange={(e) => setSubPixelRefine(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
