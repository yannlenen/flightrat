"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Airport } from "@/lib/types";
import { POPULAR_AIRPORTS } from "@/lib/static-data"; // for popular pills only

interface AirportPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (airport: Airport) => void;
  selectedAirport: Airport;
}

export default function AirportPicker({
  isOpen,
  onClose,
  onSelect,
  selectedAirport,
}: AirportPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Airport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (keyword: string) => {
    if (keyword.length < 1) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/airports?keyword=${encodeURIComponent(keyword)}`);
      const data: Airport[] = await res.json();
      setResults(data.slice(0, 12));
    } catch {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 200);
    return () => clearTimeout(timeout);
  }, [query, search]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--background)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top)] pb-2">
            <div className="pt-3 flex items-center gap-3 w-full">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-lg"
                style={{ color: "var(--text-muted)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Aéroport de départ
              </h2>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div
              className="glass rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4 shrink-0"
                style={{ color: "var(--text-muted)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une ville ou un code..."
                className="bg-transparent text-sm outline-none w-full"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Popular pills (when no search) */}
          {query.length === 0 && (
            <div className="px-4 mb-3">
              <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                Aéroports populaires
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_AIRPORTS.slice(0, 8).map((airport) => (
                  <button
                    key={airport.iata}
                    onClick={() => handleSelect(airport)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedAirport.iata === airport.iata
                        ? "bg-accent text-white"
                        : "hover:bg-white/10"
                    }`}
                    style={
                      selectedAirport.iata !== airport.iata
                        ? { background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }
                        : {}
                    }
                  >
                    {airport.iata}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          <div className="flex-1 overflow-y-auto px-4">
            {query.length > 0 && results.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                Aucun aéroport trouvé
              </p>
            )}
            {query.length === 0 && results.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                Tape le nom d&apos;une ville ou un code aéroport
              </p>
            )}
            {results.map((airport) => (
              <button
                key={airport.iata}
                className="w-full px-3 py-3 text-left transition-colors flex items-center justify-between rounded-xl hover:bg-white/10"
                onClick={() => handleSelect(airport)}
              >
                <div>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {airport.city}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                    {airport.name}
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {airport.iata}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
