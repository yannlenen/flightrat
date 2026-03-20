import { FlightDestination, Airport } from "./types";
import { getCached } from "./cache";
import { POPULAR_AIRPORTS } from "./static-data";

let accessToken: string | null = null;
let tokenExpiry = 0;

const AMADEUS_BASE = process.env.AMADEUS_API_ENV === "production"
  ? "https://api.amadeus.com"
  : "https://test.api.amadeus.com";

export function isAmadeusConfigured(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`Amadeus auth failed: ${res.status}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken!;
}

/** Build a coords lookup from our static airport data */
const AIRPORT_MAP = new Map<string, Airport>();
for (const a of POPULAR_AIRPORTS) {
  AIRPORT_MAP.set(a.iata, a);
}

interface AmadeusFlightOffer {
  type: string;
  id: string;
  source: string;
  itineraries: Array<{
    duration: string; // "PT2H15M"
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      operating?: { carrierCode: string };
      duration: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    grandTotal: string;
  };
  validatingAirlineCodes: string[];
}

interface AmadeusFlightOffersResponse {
  data: AmadeusFlightOffer[];
  dictionaries?: {
    carriers?: Record<string, string>;
  };
}

/** Parse ISO 8601 duration like "PT2H15M" to "2h15" */
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return "";
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/**
 * Search round-trip flight offers from origin to a specific destination.
 * Uses Amadeus Flight Offers Search v2 for real-time prices.
 */
async function searchOffersForRoute(
  token: string,
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
): Promise<{ price: number; currency: string; airline: string; airlineName: string; duration: string; direct: boolean; depDate: string; retDate: string } | null> {
  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    returnDate,
    adults: "1",
    nonStop: "false",
    currencyCode: "EUR",
    max: "1", // just the cheapest
  });

  const res = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  const json: AmadeusFlightOffersResponse = await res.json();
  if (!json.data || json.data.length === 0) return null;

  const offer = json.data[0];
  const outbound = offer.itineraries[0];
  const carrierCode = offer.validatingAirlineCodes?.[0] ?? outbound.segments[0].carrierCode;
  const carrierName = json.dictionaries?.carriers?.[carrierCode] ?? carrierCode;

  return {
    price: parseFloat(offer.price.grandTotal),
    currency: offer.price.currency,
    airline: carrierCode,
    airlineName: carrierName,
    duration: parseDuration(outbound.duration),
    direct: outbound.segments.length === 1,
    depDate: departureDate,
    retDate: returnDate,
  };
}

/**
 * Search cheapest flights from an origin using Amadeus Flight Inspiration Search.
 * This endpoint returns pre-cached cheapest prices — fast but not always real-time.
 * Falls back to per-route search for top destinations if this endpoint fails.
 */
export async function searchAmadeusFlights(
  origin: string,
  month?: string,
  nightsMin?: number,
  nightsMax?: number,
): Promise<FlightDestination[]> {
  if (!isAmadeusConfigured()) return [];

  const token = await getAccessToken();

  // Determine date range
  let dateFrom: string;
  let dateTo: string;

  if (!month || month === "flexible") {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() + 7);
    dateFrom = from.toISOString().split("T")[0];
    const to = new Date(now);
    to.setMonth(to.getMonth() + 3);
    dateTo = to.toISOString().split("T")[0];
  } else {
    const [y, m] = month.split("-").map(Number);
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0);
    dateFrom = from.toISOString().split("T")[0];
    dateTo = to.toISOString().split("T")[0];
  }

  const stayMin = nightsMin ?? 2;
  const stayMax = nightsMax ?? 14;

  const cacheKey = `amadeus:${origin}:${dateFrom}:${dateTo}:${stayMin}:${stayMax}`;

  return getCached(
    cacheKey,
    async () => {
      // Strategy 1: Try Flight Inspiration Search (fast, cached prices)
      const inspirationFlights = await tryInspirationSearch(token, origin, dateFrom, dateTo);
      if (inspirationFlights.length > 0) {
        return inspirationFlights;
      }

      // Strategy 2: Fallback — search top destinations individually
      // Pick a representative departure date (middle of range)
      const depDate = dateFrom;
      const dep = new Date(depDate);
      const ret = new Date(dep);
      ret.setDate(ret.getDate() + Math.min(stayMin + 2, stayMax));
      const retDate = ret.toISOString().split("T")[0];

      return searchTopDestinations(token, origin, depDate, retDate);
    },
    { ttl: 3600 },
  );
}

/**
 * Amadeus Flight Inspiration Search — returns pre-cached cheapest prices.
 */
async function tryInspirationSearch(
  token: string,
  origin: string,
  dateFrom: string,
  dateTo: string,
): Promise<FlightDestination[]> {
  const params = new URLSearchParams({
    origin,
    departureDate: `${dateFrom},${dateTo}`,
    oneWay: "false",
    nonStop: "false",
    currencyCode: "EUR",
    maxPrice: "1500",
  });

  try {
    const res = await fetch(`${AMADEUS_BASE}/v1/shopping/flight-destinations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.log(`Inspiration search failed: ${res.status}`);
      return [];
    }

    const json = await res.json();
    if (!json.data || json.data.length === 0) return [];

    const flights: FlightDestination[] = [];
    const seenCities = new Set<string>();

    for (const item of json.data) {
      const destIata = item.destination as string;
      const airport = AIRPORT_MAP.get(destIata);
      if (!airport) continue; // skip destinations we can't geolocate
      if (seenCities.has(airport.city)) continue;
      seenCities.add(airport.city);

      flights.push({
        destination: {
          iata: destIata,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          lat: airport.lat,
          lng: airport.lng,
        },
        price: parseFloat(item.price?.total ?? "0"),
        currency: "EUR",
        airline: "", // Inspiration search doesn't return airline
        departureDate: item.departureDate ?? dateFrom,
        returnDate: item.returnDate ?? "",
        direct: false, // unknown from this endpoint
        duration: "",
      });
    }

    return flights.sort((a, b) => a.price - b.price);
  } catch (e) {
    console.error("Inspiration search error:", e);
    return [];
  }
}

