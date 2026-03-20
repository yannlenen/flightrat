import { NextRequest, NextResponse } from "next/server";
import { isKiwiConfigured, searchKiwiFlights } from "@/lib/kiwi";
import { isSerpApiConfigured, searchSerpApiFlights } from "@/lib/serpapi";
import { isTravelpayoutsConfigured, searchTravelpayoutsFlights } from "@/lib/travelpayouts";
import { getFilteredDestinations, POPULAR_AIRPORTS } from "@/lib/static-data";
import { estimateFlightDuration } from "@/lib/utils";
import { FlightDestination } from "@/lib/types";

/** Fill in missing durations using great-circle distance estimation */
function fillMissingDurations(flights: FlightDestination[], originIata: string): FlightDestination[] {
  const originAirport = POPULAR_AIRPORTS.find((a) => a.iata === originIata);
  if (!originAirport) return flights;

  return flights.map((f) => {
    if (f.duration && f.duration.includes("h")) return f; // already has a real duration
    const estimated = estimateFlightDuration(
      originAirport.lat,
      originAirport.lng,
      f.destination.lat,
      f.destination.lng,
      f.direct
    );
    return { ...f, duration: estimated || f.duration };
  });
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get("origin") ?? "CDG";
  const month = request.nextUrl.searchParams.get("month") ?? "flexible";
  const stay = request.nextUrl.searchParams.get("stay") ?? "any";

  // Stay duration in days
  let nightsMin = 2;
  let nightsMax = 14;
  switch (stay) {
    case "1-3":
      nightsMin = 1;
      nightsMax = 3;
      break;
    case "4-7":
      nightsMin = 4;
      nightsMax = 7;
      break;
    case "8-14":
      nightsMin = 8;
      nightsMax = 14;
      break;
  }

  // 1. SerpAPI Google Flights (real-time exact prices)
  if (isSerpApiConfigured()) {
    try {
      const serpFlights = await searchSerpApiFlights(origin, month, stay);

      // If SerpAPI returns results, enrich with Travelpayouts for more destinations
      if (serpFlights.length > 0) {
        if (isTravelpayoutsConfigured()) {
          try {
            const tpFlights = await searchTravelpayoutsFlights(origin, month, stay);
            // Add Travelpayouts destinations not already covered by SerpAPI
            const serpAirports = new Set(serpFlights.map((f) => f.destination.iata));
            const extra = tpFlights.filter((f) => !serpAirports.has(f.destination.iata));
            return NextResponse.json(fillMissingDurations([...serpFlights, ...extra], origin));
          } catch {
            // SerpAPI results alone are fine
          }
        }
        return NextResponse.json(fillMissingDurations(serpFlights, origin));
      }
    } catch (error) {
      console.error("SerpAPI error:", error);
    }
  }

  // 2. Kiwi API (real prices with deep links)
  if (isKiwiConfigured()) {
    try {
      const flights = await searchKiwiFlights(origin, month, nightsMin, nightsMax);
      if (flights.length > 0) {
        return NextResponse.json(fillMissingDurations(flights, origin));
      }
    } catch (error) {
      console.error("Kiwi API error:", error);
    }
  }

  // 3. Travelpayouts (cached prices, broad coverage)
  if (isTravelpayoutsConfigured()) {
    try {
      const flights = await searchTravelpayoutsFlights(origin, month, stay);
      if (flights.length > 0) {
        return NextResponse.json(fillMissingDurations(flights, origin));
      }
    } catch (error) {
      console.error("Travelpayouts API error:", error);
    }
  }

  // 4. Fallback to static data
  const flights = getFilteredDestinations(origin, month, stay);
  return NextResponse.json(flights);
}
