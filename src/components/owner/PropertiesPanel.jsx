import { useState } from "react";
import { Link } from "react-router-dom";
import { entities } from "@/services/entities";
import StatusPill from "@/components/ui-bits/StatusPill";
import { inr } from "@/lib/pricing";

const nextStatus = {
  draft: "pending",
  rejected: "pending",
  published: "draft",
};

const actionLabel = {
  draft: "Submit for review",
  rejected: "Resubmit",
  published: "Unpublish",
};

export default function PropertiesPanel({ properties, onRefresh, onManageRooms }) {
  const [busy, setBusy] = useState("");

  const changeStatus = async (property) => {
    const status = nextStatus[property.status];
    if (!status) return;
    setBusy(property.id);
    await entities.Property.update(property.id, { status });
    await onRefresh();
    setBusy("");
  };

  if (!properties.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="text-sm font-medium">No listings yet</p>
        <p className="mt-1 text-[13px] text-muted-foreground">Publish your first property to start receiving enquiries.</p>
        <Link
          to="/host/listings/new"
          className="mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          List a property
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {properties.map((property) => (
        <div key={property.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start gap-4">
            {property.images?.[0] ? (
              <img src={property.images[0]} alt="" className="h-20 w-28 rounded-xl object-cover" />
            ) : (
              <div className="flex h-20 w-28 items-center justify-center rounded-xl bg-secondary text-[11px] text-muted-foreground">
                No photo
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/property/${property.id}`} className="text-[14px] font-medium hover:underline">
                  {property.title}
                </Link>
                <StatusPill status={property.status} />
                {property.ownerVerified && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-400">
                    Verified owner
                  </span>
                )}
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {property.locality}, {property.city} · {inr(property.rent)} /{" "}
                {property.rentUnit === "bed" ? "bed / month" : "month"}
                {property.availableBeds ? ` · ${property.availableBeds} beds available` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/owner/listings/${property.id}/edit`}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onManageRooms(property)}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px]"
                >
                  Rooms & beds
                </button>
                {nextStatus[property.status] && (
                  <button
                    type="button"
                    onClick={() => changeStatus(property)}
                    disabled={busy === property.id}
                    className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
                  >
                    {actionLabel[property.status]}
                  </button>
                )}
                {property.status === "pending" && (
                  <span className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] text-muted-foreground">
                    Awaiting moderation
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-[12px] text-muted-foreground">
              <p>{property.views || 0} views</p>
              <p className="mt-1">{property.rating ? `${Number(property.rating).toFixed(1)} ★` : "No rating"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}