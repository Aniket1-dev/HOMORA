import { STATUS_STYLES } from "@/lib/constants";

const fallback = "bg-secondary text-muted-foreground";

export default function StatusPill({ status, label }) {
  const key = String(status || "").toLowerCase().replace(/\s+/g, "_");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
        STATUS_STYLES[key] || fallback
      }`}
    >
      {(label || status || "—").replace(/_/g, " ")}
    </span>
  );
}