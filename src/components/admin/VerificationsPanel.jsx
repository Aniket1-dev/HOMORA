import { useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusPill from "@/components/ui-bits/StatusPill";
import { OWNER_TYPES } from "@/lib/constants";

export default function VerificationsPanel({ verifications, onRefresh }) {
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState("");

  const setStatus = async (record, status) => {
    setBusy(record.id);
    await base44.entities.OwnerVerification.update(record.id, {
      status,
      adminNote: notes[record.id] ?? record.adminNote ?? "",
    });
    if (status === "approved") {
      const properties = await base44.entities.Property.filter({ ownerEmail: record.email }, { limit: 50 });
      for (const property of properties?.items || []) {
        await base44.entities.Property.update(property.id, { ownerVerified: true });
      }
    }
    await onRefresh();
    setBusy("");
  };

  if (!verifications.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
        No owner verification submissions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {verifications.map((record) => (
        <div key={record.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">
                {record.ownerName}
                {record.businessName ? ` · ${record.businessName}` : ""}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {OWNER_TYPES.find((type) => type.value === record.ownerType)?.label} · {record.city || "City not given"} ·{" "}
                {record.propertyCount || 1} properties · {record.phone}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Document: {record.documentType?.replace(/_/g, " ")} ·{" "}
                {record.documentUri ? "attached (private)" : "not attached"}
              </p>
            </div>
            <StatusPill status={record.status} />
          </div>

          {record.adminNote && (
            <p className="mt-2 rounded-lg bg-secondary/70 px-3 py-2 text-[12px] text-muted-foreground">
              Note: {record.adminNote}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatus(record, "approved")}
              disabled={busy === record.id}
              className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
            >
              Approve owner
            </button>
            <button
              type="button"
              onClick={() => setStatus(record, "rejected")}
              disabled={busy === record.id}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setStatus(record, "info_requested")}
              disabled={busy === record.id}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
            >
              Request more information
            </button>
            <input
              value={notes[record.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [record.id]: e.target.value }))}
              placeholder="Reviewer note shown to the owner"
              className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}