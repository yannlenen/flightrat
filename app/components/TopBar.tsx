"use client";

import { Airport } from "@/lib/types";

interface TopBarProps {
  origin: Airport;
  onOriginClick: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  flightCount: number;
  loading: boolean;
}

export default function TopBar({
  origin,
  onOriginClick,
  isDark,
  onToggleTheme,
  flightCount,
  loading,
}: TopBarProps) {
  return (
    <div className="fixed top-0 inset-x-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="rat">🐀</span>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
            FlightRat
          </span>
        </div>

        {/* Center: flight count */}
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          {loading ? (
            <span className="shimmer inline-block w-16 h-4 rounded" />
          ) : (
            <span>
              <span className="font-bold font-display" style={{ color: "var(--text-primary)" }}>
                {flightCount}
              </span>{" "}
              vols
            </span>
          )}
        </div>

        {/* Right: airport + theme */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOriginClick}
            className="glass rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            <svg className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {origin.iata}
          </button>

          <button
            onClick={onToggleTheme}
            className="glass rounded-full p-2 transition-all hover:scale-110 active:scale-95"
            title={isDark ? "Mode clair" : "Mode sombre"}
            style={{
              boxShadow: isDark
                ? "0 0 12px rgba(250,204,21,0.3), inset 0 0 8px rgba(250,204,21,0.1)"
                : "0 0 12px rgba(99,102,241,0.3), inset 0 0 8px rgba(99,102,241,0.1)",
            }}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <rect x="11" y="1" width="2" height="4" rx="1" />
                <rect x="11" y="19" width="2" height="4" rx="1" />
                <rect x="19" y="11" width="4" height="2" rx="1" />
                <rect x="1" y="11" width="4" height="2" rx="1" />
                <rect x="17.2" y="3.4" width="2" height="4" rx="1" transform="rotate(45 18.2 5.4)" />
                <rect x="4.8" y="16.6" width="2" height="4" rx="1" transform="rotate(45 5.8 18.6)" />
                <rect x="16.6" y="17.2" width="4" height="2" rx="1" transform="rotate(45 18.6 18.2)" />
                <rect x="3.4" y="4.8" width="4" height="2" rx="1" transform="rotate(45 5.4 5.8)" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
