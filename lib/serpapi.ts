import { FlightDestination } from "./types";
import { getCached } from "./cache";

function getApiKey(): string | null {
  return process.env.SERPAPI_KEY || null;
}

export function isSerpApiConfigured(): boolean {
  const key = getApiKey();
  return !!key && key.length > 10;
}

/** Convert minutes to "Xh:MM" format */
function formatDuration(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/** Map month filter "2026-05" to SerpAPI month param (1-12) */
function monthToNumber(month?: string): number {
  if (!month || month === "flexible") return 0; // 0 = next 6 months
  const m = parseInt(month.split("-")[1], 10);
  return isNaN(m) ? 0 : m;
}

/** Map stay duration to SerpAPI travel_duration */
function stayToTravelDuration(stay?: string): number | undefined {
  switch (stay) {
    case "1-3": return 1;  // weekend
    case "4-7": return 2;  // 1 week
    case "8-14": return 3; // 2 weeks
    default: return undefined;
  }
}

interface ExploreDestination {
  destination_id: string;
  name: string;
  country: string;
  gps_coordinates?: { latitude: number; longitude: number };
  destination_airport?: { code: string };
  start_date?: string;
  end_date?: string;
  flight_price?: number;
  flight_duration?: number;
  number_of_stops?: number;
  airline?: string;
  airline_code?: string;
}

/**
 * Search cheapest flights from origin using SerpAPI Google Travel Explore.
 * Returns real-time Google Flights prices for all destinations in 1 API call.
 */
export async function searchSerpApiFlights(
  origin: string,
  month?: string,
  stay?: string,
): Promise<FlightDestination[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const cacheKey = `serp:${origin}:${month ?? "flex"}:${stay ?? "any"}`;

  return getCached(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        engine: "google_travel_explore",
        departure_id: origin,
        currency: "EUR",
        hl: "fr",
        gl: "fr",
        api_key: apiKey,
      });

      const monthNum = monthToNumber(month);
      if (monthNum > 0) {
        params.set("month", String(monthNum));
      }

      const travelDuration = stayToTravelDuration(stay);
      if (travelDuration) {
        params.set("travel_duration", String(travelDuration));
      }

      const res = await fetch(`https://serpapi.com/search.json?${params}`);
      if (!res.ok) {
        console.error(`SerpAPI error: ${res.status} ${res.statusText}`);
        return [];
      }

      const json = await res.json();
      const destinations: ExploreDestination[] = json.destinations ?? [];

      if (destinations.length === 0) {
        console.log("SerpAPI: no destinations returned");
        return [];
      }

      const flights: FlightDestination[] = [];
      const seenAirports = new Map<string, number>(); // airport code → best price

      for (const dest of destinations) {
        if (!dest.flight_price || !dest.gps_coordinates) continue;

        const airportCode = dest.destination_airport?.code ?? "";
        if (!airportCode) continue;

        // Deduplicate by airport code: keep the cheapest
        const existing = seenAirports.get(airportCode);
        if (existing !== undefined && existing <= dest.flight_price) continue;
        seenAirports.set(airportCode, dest.flight_price);

        // Remove previous entry for this airport if we found a cheaper one
        if (existing !== undefined) {
          const idx = flights.findIndex((f) => f.destination.iata === airportCode);
          if (idx >= 0) flights.splice(idx, 1);
        }

        const depDate = dest.start_date ?? "";
        const retDate = dest.end_date ?? "";

        flights.push({
          destination: {
            iata: airportCode,
            name: dest.name,
            city: dest.name,
            country: dest.country ?? "",
            lat: dest.gps_coordinates.latitude,
            lng: dest.gps_coordinates.longitude,
          },
          price: dest.flight_price,
          currency: "EUR",
          airline: dest.airline ?? "",
          departureDate: depDate,
          returnDate: retDate,
          direct: dest.number_of_stops === 0,
          duration: formatDuration(dest.flight_duration ?? 0),
          bookingLink: buildSearchLink(origin, airportCode, depDate, retDate),
        });
      }

      return flights.sort((a, b) => a.price - b.price);
    },
    { ttl: 3600 }, // cache 1h — prices are real-time, save API credits
  );
}

function buildSearchLink(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
): string {
  return `https://www.kayak.fr/flights/${origin}-${destination}/${departureDate}/${returnDate}?sort=bestflight_a`;
}
