import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight, Building2, CalendarDays, SlidersHorizontal } from "lucide-react";

const categories = [
  { value: "", label: "All stays" },
  { value: "hostel", label: "Hostels" },
  { value: "pg", label: "PG & co-living" },
  { value: "flat", label: "Flats" },
  { value: "house", label: "Independent homes" },
  { value: "shared", label: "Shared rooms" },
];
const popular = ["Ghaziabad", "Delhi", "Noida", "Greater Noida", "Gurugram"];

export default function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const go = (q = query, c = category) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (c) params.set("category", c);
    if (budget) params.set("maxRent", budget);
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <section className="hm-hero relative overflow-hidden">
      <div className="hm-hero-glow" />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr]">
          <div className="max-w-2xl">
            <div className="hm-eyebrow"><span className="hm-live-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1 className="mt-6 text-[42px] font-extrabold leading-[1.04] tracking-[-.055em] sm:text-[58px] lg:text-[68px]">
              A place to stay.<br /><span className="hm-gradient-text">A place to belong.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600 sm:text-[17px]">
              Find verified hostels, PGs, flats and rooms that fit your life — and your monthly budget.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Verified stays", "Transparent pricing", "Real availability"].map((item) => (
                <span key={item} className="hm-trust-chip"><span>✓</span>{item}</span>
              ))}
            </div>
          </div>
          <div className="hm-search-wrap">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[18px] font-bold tracking-tight text-slate-900">Find your stay</p><p className="mt-1 text-[12px] text-slate-500">A few details. Better matches.</p></div>
              <span className="hm-search-icon"><Search className="h-5 w-5" /></span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); go(); }} className="mt-6 space-y-3">
              <label className="hm-field">
                <MapPin className="h-5 w-5 shrink-0 text-violet-600" />
                <span className="min-w-0 flex-1"><span className="hm-field-label">DESTINATION</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City, area, college or landmark" aria-label="Destination" /></span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="hm-field">
                  <Building2 className="h-5 w-5 shrink-0 text-violet-600" />
                  <span className="min-w-0 flex-1"><span className="hm-field-label">STAY TYPE</span><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Stay type">{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></span>
                </label>
                <label className="hm-field">
                  <SlidersHorizontal className="h-5 w-5 shrink-0 text-violet-600" />
                  <span className="min-w-0 flex-1"><span className="hm-field-label">MONTHLY BUDGET</span><select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Maximum monthly budget"><option value="">Any budget</option><option value="5000">Up to ₹5,000</option><option value="8000">Up to ₹8,000</option><option value="12000">Up to ₹12,000</option><option value="20000">Up to ₹20,000</option><option value="30000">Up to ₹30,000</option></select></span>
                </label>
              </div>
              <button type="submit" className="hm-search-button"><Search className="h-4 w-4" /> Explore stays <ArrowRight className="ml-auto h-4 w-4" /></button>
            </form>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Popular destinations</p>
              <div className="flex flex-wrap gap-2">{popular.map((place) => <button type="button" key={place} onClick={() => { setQuery(place); go(place); }} className="hm-place-chip">{place}</button>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
