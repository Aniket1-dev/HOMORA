import { Link } from "react-router-dom";
import { inr } from "@/lib/pricing";

const tones = {
  good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  bad: "bg-destructive/10 text-destructive",
};

export default function CostSummary({ recurring, moveIn, firstYear, perDay, deposit, months, verdict }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Estimated all-in, per month
      </p>
      <p className="mt-1.5 text-[32px] font-bold leading-none tracking-tight">{inr(recurring)}</p>
      <p className="mt-1.5 text-[12px] text-muted-foreground">≈ {inr(perDay)} per day · includes every recurring line</p>

      {verdict && (
        <p className={`mt-4 rounded-xl px-3 py-2 text-[12px] font-semibold ${tones[verdict.tone]}`}>{verdict.label}</p>
      )}

      <div className="mt-5 space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">To move in</span>
          <span className="font-semibold">{inr(moveIn)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Of which refundable deposit</span>
          <span className="font-medium">{inr(deposit)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Over {months} months</span>
          <span className="font-semibold">{inr(firstYear)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Net of refundable deposit</span>
          <span className="font-medium">{inr(firstYear - deposit)}</span>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Electricity, water and food are estimates. Ask the owner for the last three bills before you commit.
      </p>

      <Link
        to="/discover"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground"
      >
        Find homes in this budget
      </Link>
    </div>
  );
}