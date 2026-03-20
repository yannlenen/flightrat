/**
 * Neon price color palette for dark theme.
 * Bright greens for deals, warm yellows for medium, vivid reds for expensive.
 */
export function getPriceColor(price: number): string {
  if (price <= 50) return "#00FF87";   // INSANE — neon green
  if (price <= 150) {
    const t = (price - 50) / 100;
    return interpolateColor("#00FF87", "#FBBF24", t);
  }
  if (price <= 300) {
    const t = (price - 150) / 150;
    return interpolateColor("#FBBF24", "#F97316", t);
  }
  if (price <= 500) {
    const t = (price - 300) / 200;
    return interpolateColor("#F97316", "#FF3B5C", t);
  }
  return "#FF3B5C";
}

function interpolateColor(from: string, to: string, t: number): string {
  const f = hexToRgb(from);
  const toRgb = hexToRgb(to);
  const r = Math.round(f.r + (toRgb.r - f.r) * t);
  const g = Math.round(f.g + (toRgb.g - f.g) * t);
  const b = Math.round(f.b + (toRgb.b - f.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getPriceLabel(price: number): string {
  if (price < 50) return "Insane";
  if (price < 150) return "Top deal";
  if (price < 300) return "Bon prix";
  if (price < 500) return "Correct";
  return "Premium";
}

export function buildBookingUrl(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string
): string {
  const depDate = formatDateISO(departureDate);
  const retDate = formatDateISO(returnDate);
  return `https://www.kayak.fr/flights/${origin}-${destination}/${depDate}/${retDate}?sort=bestflight_a`;
}

export function buildHotelUrl(city: string): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`;
}

function formatDateISO(date: string): string {
  return new Date(date).toISOString().split("T")[0];
}

/**
 * Estimate flight duration from great-circle distance.
 * Avg cruise speed ~850 km/h + 30 min for taxi/climb/descent.
 * Returns formatted string like "2h15" or "" if coords are missing.
 */
export function estimateFlightDuration(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  direct: boolean
): string {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(destLat - originLat);
  const dLng = toRad(destLng - originLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(originLat)) * Math.cos(toRad(destLat)) * Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const cruiseSpeed = 850; // km/h
  let hours = dist / cruiseSpeed + 0.5; // +30min overhead
  if (!direct) hours += 1.5; // layover estimate

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60 / 5) * 5; // round to 5min
  if (h === 0 && m === 0) return "";
  return `${h}h${m.toString().padStart(2, "0")}`;
}
