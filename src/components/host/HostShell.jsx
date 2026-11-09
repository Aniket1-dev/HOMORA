import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Building2, ExternalLink, LayoutDashboard, Menu, PlusCircle, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { initTheme } from "@/lib/theme";

const nav = [
  { to: "/host", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/host/listings/new", label: "Add a listing", icon: PlusCircle },
  { to: "/host/verification", label: "Verification", icon: ShieldCheck },
  { to: "/host/admin", label: "Moderation", icon: ShieldAlert },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Building2 className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[16px] font-bold tracking-tight">homora</span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Host console
        </span>
      </span>
    </div>
  );
}

export default function HostShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <NavItems />
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Homora Discover
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle console navigation"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </header>

        {open && (
          <div className="border-b border-border bg-card px-4 py-4 lg:hidden">
            <NavItems onNavigate={() => setOpen(false)} />
            <Link to="/" className="mt-2 block px-3 py-2 text-[12px] text-muted-foreground">
              Open Homora Discover →
            </Link>
          </div>
        )}

        <main key={pathname} className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}