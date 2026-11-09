import { useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusPill from "@/components/ui-bits/StatusPill";

const statuses = ["open", "investigating", "resolved", "dismissed"];

export default function ReportsPanel({ reports, onRefresh }) {
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState("");

  const update = async (report, patch) => {
    setBusy(report.id);
    await base44.entities.Report.update(report.id, { ...patch, adminNote: notes[report.id] ?? report.adminNote ?? "" });
    await onRefresh();
    setBusy("");
  };

  const suspendTarget = async (report) => {
    if (report.targetType === "property") {
      await base44.entities.Property.update(report.targetId, { status: "suspended" });
    }
    await update(report, { status: "resolved" });
  };

  if (!reports.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
        No reports in the queue.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">
                {report.reason}
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {report.targetType}
                </span>
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">{report.targetTitle || report.targetId}</p>
              {report.details && <p className="mt-2 text-[13px] text-foreground/80">{report.details}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Reported by {report.reporterName || "anonymous"} · priority {report.priority || "medium"}
              </p>
            </div>
            <StatusPill status={report.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={report.status || "open"}
              onChange={(e) => update(report, { status: e.target.value })}
              disabled={busy === report.id}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {report.targetType === "property" && (
              <button
                type="button"
                onClick={() => suspendTarget(report)}
                disabled={busy === report.id}
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-destructive disabled:opacity-50"
              >
                Suspend listing & resolve
              </button>
            )}
            <input
              value={notes[report.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
              placeholder="Investigation note"
              className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px]"
            />
            <button
              type="button"
              onClick={() => update(report, {})}
              disabled={busy === report.id}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
            >
              Save note
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}