import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const groups = [
  {
    title: "Discover",
    links: [
      { label: "Search homes", to: "/discover" },
      { label: "Nearby map", to: "/nearby" },
      { label: "Cost calculator", to: "/calculator" },
      { label: "Roommate matching", to: "/roommates" },
      { label: "Compare properties", to: "/compare" },
      { label: "Saved & activity", to: "/dashboard" },
      { label: "My profile", to: "/account" },
    ],
  },
];

const partnerUrl = (import.meta.env.VITE_PARTNER_APP_URL || "").trim();

export default function DiscoverFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 md:pb-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[15px] font-extrabold text-primary-foreground">h</span>
              <span className="text-[17px] font-bold tracking-tight">homora</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Accommodation discovery built around total cost, real distance and people who actually fit. Find your place. Find your people.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.title}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-foreground/80 transition hover:text-primary">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-3xl border border-border bg-secondary/60 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground/70">For property owners</p>
            <p className="mt-2 text-[15px] font-semibold leading-snug">HOMORA Partner is a separate workspace.</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Manage properties, inventory, enquiries, visits and bookings. Approved listings are shown to tenants in Discover.
            </p>
            {partnerUrl ? (
              <a href={partnerUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground">
                Open HOMORA Partner <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-4 text-xs font-medium text-muted-foreground">Partner portal link will be enabled when its production URL is configured.</p>
            )}
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verification on Homora confirms identity and authorization documents were reviewed — it is not a guarantee of property condition or owner conduct. Always visit a property before paying, never transfer money to an unverified account, and keep a written agreement.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">© {new Date().getFullYear()} Homora. Built for Indian cities.</p>
        </div>
      </div>
    </footer>
  );
}
