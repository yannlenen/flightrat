"use client";

import { useRef, useCallback, useEffect, useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";

export type SheetSnap = "collapsed" | "open";

interface BottomSheetProps {
  children: ReactNode;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
}

const COLLAPSED_HEIGHT = 56;
const PADDING = 60; // handle + bottom padding

export default function BottomSheet({ children, snap, onSnapChange }: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const windowH = typeof window !== "undefined" ? window.innerHeight : 800;
  const [contentHeight, setContentHeight] = useState(300);

  // Measure content height
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const collapsedY = windowH - COLLAPSED_HEIGHT;
  // Sheet opens just enough to show content, capped at 85% of screen
  const openHeight = Math.min(contentHeight + PADDING, windowH * 0.85);
  const openY = windowH - openHeight;

  // Darken overlay when sheet is up
  const overlayOpacity = useTransform(y, [collapsedY, openY], [0, 0.2]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const currentY = y.get();
      const velocity = info.velocity.y;

      if (velocity > 400) {
        onSnapChange("collapsed");
        return;
      }
      if (velocity < -400) {
        onSnapChange("open");
        return;
      }

      const midPoint = (collapsedY + openY) / 2;
      onSnapChange(currentY > midPoint ? "collapsed" : "open");
    },
    [y, collapsedY, openY, onSnapChange]
  );

  const targetY = snap === "open" ? openY : collapsedY;
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
        dragConstraints={{ top: openY, bottom: collapsedY }}
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
            <div ref={contentRef}>
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
