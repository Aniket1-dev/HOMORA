import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Copy, Trash2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui-bits/EmptyState";
import { inr, monthlyCost, moveInCost } from "@/lib/pricing";
import { CATEGORY_LABELS } from "@/lib/constants";
import { clearCompare, getCompare, toggleCompare } from "@/lib/guestStore";

const rows = [
  { label: "Category", get: (p) => CATEGORY_LABELS[p.category] || "—" },
  { label: "Advertised rent", get: (p) => inr(p.rent), best: "low", raw: (p) => p.rent },
  { label: "Estimated monthly", get: (p) => inr(monthlyCost(p).total), best: "low", raw: (p) => monthlyCost(p).total },
  { label: "Move-in cost", get: (p) => inr(moveInCost(p).total), best: "low", raw: (p) => moveInCost(p).total },
  { label: "Security deposit", get: (p) => inr(p.deposit), best: "low", raw: (p) => p.deposit },
  { label: "Brokerage", get: (p) => (p.brokerage ? inr(p.brokerage) : "None") },
  { label: "Furnishing", get: (p) => p.furnishing || "—" },
  { label: "Bedrooms", get: (p) => p.bedrooms || "—" },
  { label: "Bathrooms", get: (p) => p.bathrooms || "—" },
  { label: "Carpet area", get: (p) => (p.carpetArea ? `${p.carpetArea} sq ft` : "—") },
  { label: "Food", get: (p) => (p.foodIncluded ? "Included" : p.foodCharges ? "Optional add-on" : "Not included") },
  { label: "Electricity", get: (p) => (p.electricity ? `≈ ${inr(p.electricity)} / mo` : "Separate") },
  { label: "Parking", get: (p) => (p.parkingCharges ? inr(p.parkingCharges) : p.parkingCapacity ? "Included" : "None") },
  { label: "Rating", get: (p) => (p.rating ? `${Number(p.rating).toFixed(1)} / 5` : "No reviews"), best: "high", raw: (p) => p.rating || 0 },
  { label: "Owner verified", get: (p) => (p.ownerVerified ? "Yes" : "No") },
  { label: "Amenities", get: (p) => (p.amenities || []).slice(0, 6).join(", ") || "—" },
];

export default function Compare() {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get("ids");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const ids = idsParam ? idsParam.split(",").filter(Boolean) : getCompare();

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!ids.length) {
      setItems([]);
      setLoading(false);
      return;
    }
    base44.entities.Property.filter({ id: { $in: ids } }, { limit: 4 })
      .then((page) => {
        if (!active) return;
        const order = new Map(ids.map((id, index) => [id, index]));
        const sorted = (page?.items || []).sort((a, b) => (order.get(a.id) || 0) - (order.get(b.id) || 0));
        setItems(sorted);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam]);

  const remove = (id) => {
    toggleCompare(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const share = async () => {
    const url = `${window.location.origin}/compare?ids=${items.map((item) => item.id).join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10"><div className="h-64 animate-pulse rounded-3xl border border-border bg-card" /></div>;
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Nothing to compare yet"
          body="Add up to four homes from any listing page or search result, then see their true monthly cost, deposits and amenities side by side."
          action={
            <Link to="/discover" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Browse listings
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Compare homes</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {items.length} of 4 selected. Best values in each row are highlighted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px]"
          >
            <Copy className="h-3.5 w-3.5" /> {copied ? "Link copied" : "Share"}
          </button>
          <button
            type="button"
            onClick={() => {
              clearCompare();
              setItems([]);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-40 border-b border-border px-4 py-4 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Property
              </th>
              {items.map((item) => (
                <th key={item.id} className="border-b border-l border-border px-4 py-4 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/property/${item.id}`} className="font-medium leading-snug hover:underline">
                      {item.title}
                    </Link>
                    <button type="button" onClick={() => remove(item.id)} aria-label="Remove" className="text-muted-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] font-normal text-muted-foreground">
                    {item.locality}, {item.city}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = items.map((item) => (row.raw ? row.raw(item) : null));
              const best =
                row.raw && row.best === "low"
                  ? Math.min(...values.filter((v) => v > 0))
                  : row.raw && row.best === "high"
                    ? Math.max(...values)
                    : null;
              const allSame = new Set(items.map((item) => row.get(item))).size === 1;

              return (
                <tr key={row.label} className={allSame ? "" : "bg-accent/[0.03]"}>
                  <td className="border-b border-border px-4 py-3 align-top text-[12px] text-muted-foreground">
                    {row.label}
                  </td>
                  {items.map((item) => {
                    const isBest = best !== null && row.raw(item) === best && !allSame;
                    return (
                      <td
                        key={item.id}
                        className={`border-b border-l border-border px-4 py-3 align-top ${
                          isBest ? "font-medium text-accent" : "text-foreground/85"
                        }`}
                      >
                        {row.get(item)}
                        {isBest && <span className="ml-1.5 text-[10px] uppercase tracking-wider">best</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Estimated monthly costs include usage-based components and are not confirmed bills. Rows that differ between
        homes are shaded.
      </p>
    </div>
  );
}