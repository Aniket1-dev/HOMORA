import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sampleBars = [
  { label: "Budget", value: 96 },
  { label: "Sleep schedule", value: 88 },
  { label: "Cleanliness", value: 92 },
  { label: "Food habits", value: 74 },
];

export default function RoommateSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 rounded-[32px] border border-border bg-card p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Roommate matching</p>
          <h2 className="mt-3 text-balance text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
            Compatibility you can read, not a mystery score.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Answer a short lifestyle questionnaire. We apply hard filters first — smoking, pets, budget, move-in
            window — then score the rest on weightings you can see, with the reasons behind every match.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>· Budget 20% · Lifestyle 20% · Location 15%</li>
            <li>· Mutual acceptance before anyone can message</li>
            <li>· Contact details stay private until you both agree</li>
          </ul>
          <Link
            to="/roommates"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Build my roommate profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[26px] border border-border bg-background p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                AR
              </span>
              <div>
                <p className="text-sm font-medium">Aarav, 22</p>
                <p className="text-[12px] text-muted-foreground">B.Tech · KIET · Non-smoker</p>
              </div>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-[12px] font-medium text-accent">91% match</span>
          </div>

          <div className="mt-6 space-y-3.5">
            {sampleBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="font-medium">{bar.value}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${bar.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-2xl bg-secondary/70 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
            Shared: early riser · vegetarian kitchen · quiet study hours. Differ: guest frequency.
          </p>
        </div>
      </div>
    </section>
  );
}