"use client";

import { useRef, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";

export type SheetSnap = "collapsed" | "half" | "full";

interface BottomSheetProps {
  children: ReactNode;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
}

const COLLAPSED_HEIGHT = 56;
const HALF_RATIO = 0.45;
const FULL_RATIO = 0.9;

function getSnapY(snap: SheetSnap, windowH: number): number {
  switch (snap) {
    case "collapsed":
      return windowH - COLLAPSED_HEIGHT;
    case "half":
      return windowH * (1 - HALF_RATIO);
    case "full":
      return windowH * (1 - FULL_RATIO);
  }
}

export default function BottomSheet({ children, snap, onSnapChange }: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const windowH = typeof window !== "undefined" ? window.innerHeight : 800;

  const collapsedY = getSnapY("collapsed", windowH);
  const halfY = getSnapY("half", windowH);
  const fullY = getSnapY("full", windowH);

  // Darken overlay when sheet is up
  const overlayOpacity = useTransform(y, [collapsedY, halfY, fullY], [0, 0.2, 0.4]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const currentY = y.get();
      const velocity = info.velocity.y;

      // If flung fast, snap in direction
      if (velocity > 400) {
        if (snap === "full") onSnapChange("half");
        else onSnapChange("collapsed");
        return;
      }
      if (velocity < -400) {
        if (snap === "collapsed") onSnapChange("half");
        else onSnapChange("full");
        return;
      }

      // Otherwise snap to nearest
      const distances = [
        { snap: "collapsed" as const, dist: Math.abs(currentY - collapsedY) },
        { snap: "half" as const, dist: Math.abs(currentY - halfY) },
        { snap: "full" as const, dist: Math.abs(currentY - fullY) },
      ];
      distances.sort((a, b) => a.dist - b.dist);
      onSnapChange(distances[0].snap);
    },
    [snap, y, collapsedY, halfY, fullY, onSnapChange]
  );

  // Animate to snap position
  const targetY = getSnapY(snap, windowH);
  animate(y, targetY, { type: "spring", damping: 30, stiffness: 300 });

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none"
        style={{
          backgroundColor: "black",
          opacity: overlayOpacity,
        }}
      />

      {/* Sheet */}
      <motion.div
        ref={containerRef}
        className="fixed inset-x-0 z-40"
        style={{
          y,
          height: windowH,
          touchAction: "none",
        }}
        drag="y"
        dragConstraints={{ top: fullY, bottom: collapsedY }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        <div
          className="glass rounded-t-2xl h-full overflow-hidden flex flex-col"
          style={{ borderBottom: "none" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
            {children}
          </div>
        </div>
      </motion.div>
    </>
  );
}
