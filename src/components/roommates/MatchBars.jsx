export default function MatchBars({ breakdown }) {
  return (
    <div className="space-y-2.5">
      {breakdown.map((item) => (
        <div key={item.key}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {item.label} <span className="text-[10px] opacity-70">· {item.weight}%</span>
            </span>
            <span className="font-medium">{item.value}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full ${item.value >= 80 ? "bg-accent" : item.value >= 55 ? "bg-amber-500" : "bg-red-400"}`}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
