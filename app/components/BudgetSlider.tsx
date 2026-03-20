"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  destinationCount: number;
  loading: boolean;
}

const MIN = 50;
const MAX = 1000;
const PRESETS = [50, 100, 200, 500, 1000];

export default function BudgetSlider({
  value,
  onChange,
  destinationCount,
  loading,
}: BudgetSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [displayCount, setDisplayCount] = useState(destinationCount);

  // Animate count with a simple counter
  useEffect(() => {
    const start = displayCount;
    const end = destinationCount;
    if (start === end) return;
    const duration = 300;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayCount(Math.round(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [destinationCount]);

  const fraction = (value - MIN) / (MAX - MIN);

  // Treasure mode when budget ≤ 80€ and results exist
  const isTreasure = value <= 80 && destinationCount > 0 && !loading;

  const handleTrackInteraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const frac = x / rect.width;
      const raw = MIN + frac * (MAX - MIN);
      const stepped = Math.round(raw / 10) * 10;
      onChange(Math.max(MIN, Math.min(MAX, stepped)));
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleTrackInteraction(e.clientX);
    },
    [handleTrackInteraction]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      handleTrackInteraction(e.clientX);
    },
    [handleTrackInteraction]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className="w-full">
      {/* Main pill */}
      <motion.div
        className="glass rounded-2xl px-4 py-3"
        animate={
          isTreasure
            ? { borderColor: "rgba(255, 215, 0, 0.4)" }
            : { borderColor: "rgba(255,255,255,0.08)" }
        }
        style={isTreasure ? { background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))" } : {}}
      >
        {/* Label */}
        <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
          {isTreasure ? (
            <span style={{ color: "#FFD700" }}>
              <span className="font-bold font-display">{displayCount}</span> DEALS INCROYABLES
            </span>
          ) : (
            <span>
              Où aller pour{" "}
              <span className="font-bold font-display" style={{ color: "var(--text-primary)" }}>
                {formatPrice(value)}
              </span>{" "}
              ?{" "}
              {loading ? (
                <span className="shimmer inline-block w-8 h-3 rounded ml-1" />
              ) : (
                <span>
                  — <span className="font-bold font-display" style={{ color: "var(--text-primary)" }}>{displayCount}</span> destinations
                </span>
              )}
            </span>
          )}
        </div>

        {/* Slider track */}
        <div
          ref={trackRef}
          className="relative h-8 flex items-center cursor-pointer touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Background track */}
          <div
            className="absolute inset-x-0 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          {/* Filled track */}
          <motion.div
            className="absolute left-0 h-1.5 rounded-full"
            style={{
              width: `${fraction * 100}%`,
              background: isTreasure
                ? "linear-gradient(90deg, #FFD700, #FFA500)"
                : "linear-gradient(90deg, #00FF87, #6366F1)",
            }}
          />
          {/* Thumb */}
          <motion.div
            className="absolute w-6 h-6 rounded-full shadow-lg flex items-center justify-center"
            style={{
              left: `calc(${fraction * 100}% - 12px)`,
              background: isTreasure ? "#FFD700" : "#6366F1",
              boxShadow: isTreasure
                ? "0 0 16px rgba(255,215,0,0.5)"
                : "0 0 12px rgba(99,102,241,0.4)",
            }}
            whileTap={{ scale: 1.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-white/80" />
          </motion.div>
        </div>

        {/* Presets */}
        <div className="flex justify-between mt-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`text-[10px] px-2 py-0.5 rounded-md transition-all font-medium ${
                value === preset ? "text-white" : ""
              }`}
              style={
                value === preset
                  ? { background: "rgba(99,102,241,0.3)", color: "#a5b4fc" }
                  : { color: "var(--text-muted)" }
              }
            >
              {preset === 1000 ? "Tout" : `${preset}€`}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
