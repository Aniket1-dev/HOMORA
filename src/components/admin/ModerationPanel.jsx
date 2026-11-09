import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StatusPill from "@/components/ui-bits/StatusPill";
import { inr } from "@/lib/pricing";

const filters = [
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "all", label: "All" },
];

export default function ModerationPanel({ properties, onRefresh }) {
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState("");
  const [notes, setNotes] = useState({});

  const visible = filter === "all" ? properties : properties.filter((property) => property.status === filter);

  const setStatus = async (property, status) => {
    setBusy(property.id);
    await base44.entities.Property.update(property.id, { status });
    await onRefresh();
    setBusy("");
  };

  const verifyProperty = async (property, value) => {
    setBusy(property.id);
    await base44.entities.Property.update(property.id, {
      propertyVerified: value,
      propertyVerificationNote: notes[property.id] || "",
    });
    await onRefresh();
    setBusy("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
              filter === item.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
            Nothing in this queue.
          </p>
        )}
        {visible.map((property) => (
          <div key={property.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                {property.images?.[0] ? (
                  <img src={property.images[0]} alt="" className="h-16 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="h-16 w-20 rounded-lg bg-secondary" />
                )}
                <div className="min-w-0">
                  <Link to={`/property/${property.id}`} className="text-[13px] font-medium hover:underline">
                    {property.title}
                  </Link>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {property.locality}, {property.city} · {inr(property.rent)} · {property.ownerName} ·{" "}
                    {property.ownerPhone}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Owner {property.ownerVerified ? "verified" : "unverified"} · property proof{" "}
                    {property.propertyVerified ? "reviewed" : "pending"} · {property.images?.length || 0} photos
                  </p>
                </div>
              </div>
              <StatusPill status={property.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {property.status !== "published" && (
                <button
                  type="button"
                  onClick={() => setStatus(property, "published")}
                  disabled={busy === property.id}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
                >
                  Approve & publish
                </button>
              )}
              {property.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => setStatus(property, "rejected")}
                  disabled={busy === property.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {property.status === "published" && (
                <button
                  type="button"
                  onClick={() => setStatus(property, "suspended")}
                  disabled={busy === property.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-destructive disabled:opacity-50"
                >
                  Suspend
                </button>
              )}
              <button
                type="button"
                onClick={() => verifyProperty(property, !property.propertyVerified)}
                disabled={busy === property.id}
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
              >
                {property.propertyVerified ? "Clear ownership proof" : "Mark ownership verified"}
              </button>
              <input
                value={notes[property.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [property.id]: e.target.value }))}
                placeholder="Moderation note"
                className="min-w-[180px] flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}