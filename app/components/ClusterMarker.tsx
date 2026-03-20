"use client";

import { motion } from "framer-motion";

interface ClusterMarkerProps {
  count: number;
  onClick: () => void;
}

export default function ClusterMarker({ count, onClick }: ClusterMarkerProps) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
      style={{
        width: 40 + count * 2,
        height: 40 + count * 2,
        maxWidth: 70,
        maxHeight: 70,
      }}
    >
      <span className="text-white font-bold text-sm">{count}</span>
    </motion.button>
  );
}
