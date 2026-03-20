"use client";

import { motion } from "framer-motion";
import { FlightDestination } from "@/lib/types";
import { getCountryFlag } from "@/lib/static-data";
import { formatPrice, getPriceColor, getPriceLabel, buildBookingUrl, buildHotelUrl } from "@/lib/utils";

interface DestinationListProps {
  flights: FlightDestination[];
  selectedFlight: FlightDestination | null;
  onSelectFlight: (flight: FlightDestination | null) => void;
  origin: string;
  loading: boolean;
  onShare?: () => void;
}

export default function DestinationList({
  flights,
  selectedFlight,
  onSelectFlight,
  origin,
  loading,
  onShare,
}: DestinationListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  // Show selected flight details
  if (selectedFlight) {
    const color = getPriceColor(selectedFlight.price);
    const flag = getCountryFlag(selectedFlight.destination.country);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Back button */}
        <button
          onClick={() => onSelectFlight(null)}
          className="flex items-center gap-1 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Toutes les destinations
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{flag}</span>
          <div>
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {selectedFlight.destination.city}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {selectedFlight.destination.country}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold font-display" style={{ color, textShadow: `0 0 20px ${color}40` }}>
            {formatPrice(selectedFlight.price)}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full mb-1.5"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {getPriceLabel(selectedFlight.price)}
          </span>
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Prix indicatif A/R par personne
        </p>

        {/* Details */}
        <div className="space-y-2.5">
          <DetailRow label="Compagnie" value={selectedFlight.airline} />
          <DetailRow label="Trajet" value={`${origin} → ${selectedFlight.destination.iata}`} />
          <DetailRow label="Durée" value={selectedFlight.duration} />
          <DetailRow label="Type" value={selectedFlight.direct ? "Vol direct" : "Avec escale(s)"} />
          <DetailRow
            label="Dates"
            value={`${formatDate(selectedFlight.departureDate)} — ${formatDate(selectedFlight.returnDate)}`}
          />
        </div>

        {/* CTAs */}
        <a
          href={
            selectedFlight.bookingLink ??
            buildBookingUrl(origin, selectedFlight.destination.iata, selectedFlight.departureDate, selectedFlight.returnDate)
          }
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
          style={{
            backgroundColor: color,
            color: "#fff",
            boxShadow: `0 0 20px ${color}30`,
          }}
        >
          Rechercher ce vol →
        </a>

        <div className="flex gap-2">
          <a
            href={buildHotelUrl(selectedFlight.destination.city)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-xl text-xs transition-all hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            Hôtel →
          </a>
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Partager
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // List all flights
  return (
    <div className="space-y-2">
      {flights.map((flight, i) => {
        const color = getPriceColor(flight.price);
        const flag = getCountryFlag(flight.destination.country);

        return (
          <motion.button
            key={flight.destination.iata}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onSelectFlight(flight)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-white/5 text-left"
          >
            <span className="text-xl">{flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {flight.destination.city}
                </span>
                <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                  {flight.destination.iata}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {flight.airline} · {flight.direct ? "Direct" : "Escale"}
              </span>
            </div>
            <span className="text-base font-bold font-display shrink-0" style={{ color }}>
              {formatPrice(flight.price)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
