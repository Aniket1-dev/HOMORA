import { useState } from "react";
import { ChevronDown, GraduationCap, Briefcase, MapPin } from "lucide-react";
import MatchBars from "@/components/roommates/MatchBars";
import { inr } from "@/lib/pricing";
import { matchTone } from "@/lib/roommateMatch";

const occupationLabel = { student: "Student", professional: "Working professional", other: "Other" };

export default function RoommateCard({ profile, match, connection, onConnect, contactEmail }) {
  const [open, setOpen] = useState(false);
  const tone = matchTone(match.score);
  const initials = (profile.displayName || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold">
            {initials}
          </span>
          <div>
            <p className="text-[14px] font-medium">
              {profile.displayName}
              {profile.age ? <span className="font-normal text-muted-foreground">, {profile.age}</span> : null}
            </p>
            <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
              {profile.occupation === "student" ? (
                <GraduationCap className="h-3.5 w-3.5" />
              ) : (
                <Briefcase className="h-3.5 w-3.5" />
              )}
              {occupationLabel[profile.occupation] || "—"}
              {profile.organisation ? ` · ${profile.organisation}` : ""}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${tone.className}`}>
          {match.compatible ? `${match.score}% match` : "Incompatible"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {profile.locality ? `${profile.locality}, ` : ""}
          {profile.city}
        </span>
        <span>Budget {inr(profile.budgetMin || 0)}–{inr(profile.budgetMax || 0)}</span>
        {profile.moveInDate && (
          <span>
            From {new Date(profile.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {profile.bio && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{profile.bio}</p>}

      {match.blockers.length > 0 && (
        <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] text-red-700 dark:text-red-400">
          Hard mismatch: {match.blockers.join(" · ")}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {match.shared.slice(0, 3).map((label) => (
          <span key={label} className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] text-accent">
            Same {label.toLowerCase()}
          </span>
        ))}
        {match.differences.slice(0, 2).map((label) => (
          <span key={label} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
            Differs: {label.toLowerCase()}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
      >
        Why this score <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-border bg-background p-4">
          <MatchBars breakdown={match.breakdown} />
          <div className="mt-3 space-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {match.breakdown.slice(0, 5).map((item) => (
              <div key={item.key} className="flex justify-between gap-3">
                <span>{item.label}</span>
                <span>
                  {item.mine} · {item.theirs}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {connection?.status === "accepted" ? (
          <span className="rounded-xl bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-700 dark:text-emerald-400">
            Connected{contactEmail ? ` · ${contactEmail}` : ""}
          </span>
        ) : connection?.status === "pending" ? (
          <span className="rounded-xl bg-secondary px-3 py-2 text-[12px] text-muted-foreground">Request sent</span>
        ) : connection?.status === "rejected" ? (
          <span className="rounded-xl bg-secondary px-3 py-2 text-[12px] text-muted-foreground">Not accepted</span>
        ) : (
          <button
            type="button"
            onClick={() => onConnect(profile)}
            disabled={!match.compatible}
            className="rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send connection request
          </button>
        )}
        <span className="text-[11px] text-muted-foreground">Contact details unlock after mutual acceptance.</span>
      </div>
    </article>
  );
}