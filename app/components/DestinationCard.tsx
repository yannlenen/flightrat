"use client";

import { motion } from "framer-motion";
import { FlightDestination } from "@/lib/types";
import { getCountryFlag } from "@/lib/static-data";
import {
  formatPrice,
  getPriceColor,
  getPriceLabel,
  buildBookingUrl,
  buildHotelUrl,
} from "@/lib/utils";

interface DestinationCardProps {
  flight: FlightDestination;
  origin: string;
  onClose: () => void;
  onShare?: () => void;
}

export default function DestinationCard({
  flight,
  origin,
  onClose,
  onShare,
}: DestinationCardProps) {
  const color = getPriceColor(flight.price);
  const flag = getCountryFlag(flight.destination.country);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="glass rounded-2xl p-5 w-80 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{flag}</span>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {flight.destination.city}
            </h3>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {flight.destination.country}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 mb-1">
        <span className="text-3xl font-bold font-display" style={{ color, textShadow: `0 0 20px ${color}40` }}>
          {formatPrice(flight.price)}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full mb-1"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getPriceLabel(flight.price)}
        </span>
      </div>
      <p className="text-[11px] mb-5" style={{ color: "var(--text-muted)" }}>
        Prix indicatif A/R par personne
      </p>

      {/* Details */}
      <div className="space-y-2.5 mb-5">
        <DetailRow label="Compagnie" value={flight.airline} />
        <DetailRow
          label="Trajet"
          value={`${origin} → ${flight.destination.iata}`}
        />
        <DetailRow label="Durée" value={flight.duration} />
        <DetailRow
          label="Type"
          value={flight.direct ? "Vol direct" : "Avec escale(s)"}
        />
        <DetailRow label="Dates" value={`${formatDate(flight.departureDate)} — ${formatDate(flight.returnDate)}`} />
      </div>

      {/* CTAs */}
      <a
        href={
          flight.bookingLink ??
          buildBookingUrl(
            origin,
            flight.destination.iata,
            flight.departureDate,
            flight.returnDate
          )
        }
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110 hover:shadow-lg"
        style={{
          backgroundColor: color,
          color: "#fff",
          boxShadow: `0 0 20px ${color}30`,
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        Rechercher ce vol →
      </a>

      <div className="flex gap-2 mt-2">
        <a
          href={buildHotelUrl(flight.destination.city)}
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
