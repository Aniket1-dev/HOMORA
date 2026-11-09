import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarCheck, Heart, LogOut, Users } from "lucide-react";
import ProfileForm from "@/components/account/ProfileForm";
import { useAuth } from "@/lib/AuthContext";

const shortcuts = [
  { label: "Saved homes", to: "/dashboard?tab=saved", icon: Heart, note: "Listings you kept for later" },
  { label: "Bookings & visits", to: "/dashboard", icon: CalendarCheck, note: "Requests, references and status" },
  { label: "Roommate matches", to: "/roommates", icon: Users, note: "Compatibility and connections" },
];

export default function Account() {
  const { user, checkUserAuth, logout } = useAuth();
  const name = user?.display_name || user?.full_name || "Your profile";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your account</p>
      <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">{name}</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">{user?.email}</p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <ProfileForm user={user} onSaved={checkUserAuth} />

        <div className="space-y-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.note}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-[13px] font-medium text-muted-foreground transition hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}