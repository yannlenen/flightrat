export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface FlightDestination {
  destination: Airport;
  price: number;
  currency: string;
  airline: string;
  departureDate: string;
  returnDate: string;
  direct: boolean;
  duration: string;
  bookingLink?: string; // Direct booking URL (from Kiwi API)
}

export interface FilterState {
  departureMonth: string; // "2026-04", "flexible"
  stayDuration: "1-3" | "4-7" | "8-14" | "any";
  maxBudget: number;
  directOnly: boolean;
}

export interface FlightSearchParams {
  origin: string;
  departureMonth?: string;
  maxPrice?: number;
  directOnly?: boolean;
}
