import { ShieldCheck, Receipt, Route, FileCheck2 } from "lucide-react";
import { inr } from "@/lib/pricing";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Owner verification you can inspect",
    body: "Identity and authorization documents are reviewed separately from email or phone checks. The badge states exactly what was verified.",
  },
  {
    icon: Receipt,
    title: "Total cost before you visit",
    body: "Rent, electricity, water, maintenance, food and parking shown together — with variable charges clearly marked as estimates.",
  },
  {
    icon: Route,
    title: "Distance that means something",
    body: "Commute estimates to your college, office or metro station, labelled as estimates rather than live traffic data.",
  },
  {
    icon: FileCheck2,
    title: "A record of every step",
    body: "Visits, booking requests and agreements stay attached to the listing, so nothing important lives only in a chat.",
  },
];

const example = [
  { label: "Advertised rent", value: 13500, note: "Fixed" },
  { label: "Electricity", value: 900, note: "Estimated" },
  { label: "Food plan", value: 4500, note: "Fixed" },
  { label: "Wi-Fi", value: 300, note: "Fixed" },
];

export default function TrustSection() {
  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">The HOMORA difference</p>
            <h2 className="mt-3 max-w-lg text-balance text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
              Clarity at every step of finding your next home.
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {pillars.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <Icon className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">{title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-border bg-background p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Illustrative monthly cost breakdown
            </p>
            <div className="mt-4 space-y-3">
              {example.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">
                    {inr(row.value)}
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">{row.note}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-medium">Estimated monthly</span>
              <span className="text-lg font-semibold tracking-tight">{inr(19200)}</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Illustrative breakdown. Estimates are clearly separated from confirmed charges on every listing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}