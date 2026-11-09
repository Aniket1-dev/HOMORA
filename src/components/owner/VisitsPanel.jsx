import { useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusPill from "@/components/ui-bits/StatusPill";

export default function VisitsPanel({ visits, onRefresh }) {
  const [busy, setBusy] = useState("");

  const update = async (visit, status) => {
    setBusy(visit.id);
    await base44.entities.Visit.update(visit.id, { status });
    await onRefresh();
    setBusy("");
  };

  if (!visits.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
        No visit requests yet. Tenants can request a slot from any published listing.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((visit) => (
        <div key={visit.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">
                {visit.visitorName} ·{" "}
                <a href={`tel:${visit.phone}`} className="text-accent underline underline-offset-2">
                  {visit.phone}
                </a>
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">{visit.propertyTitle}</p>
              <p className="mt-1 text-[12px]">
                {visit.date} at {visit.time} · {visit.mode === "virtual" ? "Video call" : "In person"}
              </p>
              {visit.message && <p className="mt-2 text-[12px] text-muted-foreground">{visit.message}</p>}
            </div>
            <StatusPill status={visit.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["requested", "reschedule_requested"].includes(visit.status) && (
              <>
                <button
                  type="button"
                  onClick={() => update(visit, "confirmed")}
                  disabled={busy === visit.id}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => update(visit, "rejected")}
                  disabled={busy === visit.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
            {visit.status === "confirmed" && (
              <>
                <button
                  type="button"
                  onClick={() => update(visit, "completed")}
                  disabled={busy === visit.id}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
                >
                  Mark completed
                </button>
                <button
                  type="button"
                  onClick={() => update(visit, "no_show")}
                  disabled={busy === visit.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  No-show
                </button>
              </>
            )}
            {!["completed", "cancelled", "rejected", "no_show"].includes(visit.status) && (
              <button
                type="button"
                onClick={() => update(visit, "cancelled")}
                disabled={busy === visit.id}
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}