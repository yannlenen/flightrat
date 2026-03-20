"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface IntroOverlayProps {
  cityName: string;
  destinationCount: number;
  cheapestPrice: number | null;
  ready: boolean; // true when flights have loaded
}

export default function IntroOverlay({
  cityName,
  destinationCount,
  cheapestPrice,
  ready,
}: IntroOverlayProps) {
  const [phase, setPhase] = useState<"city" | "count" | "deal" | "done">("city");

  useEffect(() => {
    if (!ready) return;

    // Phase transitions
    const t1 = setTimeout(() => setPhase("count"), 500);
    const t2 = setTimeout(() => setPhase("deal"), 1500);
    const t3 = setTimeout(() => setPhase("done"), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [ready]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "rgba(5, 5, 20, 0.92)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* City name */}
          <AnimatePresence mode="wait">
            {phase === "city" && (
              <motion.div
                key="city"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="text-center"
              >
                <h1
                  className="text-6xl sm:text-7xl font-bold font-display tracking-tight"
                  style={{
                    color: "#F8FAFC",
                    textShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)",
                  }}
                >
                  {cityName.toUpperCase()}
                </h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="h-0.5 mx-auto mt-3 rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, #6366F1, transparent)" }}
                />
              </motion.div>
            )}

            {/* Counter */}
            {phase === "count" && (
              <motion.div
                key="count"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", damping: 20 }}
                className="text-center"
              >
                <CountUp target={destinationCount} duration={800} />
                <p className="text-lg mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                  destinations
                </p>
              </motion.div>
            )}

            {/* Best deal */}
            {phase === "deal" && cheapestPrice && (
              <motion.div
                key="deal"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center"
              >
                <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  À partir de
                </p>
                <span
                  className="text-6xl sm:text-7xl font-bold font-display"
                  style={{
                    color: "#FFD700",
                    textShadow: "0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)",
                  }}
                >
                  {formatPrice(cheapestPrice)}
                </span>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 inline-block px-4 py-1 rounded-full text-sm font-medium"
                  style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700" }}
                >
                  Top deal
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
    </AnimatePresence>
  );
}

function CountUp({ target, duration }: { target: number; duration: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return (
    <span
      className="text-7xl sm:text-8xl font-bold font-display tabular-nums"
      style={{
        color: "#F8FAFC",
        textShadow: "0 0 30px rgba(99,102,241,0.4)",
      }}
    >
      {count}
    </span>
  );
}
