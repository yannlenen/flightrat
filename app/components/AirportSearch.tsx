"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Airport } from "@/lib/types";

interface AirportSearchProps {
  selectedAirport: Airport;
  onSelect: (airport: Airport) => void;
}

export default function AirportSearch({
  selectedAirport,
  onSelect,
}: AirportSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (keyword: string) => {
    if (keyword.length < 1) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/airports?keyword=${encodeURIComponent(keyword)}`);
      const data: Airport[] = await res.json();
      setResults(data.slice(0, 8));
    } catch {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 200);
    return () => clearTimeout(timeout);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-72">
      <div
        className="glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
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

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un aéroport..."
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: "var(--text-primary)", }}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {selectedAirport.city}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {selectedAirport.iata}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden z-50"
          >
            {results.map((airport) => (
              <button
                key={airport.iata}
                className="w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between hover:bg-white/10"
                onClick={() => {
                  onSelect(airport);
                  setIsOpen(false);
                  setQuery("");
                }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
