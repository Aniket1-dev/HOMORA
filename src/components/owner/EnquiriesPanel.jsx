import { useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusPill from "@/components/ui-bits/StatusPill";

const statuses = ["new", "contacted", "visit_scheduled", "converted", "closed"];

export default function EnquiriesPanel({ enquiries, onRefresh }) {
  const [notes, setNotes] = useState({});

  const setStatus = async (enquiry, status) => {
    await base44.entities.Enquiry.update(enquiry.id, { status });
    await onRefresh();
  };

  const saveNote = async (enquiry) => {
    await base44.entities.Enquiry.update(enquiry.id, { ownerNote: notes[enquiry.id] ?? enquiry.ownerNote ?? "" });
    await onRefresh();
  };

  if (!enquiries.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
        No enquiries yet. They arrive here as soon as a tenant messages one of your listings.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {enquiries.map((enquiry) => (
        <div key={enquiry.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">
                {enquiry.name} · <a href={`tel:${enquiry.phone}`} className="text-accent underline underline-offset-2">{enquiry.phone}</a>
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">{enquiry.propertyTitle}</p>
              {enquiry.message && <p className="mt-2 text-[13px] text-foreground/80">{enquiry.message}</p>}
              {enquiry.moveInDate && (
                <p className="mt-1 text-[12px] text-muted-foreground">Wants to move in {enquiry.moveInDate}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={enquiry.status} />
              <select
                value={enquiry.status || "new"}
                onChange={(e) => setStatus(enquiry, e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-[12px]"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={notes[enquiry.id] ?? enquiry.ownerNote ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [enquiry.id]: e.target.value }))}
              placeholder="Private note for your team"
              className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px]"
            />
            <button type="button" onClick={() => saveNote(enquiry)} className="rounded-lg border border-border px-3 py-1.5 text-[12px]">
              Save note
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}