"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
}

interface ConfettiBurstProps {
  active: boolean;
  x: number;
  y: number;
}

const COLORS = ["#00FF87", "#FFD700", "#6366F1", "#FF3B5C", "#FBBF24", "#a78bfa", "#34d399"];

export default function ConfettiBurst({ active, x, y }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 4,
      angle: (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5,
      distance: 40 + Math.random() * 60,
    }));
    setParticles(newParticles);

    const timeout = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(timeout);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed pointer-events-none z-[60]"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(p.angle) * p.distance,
              y: Math.sin(p.angle) * p.distance,
              opacity: 0,
              scale: 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 6px ${p.color}80`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