/**
 * Search popular destinations one by one with Flight Offers Search.
 * More expensive in API calls but gives real-time prices with full details.
 */
async function searchTopDestinations(
  token: string,
  origin: string,
  departureDate: string,
  returnDate: string,
): Promise<FlightDestination[]> {
  // European destinations that are commonly cheap from major airports
  const topDestinations = POPULAR_AIRPORTS.filter(
    (a) => a.iata !== origin && a.country !== "USA" && a.country !== "Canada"
      && a.country !== "Brazil" && a.country !== "Australia" && a.country !== "New Zealand"
      && a.country !== "China" && a.country !== "Japan" && a.country !== "South Korea"
      && a.country !== "India" && a.country !== "Malaysia" && a.country !== "Indonesia"
      && a.country !== "Singapore"
  ).slice(0, 30); // limit to 30 to stay within rate limits

  // Search in parallel batches of 5
  const flights: FlightDestination[] = [];
  const batchSize = 5;

  for (let i = 0; i < topDestinations.length; i += batchSize) {
    const batch = topDestinations.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((dest) =>
        searchOffersForRoute(token, origin, dest.iata, departureDate, returnDate)
          .then((result) => result ? { dest, result } : null)
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const { dest, result } = r.value;
        flights.push({
          destination: {
            iata: dest.iata,
            name: dest.name,
            city: dest.city,
            country: dest.country,
            lat: dest.lat,
            lng: dest.lng,
          },
          price: result.price,
          currency: result.currency,
          airline: result.airlineName,
          departureDate: result.depDate,
          returnDate: result.retDate,
          direct: result.direct,
          duration: result.duration,
        });
      }
    }
  }

  return flights.sort((a, b) => a.price - b.price);
}

/**
 * Search airports by keyword using Amadeus Location API.
 */
export async function searchAirports(keyword: string): Promise<Airport[]> {
  if (!isAmadeusConfigured()) {
    return POPULAR_AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(keyword.toLowerCase()) ||
        a.iata.toLowerCase().includes(keyword.toLowerCase()) ||
        a.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  return getCached(
    `airports:${keyword.toLowerCase()}`,
    async () => {
      const token = await getAccessToken();
      const res = await fetch(
        `${AMADEUS_BASE}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(keyword)}&page%5Blimit%5D=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        return POPULAR_AIRPORTS.filter((a) =>
          a.city.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      const json = await res.json();
      return (json.data ?? []).map(
        (loc: Record<string, unknown>): Airport => ({
          iata: loc.iataCode as string,
          name: loc.name as string,
          city: (loc.address as Record<string, string>)?.cityName ?? "",
          country: (loc.address as Record<string, string>)?.countryName ?? "",
          lat: (loc.geoCode as Record<string, number>)?.latitude ?? 0,
          lng: (loc.geoCode as Record<string, number>)?.longitude ?? 0,
        })
      );
    },
    { ttl: 24 * 3600 }
  );
}
