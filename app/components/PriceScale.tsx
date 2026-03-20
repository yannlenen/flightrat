"use client";

export default function PriceScale() {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Prix A/R</span>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ background: "#00FF87" }} />
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&lt;150€</span>
      </div>
      <div
        className="h-1.5 w-20 rounded-full"
        style={{
          background: "linear-gradient(to right, #00FF87, #FBBF24, #FF3B5C)",
        }}
      />
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ background: "#FF3B5C" }} />
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&gt;500€</span>
      </div>
    </div>
  );
}
