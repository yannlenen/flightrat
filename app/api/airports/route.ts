import { NextRequest, NextResponse } from "next/server";
import { Airport } from "@/lib/types";

/**
 * Search airports using Travelpayouts free autocomplete API (no key needed).
 * Falls back to Amadeus if configured.
 */
export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "";

  if (keyword.length < 1) {
    return NextResponse.json([]);
  }

  try {
    // Travelpayouts free autocomplete — no auth required
    const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(keyword)}&locale=fr&types[]=airport&types[]=city`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Travelpayouts ${res.status}`);

    const data = await res.json();
    const seen = new Set<string>();
    const airports: Airport[] = [];

    for (const item of data) {
      const iata = item.code as string;
      if (!iata || iata.length !== 3 || seen.has(iata)) continue;
      seen.add(iata);

      airports.push({
        iata,
        name: (item.name as string) ?? iata,
        city: (item.city_name as string) ?? (item.name as string) ?? "",
        country: (item.country_name as string) ?? "",
        lat: item.coordinates?.lat ?? 0,
        lng: item.coordinates?.lon ?? 0,
      });
    }

    return NextResponse.json(airports.slice(0, 10));
  } catch (error) {
    console.error("Airport search error:", error);
    // Fallback to Amadeus if available
    try {
      const { searchAirports } = await import("@/lib/amadeus");
      const results = await searchAirports(keyword);
      return NextResponse.json(results);
    } catch {
      return NextResponse.json([]);
    }
  }
}
