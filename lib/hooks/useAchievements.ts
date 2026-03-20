"use client";

import { useState, useEffect, useCallback } from "react";

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "explorer", emoji: "🌍", title: "Explorateur", description: "Première visite sur FlightRat" },
  { id: "deal-hunter", emoji: "🎯", title: "Chasseur de deals", description: "Budget < 100€ avec des résultats" },
  { id: "globetrotter", emoji: "✈️", title: "Globe-trotter", description: "10+ destinations consultées" },
  { id: "vip", emoji: "💎", title: "VIP", description: "Consulter un vol > 500€" },
];

const STORAGE_KEY = "flightrat-achievements";
const VIEWED_KEY = "flightrat-viewed-destinations";

function getUnlocked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUnlocked(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function getViewedCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const viewed = JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]");
    return viewed.length;
  } catch {
    return 0;
  }
}

function addViewed(iata: string) {
  try {
    const viewed: string[] = JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]");
    if (!viewed.includes(iata)) {
      viewed.push(iata);
      localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
    }
    return viewed.length;
  } catch {
    return 0;
  }
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [pending, setPending] = useState<Achievement | null>(null);

  useEffect(() => {
    setUnlocked(getUnlocked());
  }, []);

  const unlock = useCallback(
    (id: string) => {
      if (unlocked.includes(id)) return;
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement) return;

      const next = [...unlocked, id];
      setUnlocked(next);
      saveUnlocked(next);
      setPending(achievement);
    },
    [unlocked]
  );

  const dismissPending = useCallback(() => setPending(null), []);

  // Check explorer on mount
  useEffect(() => {
    if (unlocked.length === 0 && typeof window !== "undefined") {
      // First time? Wait a beat then unlock explorer
      const t = setTimeout(() => unlock("explorer"), 3000);
      return () => clearTimeout(t);
    }
  }, [unlocked, unlock]);

  const checkBudget = useCallback(
    (budget: number, hasResults: boolean) => {
      if (budget < 100 && hasResults) unlock("deal-hunter");
    },
    [unlock]
  );

  const checkViewed = useCallback(
    (iata: string) => {
      const count = addViewed(iata);
      if (count >= 10) unlock("globetrotter");
    },
    [unlock]
  );

  const checkVip = useCallback(
    (price: number) => {
      if (price > 500) unlock("vip");
    },
    [unlock]
  );

  return { unlocked, pending, dismissPending, checkBudget, checkViewed, checkVip };
}
