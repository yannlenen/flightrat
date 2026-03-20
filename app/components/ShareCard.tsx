"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { FlightDestination } from "@/lib/types";
import { getCountryFlag } from "@/lib/static-data";
import { formatPrice, getPriceColor } from "@/lib/utils";

interface ShareCardProps {
  flight: FlightDestination;
  origin: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareCard({ flight, origin, isOpen, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const color = getPriceColor(flight.price);
  const flag = getCountryFlag(flight.destination.country);

  const generateAndShare = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Try native share first (mobile)
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "flightrat-deal.png", { type: "image/png" });
          const shareData = { files: [file] };
          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              setGenerating(false);
              onClose();
              return;
            } catch {
              // User cancelled or error, fall through to download
            }
          }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `flightrat-${flight.destination.city.toLowerCase()}-${formatPrice(flight.price).replace(/\s/g, "")}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setGenerating(false);
      }, "image/png");
    } catch {
      setGenerating(false);
    }
  }, [flight, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-4"
          >
            {/* The shareable card (1080x1920 ratio = 9:16) */}
            <div
              ref={cardRef}
              style={{
                width: 360,
                height: 640,
                background: "linear-gradient(160deg, #0a0a1e 0%, #1a1a3e 40%, #0f0f2a 100%)",
                borderRadius: 24,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative arc */}
              <svg
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.15 }}
                viewBox="0 0 360 640"
              >
                <path
                  d={`M 80 500 Q 180 200 280 500`}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
                <circle cx="80" cy="500" r="6" fill="#6366F1" />
                <circle cx="280" cy="500" r="6" fill={color} />
              </svg>

              {/* Top: branding */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
                  <span style={{ fontSize: 24 }}>🐀</span>
                  <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 16 }}>FlightRat</span>
                </div>

                {/* Route */}
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 }}>
                  {origin} → {flight.destination.iata}
                </div>

                {/* Destination */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 40 }}>{flag}</span>
                  <div>
                    <h2 style={{ color: "#F8FAFC", fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
                      {flight.destination.city}
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                      {flight.destination.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center: price */}
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 4 }}>
                  À partir de
                </p>
                <div
                  style={{
                    color,
                    fontSize: 64,
                    fontWeight: 800,
                    lineHeight: 1,
                    textShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
                  }}
                >
                  {formatPrice(flight.price)}
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8 }}>
                  A/R par personne · {flight.airline}
                </p>
              </div>

              {/* Bottom: details + watermark */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Durée</div>
                    <div style={{ color: "#F8FAFC", fontSize: 13, fontWeight: 600 }}>{flight.duration}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Type</div>
                    <div style={{ color: "#F8FAFC", fontSize: 13, fontWeight: 600 }}>
                      {flight.direct ? "Direct" : "Escale"}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Dates</div>
                    <div style={{ color: "#F8FAFC", fontSize: 13, fontWeight: 600 }}>
                      {formatDate(flight.departureDate)}
                    </div>
                  </div>
                </div>

                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center" }}>
                  Trouvé sur FlightRat · flightrat.app
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={generateAndShare}
                disabled={generating}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110"
                style={{ background: color, boxShadow: `0 0 20px ${color}30` }}
              >
                {generating ? "Génération..." : "Partager"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
                style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.05)" }}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
