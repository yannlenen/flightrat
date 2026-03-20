"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/lib/hooks/useAchievements";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    if (!achievement) return;
    const timeout = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timeout);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] glass rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl"
          style={{ minWidth: 220 }}
        >
          <span className="text-2xl">{achievement.emoji}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: "#FFD700" }}>
              {achievement.title}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {achievement.description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
