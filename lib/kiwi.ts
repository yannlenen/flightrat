import { FlightDestination } from "./types";
import { getCached } from "./cache";

const KIWI_BASE = "https://api.tequila.kiwi.com/v2";

function getApiKey(): string | null {
  return process.env.KIWI_API_KEY || null;
}

export function isKiwiConfigured(): boolean {
  const key = getApiKey();
  return !!key && key.length > 5;
}

interface KiwiFlight {
  flyTo: string;
  cityTo: string;
  countryTo: { name: string };
  price: number;
  airlines: string[];
  route: Array<{ airline: string; latTo: number; lngTo: number; flyTo: string }>;
  deep_link: string;
  departure: string;
  duration: { departure: number; return: number; total: number };
  mapIdfrom: string;
  mapIdto: string;
}

interface KiwiSearchResponse {
  data: KiwiFlight[];
  currency: string;
}

/** Map of IATA codes to coordinates for enrichment */
const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {};

// We'll populate this lazily from our static data
let coordsLoaded = false;
async function ensureCoords() {
  if (coordsLoaded) return;
  const { POPULAR_AIRPORTS } = await import("./static-data");
  // Also add all destination airports from static data
  const { getStaticDestinations } = await import("./static-data");
  const dests = getStaticDestinations();
  for (const a of POPULAR_AIRPORTS) {
    AIRPORT_COORDS[a.iata] = { lat: a.lat, lng: a.lng };
  }
  for (const d of dests) {
    AIRPORT_COORDS[d.destination.iata] = {
      lat: d.destination.lat,
      lng: d.destination.lng,
    };
  }
  coordsLoaded = true;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/**
 * Search cheapest round-trip flights from an origin for a given month.
 * Returns results sorted by price.
 */
export async function searchKiwiFlights(
  origin: string,
  month?: string,     // "2026-05" or "flexible"
  stayDays?: number,  // nights min
  stayDaysMax?: number,
): Promise<FlightDestination[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  await ensureCoords();

  // Date range: if flexible, search next 2 months; otherwise the selected month
  let dateFrom: string;
  let dateTo: string;

  if (!month || month === "flexible") {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() + 7); // at least 1 week out
    const to = new Date(now);
    to.setMonth(to.getMonth() + 3);
    dateFrom = formatDate(from);
    dateTo = formatDate(to);
  } else {
    // month = "2026-05"
    const [y, m] = month.split("-").map(Number);
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0); // last day of month
    dateFrom = formatDate(from);
    dateTo = formatDate(to);
  }

  const nightsFrom = stayDays ?? 2;
  const nightsTo = stayDaysMax ?? Math.max(nightsFrom + 5, 14);

  const cacheKey = `kiwi:${origin}:${dateFrom}:${dateTo}:${nightsFrom}:${nightsTo}`;

  return getCached(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        fly_from: origin,
        date_from: dateFrom,
        date_to: dateTo,
        nights_in_dst_from: String(nightsFrom),
        nights_in_dst_to: String(nightsTo),
        flight_type: "round",
        one_for_city: "1",        // one result per city (cheapest)
        max_stopovers: "2",
        curr: "EUR",
        locale: "fr",
        limit: "50",
        sort: "price",
        asc: "1",
      });

      const res = await fetch(`${KIWI_BASE}/search?${params}`, {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error(`Kiwi API error: ${res.status} ${res.statusText}`);
        return [];
      }

      const json: KiwiSearchResponse = await res.json();

      const flights: FlightDestination[] = [];
      const seenCities = new Set<string>();

      for (const f of json.data) {
        if (seenCities.has(f.cityTo)) continue;
        seenCities.add(f.cityTo);

        // Get coordinates from route (last outbound segment) or our static data
        let lat: number | undefined;
        let lng: number | undefined;

        // Kiwi route contains segments; the destination of the last outbound segment has coords
        if (f.route && f.route.length > 0) {
          // Find the segment that arrives at the destination airport
          const destSeg = f.route.find((r) => r.flyTo === f.flyTo);
          if (destSeg && destSeg.latTo && destSeg.lngTo) {
            lat = destSeg.latTo;
            lng = destSeg.lngTo;
          }
        }

        // Fallback to our static coords
        if (!lat || !lng) {
          const coords = AIRPORT_COORDS[f.flyTo];
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          }
        }

        // Skip if we can't geolocate
        if (!lat || !lng) continue;

        const outboundStops = f.route
          ? Math.max(0, f.route.filter((_, i) => i < f.route.length / 2).length - 1)
          : 0;

        flights.push({
          destination: {
            iata: f.flyTo,
            name: f.cityTo,
            city: f.cityTo,
            country: f.countryTo?.name ?? "",
            lat,
            lng,
          },
          price: f.price,
          currency: json.currency || "EUR",
          airline: f.airlines?.[0] ?? "Unknown",
          departureDate: f.departure?.split("T")[0] ?? dateFrom.split("/").reverse().join("-"),
          returnDate: "",
          direct: outboundStops === 0,
          duration: formatDuration(f.duration?.departure ?? 0),
          bookingLink: f.deep_link,
        });
      }

      // Fill in return dates
      for (const f of flights) {
        if (!f.returnDate && f.departureDate) {
          const dep = new Date(f.departureDate);
          dep.setDate(dep.getDate() + nightsFrom);
          f.returnDate = dep.toISOString().split("T")[0];
        }
      }

      return flights;
    },
    { ttl: 3600 } // cache 1 hour
  );
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
