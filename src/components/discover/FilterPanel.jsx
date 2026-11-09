import { AMENITIES, CITIES, CATEGORY_OPTIONS } from "@/lib/constants";

const Field = ({ label, children }) => (
  <div>
    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    {children}
  </div>
);

const selectClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-accent";

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[13px]">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-border accent-accent"
    />
    <span className="text-foreground/80">{label}</span>
  </label>
);

const toggles = [
  { key: "ac", label: "Air conditioning" },
  { key: "foodIncluded", label: "Food included" },
  { key: "attachedBathroom", label: "Attached bathroom" },
  { key: "petFriendly", label: "Pet friendly" },
];

export default function FilterPanel({ filters, setFilters, onReset, cities = CITIES }) {
  const patch = (update) => setFilters((prev) => ({ ...prev, ...update }));
  const toggleAmenity = (amenity) =>
    patch({
      amenities: filters.amenities.includes(amenity)
        ? filters.amenities.filter((a) => a !== amenity)
        : [...filters.amenities, amenity],
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Filters</p>
        <button type="button" onClick={onReset} className="text-[12px] text-muted-foreground hover:text-foreground">
          Clear all
        </button>
      </div>

      <Field label="City">
        <select value={filters.city} onChange={(e) => patch({ city: e.target.value })} className={selectClass}>
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Monthly rent (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={filters.minRent}
            onChange={(e) => patch({ minRent: e.target.value })}
            className={selectClass}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={filters.maxRent}
            onChange={(e) => patch({ maxRent: e.target.value })}
            className={selectClass}
          />
        </div>
      </Field>

      <Field label="Max deposit (₹)">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Any"
          value={filters.maxDeposit}
          onChange={(e) => patch({ maxDeposit: e.target.value })}
          className={selectClass}
        />
      </Field>

      <Field label="Accommodation">
        <select value={filters.category} onChange={(e) => patch({ category: e.target.value })} className={selectClass}>
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Suitable for">
        <select value={filters.gender} onChange={(e) => patch({ gender: e.target.value })} className={selectClass}>
          <option value="">Anyone</option>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
          <option value="coed">Co-living</option>
          <option value="family">Family</option>
        </select>
      </Field>

      <Field label="Sharing">
        <select value={filters.sharing} onChange={(e) => patch({ sharing: e.target.value })} className={selectClass}>
          <option value="">Any</option>
          <option value="single">Single occupancy</option>
          <option value="double">Double sharing</option>
          <option value="triple">Triple sharing</option>
          <option value="four">Four sharing</option>
        </select>
      </Field>

      <Field label="Furnishing">
        <select
          value={filters.furnishing}
          onChange={(e) => patch({ furnishing: e.target.value })}
          className={selectClass}
        >
          <option value="">Any</option>
          <option value="furnished">Furnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </Field>

      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Must have</p>
        {toggles.map((toggle) => (
          <Toggle
            key={toggle.key}
            label={toggle.label}
            checked={filters[toggle.key]}
            onChange={(value) => patch({ [toggle.key]: value })}
          />
        ))}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Amenities</p>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.slice(0, 14).map((amenity) => {
            const active = filters.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}