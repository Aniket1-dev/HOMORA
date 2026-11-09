import { inr, monthlyCost, moveInCost } from "@/lib/pricing";

export default function CostBreakdown({ property }) {
  const monthly = monthlyCost(property);
  const moveIn = moveInCost(property);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold">Estimated monthly</p>
          <p className="text-[20px] font-semibold tracking-tight">{inr(monthly.total)}</p>
        </div>
        <div className="mt-3 space-y-2">
          {monthly.parts.map((part) => (
            <div key={part.key} className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">{part.label}</span>
              <span className="font-medium">
                {inr(part.amount)}
                <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{part.note}</span>
              </span>
            </div>
          ))}
          {monthly.parts.length === 0 && (
            <p className="text-[13px] text-muted-foreground">Add pricing to see the full monthly cost.</p>
          )}
        </div>
        {monthly.variable > 0 && (
          <p className="mt-3 rounded-xl bg-secondary/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            {inr(monthly.variable)} of this is usage-based or estimated — it is not a confirmed bill.
          </p>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold">Move-in cost</p>
          <p className="text-[17px] font-semibold tracking-tight">{inr(moveIn.total)}</p>
        </div>
        <div className="mt-3 space-y-2">
          {moveIn.parts.map((part) => (
            <div key={part.key} className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">
                {part.label}
                {part.refundable && <span className="ml-1.5 text-[11px]">(refundable)</span>}
              </span>
              <span className="font-medium">{inr(part.amount)}</span>
            </div>
          ))}
        </div>
        {moveIn.refundable > 0 && (
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {inr(moveIn.refundable)} is a refundable deposit — {inr(moveIn.netOfDeposit)} is consumed on move-in.
          </p>
        )}
      </div>

      {(property.minStay || property.noticePeriod) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 text-[12px] text-muted-foreground">
          {property.minStay ? (
            <span>
              Minimum stay {property.minStay} {Number(property.minStay) === 1 ? "month" : "months"}
            </span>
          ) : null}
          {property.noticePeriod ? <span>Notice period {property.noticePeriod} days</span> : null}
        </div>
      )}
    </div>
  );
}