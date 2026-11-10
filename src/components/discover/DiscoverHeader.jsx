import { Link, NavLink } from "react-router-dom";
import { Heart, Search, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { label: "Discover", to: "/discover" },
  { label: "Nearby", to: "/nearby" },
  { label: "Roommates", to: "/roommates" },
  { label: "Compare", to: "/compare" },
  { label: "Activity", to: "/dashboard" },
];

export default function DiscoverHeader() {
  const { user, isAuthenticated } = useAuth();
  const initials = (user?.display_name || user?.full_name || user?.email || "H").trim().slice(0, 1).toUpperCase();
  const partnerUrl = (import.meta.env.VITE_PARTNER_APP_URL || "").trim();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass-panel">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[15px] font-extrabold text-primary-foreground">
            h
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[17px] font-bold tracking-tight">homora</span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Discover
            </span>
          </span>
        </Link>

        <nav className="ml-5 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {partnerUrl && <a href={partnerUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[12px] font-semibold text-foreground/80 transition hover:border-primary/40 hover:text-primary lg:inline-flex">List your property <ExternalLink className="h-3.5 w-3.5" /></a>}
          <Link
            to="/discover"
            aria-label="Search homes"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition hover:text-foreground sm:inline-flex"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard?tab=saved"
            aria-label="Saved homes"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition hover:text-foreground sm:inline-flex"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <span className="hidden sm:block">
            <ThemeToggle />
          </span>
          {isAuthenticated ? (
            <Link
              to="/account"
              className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 transition hover:shadow-soft"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[12px] font-bold text-secondary-foreground">
                {initials}
              </span>
              <span className="hidden text-[13px] font-medium sm:block">Profile</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="ml-1 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}