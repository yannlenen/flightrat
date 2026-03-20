import { FlightDestination } from "./types";
import { getCached } from "./cache";

const API_BASE = "https://api.travelpayouts.com";

function getToken(): string | null {
  return process.env.TRAVELPAYOUTS_TOKEN || null;
}

export function isTravelpayoutsConfigured(): boolean {
  const token = getToken();
  return !!token && token.length > 5;
}

/** Build a Kayak search link with the exact dates */
function buildSearchLink(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
): string {
  return `https://www.kayak.fr/flights/${origin}-${destination}/${departureDate}/${returnDate}?sort=bestflight_a`;
}

// ─── Reference data caches (loaded once from Travelpayouts) ───

interface CityInfo {
  code: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
}

interface CountryInfo {
  code: string;
  name: string;
}

let citiesMap: Map<string, CityInfo> | null = null;
let countriesMap: Map<string, CountryInfo> | null = null;
let airlinesMap: Record<string, string> | null = null;

async function ensureCities(): Promise<Map<string, CityInfo>> {
  if (citiesMap) return citiesMap;
  citiesMap = new Map();
  try {
    const res = await fetch("https://api.travelpayouts.com/data/fr/cities.json");
    if (res.ok) {
      const cities: Array<{
        code: string;
        name: string;
        country_code: string;
        coordinates: { lat: number; lon: number };
      }> = await res.json();
      for (const c of cities) {
        if (c.code && c.coordinates?.lat && c.coordinates?.lon && c.name) {
          citiesMap.set(c.code, {
            code: c.code,
            name: c.name,
            countryCode: c.country_code ?? "",
            lat: c.coordinates.lat,
            lng: c.coordinates.lon,
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to load cities:", e);
  }
  return citiesMap;
}

async function ensureCountries(): Promise<Map<string, CountryInfo>> {
  if (countriesMap) return countriesMap;
  countriesMap = new Map();
  try {
    const res = await fetch("https://api.travelpayouts.com/data/fr/countries.json");
    if (res.ok) {
      const countries: Array<{ code: string; name: string }> = await res.json();
      for (const c of countries) {
        if (c.code && c.name) {
          countriesMap.set(c.code, { code: c.code, name: c.name });
        }
      }
    }
  } catch (e) {
    console.error("Failed to load countries:", e);
  }
  return countriesMap;
}

async function ensureAirlines(): Promise<Record<string, string>> {
  if (airlinesMap) return airlinesMap;
  airlinesMap = {};
  try {
    const res = await fetch("https://api.travelpayouts.com/data/en/airlines.json");
    if (res.ok) {
      const airlines: Array<{ code: string; name: string }> = await res.json();
      for (const a of airlines) {
        if (a.code && a.name) airlinesMap[a.code] = a.name;
      }
    }
  } catch { /* ignore */ }
  return airlinesMap;
}

// ─── Main search function ───

/**
 * Search cheapest flights from origin using Travelpayouts /v1/prices/cheap.
 * This endpoint returns the cheapest tickets found recently, grouped by destination
 * and number of stops (0=direct, 1=one stop, 2=two stops).
 */
export async function searchTravelpayoutsFlights(
  origin: string,
  month?: string,
  stay?: string,
): Promise<FlightDestination[]> {
  const token = getToken();
  if (!token) return [];

  const cacheKey = `tp:cheap:${origin}:${month ?? "flex"}:${stay ?? "any"}`;

  return getCached(
    cacheKey,
    async () => {
      // Load reference data in parallel
      const [cities, countries, airlines] = await Promise.all([
        ensureCities(),
        ensureCountries(),
        ensureAirlines(),
      ]);

      const params = new URLSearchParams({
        origin,
        currency: "eur",
        token,
      });

      if (month && month !== "flexible") {
        params.set("depart_date", month);
        params.set("return_date", month);
      }

      const res = await fetch(`${API_BASE}/v1/prices/cheap?${params}`);
      if (!res.ok) {
        console.error(`prices/cheap failed: ${res.status}`);
        return [];
      }

      const json = await res.json();
      const data = json.data as Record<string, Record<string, {
        price: number;
        airline: string;
        flight_number: number;
        departure_at: string;
        return_at: string;
        expires_at: string;
      }>>;

      if (!data) return [];

      // Parse stay filter into night range
      let minNights = 0;
      let maxNights = Infinity;
      switch (stay) {
        case "1-3": minNights = 1; maxNights = 3; break;
        case "4-7": minNights = 4; maxNights = 7; break;
        case "8-14": minNights = 8; maxNights = 14; break;
      }

      const flights: FlightDestination[] = [];

      for (const [destCode, stopOptions] of Object.entries(data)) {
        // Prefer direct (0), then 1 stop, then 2
        const best = stopOptions["0"] || stopOptions["1"] || stopOptions["2"];
        if (!best) continue;

        // Filter by stay duration if specified
        if (stay && stay !== "any" && best.departure_at && best.return_at) {
          const dep = new Date(best.departure_at);
          const ret = new Date(best.return_at);
          const nights = Math.round((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24));
          if (nights < minNights || nights > maxNights) continue;
        }

        const isDirect = !!stopOptions["0"];
        const transfers = stopOptions["0"] ? 0 : stopOptions["1"] ? 1 : 2;

        // Resolve destination
        const city = cities.get(destCode);
        if (!city) continue;

        const country = countries.get(city.countryCode);
        const airlineName = airlines[best.airline] || best.airline;
        const depDate = best.departure_at?.split("T")[0] ?? "";
        const retDate = best.return_at?.split("T")[0] ?? "";

        flights.push({
          destination: {
            iata: destCode,
            name: city.name,
            city: city.name,
            country: country?.name ?? city.countryCode,
            lat: city.lat,
            lng: city.lng,
          },
          price: best.price,
          currency: "EUR",
          airline: airlineName,
          departureDate: depDate,
          returnDate: retDate,
          direct: isDirect,
          duration: transfers === 0 ? "" : `${transfers} escale${transfers > 1 ? "s" : ""}`,
          bookingLink: buildSearchLink(origin, destCode, depDate, retDate),
        });
      }

      return flights.sort((a, b) => a.price - b.price);
    },
    { ttl: 1800 },
  );
}
