"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  MapRef,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FlightDestination, Airport } from "@/lib/types";
import { getPriceColor, formatPrice } from "@/lib/utils";

interface MapProps {
  flights: FlightDestination[];
  selectedFlight: FlightDestination | null;
  onSelectFlight: (flight: FlightDestination | null, event?: React.MouseEvent) => void;
  origin: Airport;
  isDark?: boolean;
}

function getPriceTag(price: number): string {
  if (price < 50) return "INSANE";
  if (price < 150) return "TOP DEAL";
  if (price < 300) return "BON PRIX";
  if (price < 500) return "CORRECT";
  return "PREMIUM";
}

const DARK_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const LIGHT_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

/** Patch a CartoDB style to use French labels (name:fr fallback to name) */
function patchStyleFrench(style: Record<string, unknown>): Record<string, unknown> {
  const layers = style.layers as Record<string, unknown>[];
  if (!layers) return style;
  const frExpr = ["coalesce", ["get", "name:fr"], ["get", "name"]];
  for (const layer of layers) {
    const layout = layer.layout as Record<string, unknown> | undefined;
    if (!layout) continue;
    const tf = layout["text-field"];
    if (typeof tf === "string" && (tf.includes("{name}") || tf.includes("{name_en}"))) {
      layout["text-field"] = frExpr;
    } else if (tf && typeof tf === "object" && !Array.isArray(tf)) {
      // Stops format: {"stops": [[z1, "{name_en}"], [z2, "{name}"]]}
      const s = JSON.stringify(tf);
      if (s.includes("{name") || s.includes("name_en") || s.includes('"name"')) {
        layout["text-field"] = frExpr;
      }
    } else if (Array.isArray(tf)) {
      const s = JSON.stringify(tf);
      if (s.includes('"name"') || s.includes('"name_en"') || s.includes("{name")) {
        layout["text-field"] = frExpr;
      }
    }
  }
  return style;
}

async function loadFrenchStyle(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url);
  const style = await res.json();
  return patchStyleFrench(style);
}

/** Generate a subtle curved arc between two points */
function generateArc(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number,
  numPoints = 40
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = originLng + (destLng - originLng) * t;
    const lat = originLat + (destLat - originLat) * t;
    const dist = Math.sqrt(
      (destLng - originLng) ** 2 + (destLat - originLat) ** 2
    );
    const arcHeight = Math.min(dist * 0.12, 6);
    const arc = Math.sin(t * Math.PI) * arcHeight;
    points.push([lng, lat + arc]);
  }
  return points;
}

