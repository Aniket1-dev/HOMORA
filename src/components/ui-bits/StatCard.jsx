export default function StatCard({ label, value, hint, tone = "default" }) {
  const toneClass = { default: "", accent: "text-accent", warn: "text-amber-600" }[tone] || "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-[24px] font-semibold leading-none tracking-tight ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}