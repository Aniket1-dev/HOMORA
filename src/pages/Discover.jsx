import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { entities } from "@/services/entities";
import PropertyCard from "@/components/PropertyCard";
import FilterPanel from "@/components/discover/FilterPanel";
import EmptyState from "@/components/ui-bits/EmptyState";
import { addRecentSearch, getRecentSearches } from "@/lib/guestStore";
import { CITIES } from "@/lib/constants";

const emptyFilters = {
  city: "",
  minRent: "",
  maxRent: "",
  maxDeposit: "",
  category: "",
  gender: "",
  sharing: "",
  furnishing: "",
  ac: false,
  foodIncluded: false,
  attachedBathroom: false,
  petFriendly: false,
  amenities: [],
};

const sorts = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest first" },
  { value: "rent_low", label: "Rent: low to high" },
  { value: "rent_high", label: "Rent: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";

  const [term, setTerm] = useState(query);
  const [filters, setFilters] = useState({ ...emptyFilters, category: urlCategory });
  const [sort, setSort] = useState("relevance");
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState(CITIES);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setTerm(query);
    setFilters((prev) => ({ ...prev, category: urlCategory }));
  }, [query, urlCategory]);

  useEffect(() => {
    setRecent(getRecentSearches());
    entities.Property.list({ distinct: "city" })
      .then((res) => {
        const values = (res?.items || []).filter(Boolean);
        if (values.length) setCities(values);
      })
      .catch(() => setCities(CITIES));
  }, []);

  const buildQuery = () => {
    const q = { status: "published" };
    if (query.trim()) {
      const rx = { $regex: query.trim(), $options: "i" };
      q.$or = [{ title: rx }, { city: rx }, { locality: rx }, { landmark: rx }, { pincode: rx }, { subtype: rx }];
    }
    if (filters.category) q.category = filters.category;
    if (filters.city) q.city = filters.city;
    if (filters.gender) q.gender = filters.gender;
    if (filters.sharing) q.sharing = filters.sharing;
    if (filters.furnishing) q.furnishing = filters.furnishing;
    if (filters.ac) q.ac = true;
    if (filters.foodIncluded) q.foodIncluded = true;
    if (filters.attachedBathroom) q.attachedBathroom = true;
    if (filters.petFriendly) q.petFriendly = true;
    if (filters.amenities.length) q.amenities = { $all: filters.amenities };
    if (filters.minRent) q.rent = { ...(q.rent || {}), $gte: Number(filters.minRent) };
    if (filters.maxRent) q.rent = { ...(q.rent || {}), $lte: Number(filters.maxRent) };
    if (filters.maxDeposit) q.deposit = { $lte: Number(filters.maxDeposit) };
    return q;
  };

  const sortValue = { newest: "-created_date", rent_low: "rent", rent_high: "-rent", rating: "-rating" }[sort];

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      const q = buildQuery();
      const page = await entities.Property.filter(q, { sort: sortValue, limit: 9 });
      if (!active) return;
      setItems(page?.items || []);
      setCursor(page?.next_cursor || null);
      setHasMore(!!page?.has_more);
      setLoading(false);
      entities.Property.count(q).then((value) => active && setTotal(value)).catch(() => {});
    };
    run();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, JSON.stringify(filters)]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    const page = await entities.Property.filter(buildQuery(), { sort: sortValue, limit: 9, cursor });
    setItems((prev) => [...prev, ...(page?.items || [])]);
    setCursor(page?.next_cursor || null);
    setHasMore(!!page?.has_more);
    setLoading(false);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    addRecentSearch(term);
    setRecent(getRecentSearches());
    const next = new URLSearchParams(searchParams);
    if (term.trim()) next.set("q", term.trim());
    else next.delete("q");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
            {query ? `Accommodation for “${query}”` : "Browse accommodation"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {total === null ? "Searching published listings…" : `${total} published listing${total === 1 ? "" : "s"} match your filters`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-[13px] outline-none"
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </div>

      <form onSubmit={submitSearch} className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5">
        <Search className="ml-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="City, locality, college, metro station or PIN code"
          aria-label="Search listings"
          className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        {term && (
          <button type="button" onClick={() => setTerm("")} aria-label="Clear search" className="p-1 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Recent</span>
          {recent.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("q", item);
                setSearchParams(next);
              }}
              className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-5">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              cities={cities}
              onReset={() => setFilters({ ...emptyFilters })}
            />
          </div>
        </aside>

        <div>
          {loading && items.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((key) => (
                <div key={key} className="h-[320px] animate-pulse rounded-3xl border border-border bg-card" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No listings match those filters"
              body="Try widening your budget, clearing a filter, or searching a neighbouring locality."
              action={
                <button
                  type="button"
                  onClick={() => setFilters({ ...emptyFilters })}
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? "Loading…" : "Load more listings"}
                  </button>
                </div>
              )}
              <p className="mt-8 text-center text-[12px] text-muted-foreground">
                Comparing homes? Add up to four to the{" "}
                <Link to="/compare" className="underline underline-offset-2">
                  comparison view
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}