export default function Map({
  flights,
  selectedFlight,
  onSelectFlight,
  origin,
  isDark = true,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredIata, setHoveredIata] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<Record<string, unknown> | null>(null);
  const styleUrlRef = useRef<string>("");

  // Load and patch style for French labels
  useEffect(() => {
    const url = isDark ? DARK_STYLE_URL : LIGHT_STYLE_URL;
    if (url === styleUrlRef.current && mapStyle) return;
    styleUrlRef.current = url;
    loadFrenchStyle(url).then(setMapStyle);
  }, [isDark]);

  // Find cheapest flight for "BEST" badge
  const cheapestIata = useMemo(() => {
    if (flights.length === 0) return null;
    return flights.reduce((min, f) => (f.price < min.price ? f : min), flights[0])
      .destination.iata;
  }, [flights]);

  const arcsGeoJSON = useMemo(() => {
    const features = flights.map((flight) => {
      const isActive =
        hoveredIata === flight.destination.iata ||
        selectedFlight?.destination.iata === flight.destination.iata;
      const color = getPriceColor(flight.price);
      return {
        type: "Feature" as const,
        properties: {
          color: isActive ? color : (isDark ? "rgba(255,255,255,0.15)" : "#94a3b8"),
          width: isActive ? 2.5 : 0.6,
          opacity: isActive ? 0.8 : 0.15,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: generateArc(
            origin.lng,
            origin.lat,
            flight.destination.lng,
            flight.destination.lat
          ),
        },
      };
    });
    return { type: "FeatureCollection" as const, features };
  }, [flights, origin, hoveredIata, selectedFlight, isDark]);

  const handleMapClick = useCallback(() => {
    onSelectFlight(null);
  }, [onSelectFlight]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        longitude: 10,
        latitude: 48,
        zoom: 3.5,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={(mapStyle as maplibregl.StyleSpecification) ?? (isDark ? DARK_STYLE_URL : LIGHT_STYLE_URL)}
      mapLib={maplibregl}
      attributionControl={false}
      onClick={handleMapClick}
    >
      <NavigationControl position="bottom-right" />

      {/* Arc lines */}
      <Source id="arcs" type="geojson" data={arcsGeoJSON}>
        <Layer
          id="arc-lines"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": ["get", "width"],
            "line-opacity": ["get", "opacity"],
          }}
          layout={{ "line-cap": "round", "line-join": "round" }}
        />
      </Source>

      {/* Origin marker with pulse ring */}
      <Marker longitude={origin.lng} latitude={origin.lat} anchor="center">
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Pulse ring */}
          <div
            className="origin-pulse"
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid #6366f1",
            }}
          />
          {/* Core dot */}
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#6366f1",
              border: "3px solid #fff",
              boxShadow: "0 0 16px rgba(99,102,241,0.6)",
              zIndex: 1,
            }}
          />
        </div>
      </Marker>

      {/* Destination markers */}
      {flights.map((flight) => {
        const color = getPriceColor(flight.price);
        const isSelected =
          selectedFlight?.destination.iata === flight.destination.iata;
        const isHovered = hoveredIata === flight.destination.iata;
        const active = isSelected || isHovered;
        const isBestDeal = flight.destination.iata === cheapestIata;

        return (
          <Marker
            key={flight.destination.iata}
            longitude={flight.destination.lng}
            latitude={flight.destination.lat}
            anchor="center"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                position: "relative",
                zIndex: active ? 10 : isBestDeal ? 5 : 1,
              }}
              onMouseEnter={() => setHoveredIata(flight.destination.iata)}
              onMouseLeave={() => setHoveredIata(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFlight(flight, e);
              }}
            >
              {/* BEST tag */}
              {isBestDeal && (
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#FFD700",
                    letterSpacing: "0.05em",
                    marginBottom: 2,
                    textTransform: "uppercase",
                    textShadow: "0 0 8px rgba(255,215,0,0.6)",
                  }}
                >
                  TOP
                </div>
              )}

              {/* Price pill */}
              <div
                className={isBestDeal && !active ? "best-deal-glow marker-float" : ""}
                style={{
                  background: color,
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  boxShadow: active
                    ? `0 0 20px ${color}80, 0 0 40px ${color}30`
                    : `0 0 12px ${color}40`,
                  transform: active ? "scale(1.25)" : isBestDeal ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                  border: active ? "2px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.2)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {formatPrice(flight.price)}
              </div>

              {/* Price tag label */}
              {(active || isBestDeal) && (
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color,
                    letterSpacing: "0.05em",
                    marginTop: 2,
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  {getPriceTag(flight.price)}
                </div>
              )}

              {/* City name on hover */}
              <div
                style={{
                  fontSize: 11,
                  color: isDark ? "#fff" : "#334155",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  opacity: active ? 1 : 0,
                  transition: "opacity 0.2s ease",
                  marginTop: 2,
                  fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  background: isDark ? "rgba(15,15,30,0.8)" : "rgba(255,255,255,0.9)",
                  padding: "2px 8px",
                  borderRadius: 8,
                  backdropFilter: "blur(8px)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                }}
              >
                {flight.destination.city}
              </div>
            </div>
          </Marker>
        );
      })}
    </MapGL>
  );
}
