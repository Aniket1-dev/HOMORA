const selectClass =
  "mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-[13px] outline-none focus:border-primary";

const categories = [
  { value: "", label: "Any type" },
  { value: "hostel", label: "Hostel" },
  { value: "pg", label: "PG / Co-living" },
  { value: "flat", label: "Flat" },
  { value: "house", label: "House" },
  { value: "shared", label: "Shared room" },
];

export default function NearbyControls({ cities, landmarks, city, onCity, category, onCategory, maxRent, onMaxRent, anchorId, onAnchor, radius, onRadius }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">City</span>
          <select value={city} onChange={(event) => onCity(event.target.value)} className={selectClass}>
            <option value="">All cities</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Type</span>
          <select value={category} onChange={(event) => onCategory(event.target.value)} className={selectClass}>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Distance from
          </span>
          <select value={anchorId} onChange={(event) => onAnchor(event.target.value)} className={selectClass}>
            <option value="centre">City centre / all listings</option>
            {landmarks.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Within {anchorId === "centre" ? "" : `${radius} km`}
          </span>
          <select
            value={radius}
            onChange={(event) => onRadius(Number(event.target.value))}
            disabled={anchorId === "centre"}
            className={`${selectClass} disabled:opacity-50`}
          >
            {[3, 5, 8, 12, 20, 35].map((value) => (
              <option key={value} value={value}>
                {value} km
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>Max rent</span>
          <span className="text-foreground">₹{Number(maxRent).toLocaleString("en-IN")}</span>
        </span>
        <input
          type="range"
          min={3000}
          max={80000}
          step={1000}
          value={maxRent}
          onChange={(event) => onMaxRent(Number(event.target.value))}
          className="mt-2 w-full accent-[hsl(var(--primary))]"
        />
      </label>
    </div>
  );
}