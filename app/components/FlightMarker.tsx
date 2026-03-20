"use client";

import { motion } from "framer-motion";
import { FlightDestination } from "@/lib/types";
import { getPriceColor, formatPrice } from "@/lib/utils";

interface FlightMarkerProps {
  flight: FlightDestination;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function FlightMarker({
  flight,
  index,
  isSelected,
  onClick,
}: FlightMarkerProps) {
  const color = getPriceColor(flight.price);

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.02,
      }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer group"
      style={{ zIndex: isSelected ? 10 : 1 }}
    >
      {/* Price bubble */}
      <motion.div
        className="rounded-full px-2.5 py-1 text-xs font-bold shadow-lg whitespace-nowrap"
        style={{
          backgroundColor: color,
          color: flight.price < 150 ? "#000" : "#fff",
          boxShadow: `0 0 12px ${color}40, 0 2px 8px rgba(0,0,0,0.3)`,
        }}
        animate={
          isSelected
            ? { scale: [1, 1.1, 1], boxShadow: `0 0 20px ${color}80` }
            : {}
        }
        transition={{ repeat: isSelected ? Infinity : 0, duration: 1.5 }}
      >
        {formatPrice(flight.price)}
      </motion.div>

      {/* City label on hover */}
      <motion.div
        className="absolute -bottom-5 text-[10px] text-white/80 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
      >
        {flight.destination.city}
      </motion.div>

      {/* Dot connector */}
      <div
        className="w-1.5 h-1.5 rounded-full mt-0.5"
        style={{ backgroundColor: color }}
      />
    </motion.button>
  );
}
