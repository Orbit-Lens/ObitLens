"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [govId, setGovId] = useState("scientist.isro@gov.in");
  const [passKey, setPassKey] = useState("");
  const [tokenPin, setTokenPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [hwBinding, setHwBinding] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const appendPin = (num: string) => {
    if (tokenPin.length < 8) {
      setTokenPin((prev) => prev + num);
    }
  };

  const clearPin = () => {
    setTokenPin((prev) => prev.slice(0, -1));
  };

  return (
    <main className="w-full flex items-center justify-center min-h-screen p-space-lg bg-surface font-body-md text-on-surface antialiased">
      <div className="flex flex-col w-full max-w-7xl mx-auto my-auto p-space-sm sm:p-space-lg">
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
          {/* LEFT COLUMN: High-Precision Orbital Imagery & Mission Telemetry */}
          <div className="relative lg:col-span-7 bg-primary-container min-h-[520px] lg:min-h-full flex flex-col justify-between overflow-hidden">
            {/* Lunar South Pole Imagery */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/login-bg-lunar-south-pole.png"
                alt="Lunar South Pole surface taken by Chandrayaan Orbital High Resolution Camera"
                fill
                priority
                className="object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary-container/70 hidden lg:block"></div>
            </div>

            {/* Top Overlay: Telemetry Tags & Calibration Markers */}
            <div className="relative z-10 p-space-lg flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-container/85 backdrop-blur-md rounded text-primary-fixed text-label-caps tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                  LUNAR REMOTE SENSING SYSTEM // CHANDRAYAAN
                </span>
                <span className="inline-flex items-center px-2.5 py-1 bg-surface-variant/25 backdrop-blur-md rounded text-inverse-on-surface text-mono-data-sm uppercase">
                  PAYLOAD: OHRC / SAC
                </span>
              </div>

              {/* Telemetry Data Overlay Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-space-xs max-w-xl">
                <div className="bg-primary/70 backdrop-blur-sm p-space-xs px-space-sm rounded">
                  <div className="text-on-primary-container font-label-caps uppercase text-label-caps">
                    Optical Metric
                  </div>
                  <div className="text-inverse-on-surface font-mono-data-md text-mono-data-md">
                    GSD: 0.25 m/px @ 100km Alt
                  </div>
                </div>
                <div className="bg-primary/70 backdrop-blur-sm p-space-xs px-space-sm rounded">
                  <div className="text-on-primary-container font-label-caps uppercase text-label-caps">
                    Target Sector
                  </div>
                  <div className="text-inverse-on-surface font-mono-data-md text-mono-data-md">
                    SOUTH POLE (85.2°S - 90.0°S)
                  </div>
                </div>
                <div className="bg-primary/70 backdrop-blur-sm p-space-xs px-space-sm rounded sm:col-span-2">
                  <div className="text-on-primary-container font-label-caps uppercase text-label-caps">
                    Coordinate Reference System
                  </div>
                  <div className="text-inverse-on-surface font-mono-data-md text-mono-data-md flex items-center justify-between">
                    <span>IAU2000 Moon Orthographic (Lon: 0.0°, Lat: -90.0°)</span>
                    <span className="material-symbols-outlined text-secondary-container text-body-md">
                      explore
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Reticle Graphic */}
            <div className="relative z-10 pointer-events-none flex items-center justify-center my-auto py-8">
              <div className="w-36 h-36 rounded-full flex items-center justify-center relative opacity-60">
                <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-secondary-fixed rounded-full"></div>
                </div>
                <div className="absolute top-0 w-full flex justify-between px-2 text-label-caps text-secondary-fixed font-mono-data-sm">
                  <span>[TGT-09]</span>
                  <span>POLAR-A</span>
                </div>
                <div className="absolute bottom-0 w-full flex justify-between px-2 text-label-caps text-secondary-fixed font-mono-data-sm">
                  <span>RAD-OK</span>
                  <span>CORR: 99.4%</span>
                </div>
              </div>
            </div>

            {/* Bottom Overlay Glass Console Banner */}
            <div className="relative z-10 m-space-md p-space-md bg-primary/85 backdrop-blur-md rounded-lg">
              <div className="flex items-center gap-space-xs text-secondary-container text-label-caps uppercase mb-1">
                <span className="material-symbols-outlined text-body-sm">satellite_alt</span>
                Operational Node: Space Applications Centre (SAC), Ahmedabad
              </div>
              <h2 className="text-headline-sm font-headline-sm text-surface-bright mb-1 tracking-tight">
                Indian Lunar Remote Sensing &amp; Image Analysis System
              </h2>
              <p className="text-body-sm font-body-sm text-surface-variant leading-relaxed">
                Multimodal correspondence, sub-pixel feature registration and elevation extraction for Chandrayaan-2/3 mission payloads.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Secure Gov Access Portal */}
          <div className="lg:col-span-5 bg-surface p-space-lg sm:p-space-xl flex flex-col justify-between">
            <div>
              {/* Institutional Header & Insignia */}
              <div className="flex items-start justify-between mb-space-lg">
                <div className="flex items-center gap-space-md">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high p-1 shadow-sm flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/logo-emblem.png"
                      alt="ISRO Lunar Science Mission Emblem"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high rounded text-primary-container text-label-caps tracking-wider uppercase font-semibold">
                      <span className="material-symbols-outlined text-body-sm text-error">lock</span>
                      RESTRICTED GOVERNMENT ACCESS • LEVEL-3
                    </span>
                    <h1 className="text-headline-md font-headline-md text-on-surface mt-1 tracking-tight">
                      Lunar Image Analysis Portal
                    </h1>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">
                      Government of India | Department of Space | ISRO SAC
                    </p>
                  </div>
                </div>
              </div>

              {/* Authentication Form */}
              <form className="flex flex-col gap-space-md" onSubmit={handleLogin}>
                {/* Institutional ID Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase flex justify-between" htmlFor="govId">
                    <span>Institutional Identifier / Official Email</span>
                    <span className="text-secondary font-mono-data-sm lowercase">@isro.gov.in / @iisc.ac.in</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-body-md">badge</span>
                    <input
                      id="govId"
                      type="email"
                      required
                      value={govId}
                      onChange={(e) => setGovId(e.target.value)}
                      placeholder="scientist.isro@gov.in"
                      className="w-full h-9 pl-9 pr-3 text-body-md font-body-md bg-surface-container-lowest rounded text-on-surface outline-none focus:bg-surface-bright focus:shadow-[0_0_0_2px_#006398] transition-all"
                    />
                  </div>
                </div>

                {/* Digital Access Key Input */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-label-caps font-label-caps text-on-surface-variant uppercase" htmlFor="passKey">
                      Digital Access Key / Cryptographic Password
                    </label>
                    <button type="button" className="text-secondary text-label-caps hover:underline">Revoke / Reset</button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-body-md">key</span>
                    <input
                      id="passKey"
                      type={showPassword ? "text" : "password"}
                      required
                      value={passKey}
                      onChange={(e) => setPassKey(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full h-9 pl-9 pr-10 text-body-md font-mono-data-md bg-surface-container-lowest rounded text-on-surface outline-none focus:bg-surface-bright focus:shadow-[0_0_0_2px_#006398] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-body-md">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Security Token / SmartCard PIN */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-label-caps font-label-caps text-on-surface-variant uppercase" htmlFor="tokenPin">
                      Hardware Security Token / SmartCard PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKeypad(!showKeypad)}
                      className="text-label-caps font-label-caps text-secondary flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-body-sm">dialpad</span>
                      Virtual Scrambler
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-body-md">token</span>
                    <input
                      id="tokenPin"
                      type="password"
                      maxLength={8}
                      value={tokenPin}
                      onChange={(e) => setTokenPin(e.target.value)}
                      placeholder="6-8 Digit PIN / RSA SecurID"
                      className="w-full h-9 pl-9 pr-3 text-mono-data-md font-mono-data-md bg-surface-container-lowest rounded text-on-surface tracking-widest outline-none focus:bg-surface-bright focus:shadow-[0_0_0_2px_#006398] transition-all"
                    />
                  </div>

                  {/* Virtual Keypad Drawer (Collapsible) */}
                  {showKeypad && (
                    <div className="mt-2 p-2 bg-surface-container-low rounded grid grid-cols-5 gap-1">
                      {["7", "2", "9", "1", "4", "0", "6", "3", "8"].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => appendPin(digit)}
                          className="h-7 bg-surface-container-lowest rounded text-mono-data-sm font-mono-data-sm text-on-surface hover:bg-surface-variant"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={clearPin}
                        className="h-7 bg-error-container text-on-error-container rounded text-label-caps font-label-caps"
                      >
                        DEL
                      </button>
                    </div>
                  )}
                </div>

                {/* Hardware Device Binding Checkbox */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    id="hwBinding"
                    type="checkbox"
                    checked={hwBinding}
                    onChange={(e) => setHwBinding(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-surface-container text-primary-container accent-primary-container cursor-pointer"
                  />
                  <label htmlFor="hwBinding" className="text-body-sm font-body-sm text-on-surface-variant cursor-pointer select-none">
                    Remember this scientific workstation (30-day hardware binding)
                  </label>
                </div>

                {/* Primary Submit Action */}
                <div className="flex flex-col gap-space-xs mt-2">
                  <button
                    type="submit"
                    className="w-full h-11 bg-primary-container hover:bg-secondary text-on-primary font-headline-sm text-headline-sm rounded flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  >
                    <span>Sign In to Analysis Workstation</span>
                    <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                  </button>
                  {/* Gov SSO Alternative */}
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-9 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-body-md text-body-md rounded flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined text-secondary text-body-md">verified_user</span>
                    <span>Sign in with Gov e-Pramaan / Institutional SSO</span>
                  </button>
                </div>
              </form>

              {/* Gateway Security Telemetry Box */}
              <div className="mt-space-md p-space-sm bg-surface-container-low rounded flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-label-caps font-label-caps text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                    <span>AUTHENTICATION GATEWAY: ACTIVE (TLS 1.3 | SHA-384)</span>
                  </div>
                  <span className="text-mono-data-sm font-mono-data-sm text-secondary font-semibold">99.98% UPTIME</span>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant leading-normal">
                  Notice: Unauthorized access to lunar spatial infrastructure is strictly prohibited under the Indian Space Policy &amp; Cyber Security Directives.
                </p>
                <div className="text-mono-data-sm font-mono-data-sm text-outline flex items-center justify-between pt-1">
                  <span>Node: SAC-AHM-LUNAR-AUTH-01</span>
                  <span>EPHEMERIS: V2.4.12</span>
                </div>
              </div>
            </div>

            {/* Regulatory Sub-Footer */}
            <div className="mt-space-lg pt-space-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-label-caps font-label-caps text-outline uppercase gap-1">
              <span>For authorized scientific &amp; institutional users only</span>
              <span className="flex items-center gap-1 text-on-surface-variant font-mono-data-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                ISRO Scientific Data Processing Node • Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
