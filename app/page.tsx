"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Airport, FilterState, FlightDestination } from "@/lib/types";
import { DEFAULT_ORIGIN, getFilteredDestinations } from "@/lib/static-data";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import AirportSearch from "./components/AirportSearch";
import AirportPicker from "./components/AirportPicker";
import FilterPanel from "./components/FilterPanel";
import DestinationCard from "./components/DestinationCard";
import DestinationList from "./components/DestinationList";
import PriceScale from "./components/PriceScale";
import TopBar from "./components/TopBar";
import BudgetSlider from "./components/BudgetSlider";
import BottomSheet, { SheetSnap } from "./components/BottomSheet";
import IntroOverlay from "./components/IntroOverlay";
import ConfettiBurst from "./components/ConfettiBurst";
import AchievementToast from "./components/AchievementToast";
import ShareCard from "./components/ShareCard";
import { useAchievements } from "@/lib/hooks/useAchievements";

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement de la carte...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [origin, setOrigin] = useState<Airport>(DEFAULT_ORIGIN);
  const [allFlights, setAllFlights] = useState<FlightDestination[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightDestination | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    departureMonth: "flexible",
    stayDuration: "any",
    maxBudget: 1000,
    directOnly: false,
  });

  // Mobile layout
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("collapsed");
  const [airportPickerOpen, setAirportPickerOpen] = useState(false);

  // Intro animation (only on first load)
  const [showIntro, setShowIntro] = useState(true);
  const [introReady, setIntroReady] = useState(false);

  // Confetti on best deal tap
  const [confetti, setConfetti] = useState<{ active: boolean; x: number; y: number }>({
    active: false, x: 0, y: 0,
  });

  // Achievements
  const { pending: pendingAchievement, dismissPending, checkBudget, checkViewed, checkVip } = useAchievements();

  // Share card
  const [shareOpen, setShareOpen] = useState(false);

  // Theme toggle
  useEffect(() => {
    document.documentElement.className = isDark ? "dark" : "light";
  }, [isDark]);

  // Fetch flights from API
  const fetchFlights = useCallback(
    async (iata: string, month: string, stay: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ origin: iata, month, stay });
        const res = await fetch(`/api/flights?${params}`);
        if (res.ok) {
          const data: FlightDestination[] = await res.json();
          setAllFlights(data);
          return;
        }
      } catch {
        // fallback
      }
      setAllFlights(getFilteredDestinations(iata, month, stay));
      setLoading(false);
    },
    []
  );

  // Re-fetch when origin, month, or stay changes
  useEffect(() => {
    fetchFlights(origin.iata, filters.departureMonth, filters.stayDuration);
  }, [origin.iata, filters.departureMonth, filters.stayDuration, fetchFlights]);

  // Mark loading done when flights arrive
  useEffect(() => {
    if (allFlights.length > 0) {
      setLoading(false);
      if (showIntro && !introReady) setIntroReady(true);
    }
  }, [allFlights, showIntro, introReady]);

  // Apply budget & direct filters client-side (instant)
  const filteredFlights = useMemo(() => {
    return allFlights.filter((f) => {
      if (f.price > filters.maxBudget) return false;
      if (filters.directOnly && !f.direct) return false;
      return true;
    });
  }, [allFlights, filters]);

  const cheapestPrice = useMemo(() => {
    if (filteredFlights.length === 0) return null;
    return Math.min(...filteredFlights.map((f) => f.price));
  }, [filteredFlights]);

  const handleOriginChange = useCallback(
    (airport: Airport) => {
      setOrigin(airport);
      setSelectedFlight(null);
    },
    []
  );

  // Check budget achievement when filters change
  useEffect(() => {
    checkBudget(filters.maxBudget, filteredFlights.length > 0);
  }, [filters.maxBudget, filteredFlights.length, checkBudget]);

  // When a flight is selected on mobile, open the sheet
  const handleSelectFlight = useCallback(
    (flight: FlightDestination | null, event?: MouseEvent | React.MouseEvent) => {
      setSelectedFlight(flight);
      if (isMobile && flight) {
        setSheetSnap("half");
      }
      if (flight) {
        checkViewed(flight.destination.iata);
        checkVip(flight.price);
      }
      // Confetti for best deal
      if (flight && cheapestPrice && flight.price === cheapestPrice && event) {
        setConfetti({ active: true, x: event.clientX, y: event.clientY });
        setTimeout(() => setConfetti({ active: false, x: 0, y: 0 }), 100);
      }
    },
    [isMobile, cheapestPrice, checkViewed, checkVip]
  );

  const confettiElement = <ConfettiBurst active={confetti.active} x={confetti.x} y={confetti.y} />;
  const achievementToast = <AchievementToast achievement={pendingAchievement} onDismiss={dismissPending} />;
  const shareCard = selectedFlight ? (
    <ShareCard
      flight={selectedFlight}
      origin={origin.iata}
      isOpen={shareOpen}
      onClose={() => setShareOpen(false)}
    />
  ) : null;

  // ── Mobile layout ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <main className="relative w-screen h-screen overflow-hidden">
        {confettiElement}
        {achievementToast}
        {shareCard}
        {/* Map — full bleed */}
        <div className="absolute inset-0">
          <Map
            flights={filteredFlights}
            selectedFlight={selectedFlight}
            onSelectFlight={handleSelectFlight}
            origin={origin}
            isDark={isDark}
          />
        </div>

        {/* TopBar */}
        <TopBar
          origin={origin}
          onOriginClick={() => setAirportPickerOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          flightCount={filteredFlights.length}
          loading={loading}
        />

        {/* Budget slider — below top bar */}
        <div className="absolute top-16 inset-x-0 z-20 px-4" style={{ top: "calc(env(safe-area-inset-top) + 56px)" }}>
          <BudgetSlider
            value={filters.maxBudget}
            onChange={(v) => setFilters({ ...filters, maxBudget: v })}
            destinationCount={filteredFlights.length}
            loading={loading}
          />
        </div>

        {/* Price scale — bottom left, above bottom sheet */}
        <div className="absolute bottom-16 left-4 z-20">
          <PriceScale />
        </div>

        {/* Bottom Sheet */}
        <BottomSheet snap={sheetSnap} onSnapChange={setSheetSnap}>
          {/* Summary header */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="font-bold font-display" style={{ color: "var(--text-primary)" }}>
                {filteredFlights.length}
              </span>{" "}
              destinations depuis{" "}
              <span style={{ color: "var(--text-secondary)" }}>{origin.city}</span>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.05)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>
          </div>

          {/* Inline filters (mobile) */}
          <AnimatePresence>
            {filtersOpen && (
              <div className="mb-4">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  isOpen={true}
                  onToggle={() => setFiltersOpen(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Destination list */}
          <DestinationList
            flights={filteredFlights}
            selectedFlight={selectedFlight}
            onSelectFlight={handleSelectFlight}
            origin={origin.iata}
            loading={loading}
            onShare={() => setShareOpen(true)}
          />
        </BottomSheet>

        {/* Airport Picker modal */}
        <AirportPicker
          isOpen={airportPickerOpen}
          onClose={() => setAirportPickerOpen(false)}
          onSelect={handleOriginChange}
          selectedAirport={origin}
        />

        {/* Intro overlay */}
        {showIntro && (
          <IntroOverlay
            cityName={origin.city}
            destinationCount={filteredFlights.length}
            cheapestPrice={cheapestPrice}
            ready={introReady}
          />
        )}
      </main>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {confettiElement}
      {achievementToast}
      {shareCard}
      {/* Map */}
      <div className="absolute inset-0">
        <Map
          flights={filteredFlights}
          selectedFlight={selectedFlight}
          onSelectFlight={handleSelectFlight}
          origin={origin}
          isDark={isDark}
        />
      </div>

      {/* Left panel overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
        {/* Logo + theme toggle */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" role="img" aria-label="rat">🐀</span>
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
            FlightRat
          </span>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="ml-2 glass rounded-full p-2.5 transition-all hover:scale-110 active:scale-95"
            title={isDark ? "Mode clair" : "Mode sombre"}
            style={{
              boxShadow: isDark
                ? "0 0 12px rgba(250,204,21,0.3), inset 0 0 8px rgba(250,204,21,0.1)"
                : "0 0 12px rgba(99,102,241,0.3), inset 0 0 8px rgba(99,102,241,0.1)",
            }}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <rect x="11" y="1" width="2" height="4" rx="1" />
                <rect x="11" y="19" width="2" height="4" rx="1" />
                <rect x="19" y="11" width="4" height="2" rx="1" />
                <rect x="1" y="11" width="4" height="2" rx="1" />
                <rect x="17.2" y="3.4" width="2" height="4" rx="1" transform="rotate(45 18.2 5.4)" />
                <rect x="4.8" y="16.6" width="2" height="4" rx="1" transform="rotate(45 5.8 18.6)" />
                <rect x="16.6" y="17.2" width="4" height="2" rx="1" transform="rotate(45 18.6 18.2)" />
                <rect x="3.4" y="4.8" width="4" height="2" rx="1" transform="rotate(45 5.4 5.8)" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>

        <AirportSearch selectedAirport={origin} onSelect={handleOriginChange} />

        {/* Budget slider */}
        <div className="w-72">
          <BudgetSlider
            value={filters.maxBudget}
            onChange={(v) => setFilters({ ...filters, maxBudget: v })}
            destinationCount={filteredFlights.length}
            loading={loading}
          />
        </div>

        <FilterPanel
          filters={filters}
          onChange={setFilters}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />
      </div>

      {/* Right panel - Destination card */}
      <div className="absolute top-4 right-4 z-20">
        <AnimatePresence>
          {selectedFlight && (
            <DestinationCard
              flight={selectedFlight}
              origin={origin.iata}
              onClose={() => setSelectedFlight(null)}
              onShare={() => setShareOpen(true)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
        <PriceScale />
      </div>

      {/* Badge */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="glass rounded-lg px-3 py-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
          Powered by <span className="font-medium" style={{ color: "var(--text-secondary)" }}>FlightRat</span>
        </div>
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <IntroOverlay
          cityName={origin.city}
          destinationCount={filteredFlights.length}
          cheapestPrice={cheapestPrice}
          ready={introReady}
        />
      )}
    </main>
  );
}
