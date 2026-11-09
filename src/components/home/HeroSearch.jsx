import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight } from "lucide-react";

const chips = [
  { label: "PG near KIET", query: "KIET", category: "pg" },
  { label: "Girls hostel, Noida", query: "Noida", category: "hostel" },
  { label: "2BHK in Bengaluru", query: "Bengaluru", category: "flat" },
  { label: "Co-living, Gurugram", query: "Gurugram", category: "pg" },
];

const categories = [
  { value: "", label: "Any accommodation" },
  { value: "hostel", label: "Hostel" },
  { value: "pg", label: "PG / Co-living" },
  { value: "flat", label: "Flat / Apartment" },
  { value: "house", label: "Independent house" },
  { value: "shared", label: "Shared room" },
];

export default function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const go = (q = query, c = category) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (c) params.set("category", c);
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 420px at 18% -10%, hsl(var(--accent) / 0.16), transparent 62%), radial-gradient(720px 380px at 88% 6%, hsl(var(--foreground) / 0.09), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Hostels · PGs · Flats · Roommates
          </span>

          <h1 className="mt-6 text-balance text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            Find your place.
            <br />
            Find your <span className="serif-accent font-normal">people</span>.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Real listings with the full monthly cost, honest distances to your college or office, and roommates
            matched on how you actually live.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className="mx-auto mt-9 flex flex-col gap-2 rounded-[22px] border border-border bg-card p-2 shadow-soft sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, locality, college or metro station"
                aria-label="Search city, locality, college or metro"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Accommodation type"
              className="rounded-2xl bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none sm:w-48"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => go(chip.query, chip.category)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition hover:text-foreground hover:shadow-soft"
              >
                {chip.label} <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
