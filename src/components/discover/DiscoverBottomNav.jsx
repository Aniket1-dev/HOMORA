import { NavLink } from "react-router-dom";
import { Compass, Heart, House, MapPin, UserRound } from "lucide-react";

const items = [
  { label: "Home", to: "/", icon: House, end: true },
  { label: "Discover", to: "/discover", icon: Compass },
  { label: "Nearby", to: "/nearby", icon: MapPin },
  { label: "Saved", to: "/dashboard?tab=saved", icon: Heart },
  { label: "Account", to: "/account", icon: UserRound },
];

export default function DiscoverBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-8 w-12 place-items-center rounded-full transition ${
                      isActive ? "bg-secondary" : ""
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 1.9} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}