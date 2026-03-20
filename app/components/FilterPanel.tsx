"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FilterState } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const STAY_OPTIONS: { value: FilterState["stayDuration"]; label: string }[] = [
  { value: "any", label: "Tous" },
  { value: "1-3", label: "1-3 j" },
  { value: "4-7", label: "4-7 j" },
  { value: "8-14", label: "1-2 sem" },
];

export default function FilterPanel({
  filters,
  onChange,
  isOpen,
  onToggle,
}: FilterPanelProps) {
  return (
    <div className="w-72">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="glass rounded-xl px-4 py-3 flex items-center gap-2 w-full text-left transition-colors hover:bg-white/5"
      >
        <svg
          className="w-4 h-4"
          style={{ color: "var(--text-muted)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Filtres</span>
        <motion.svg
          className="w-3 h-3 ml-auto"
          style={{ color: "var(--text-muted)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl mt-2 p-4 space-y-5">
              {/* Budget max */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>
                    Budget max A/R
                  </label>
                  <span className="text-sm font-semibold font-display" style={{ color: "var(--text-primary)" }}>
                    {formatPrice(filters.maxBudget)}
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={filters.maxBudget}
                  onChange={(e) =>
                    onChange({ ...filters, maxBudget: Number(e.target.value) })
                  }
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Durée du séjour */}
              <div>
                <label className="text-xs uppercase tracking-wider font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>
                  Durée du séjour
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {STAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onChange({ ...filters, stayDuration: opt.value })
                      }
                      className={`text-xs py-1.5 rounded-lg transition-all font-medium ${
                        filters.stayDuration === opt.value
                          ? "bg-accent text-white shadow-sm"
                          : "text-white/60 hover:bg-white/10"
                      }`}
                      style={filters.stayDuration !== opt.value ? { background: "rgba(255,255,255,0.05)" } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct uniquement */}
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>
                  Vols directs
                </label>
                <button
                  onClick={() =>
                    onChange({ ...filters, directOnly: !filters.directOnly })
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    filters.directOnly ? "bg-accent" : ""
                  }`}
                  style={!filters.directOnly ? { background: "rgba(255,255,255,0.15)" } : {}}
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ left: filters.directOnly ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Mois de départ */}
              <div>
                <label className="text-xs uppercase tracking-wider font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>
                  Mois de départ
                </label>
                <select
                  value={filters.departureMonth}
                  onChange={(e) =>
                    onChange({ ...filters, departureMonth: e.target.value })
                  }
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none appearance-none cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="flexible">Dates flexibles</option>
                  <option value="2026-04">Avril 2026</option>
                  <option value="2026-05">Mai 2026</option>
                  <option value="2026-06">Juin 2026</option>
                  <option value="2026-07">Juillet 2026</option>
                  <option value="2026-08">Août 2026</option>
                  <option value="2026-09">Septembre 2026</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
