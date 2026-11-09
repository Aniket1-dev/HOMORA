import { Link } from "react-router-dom";
import { Building2, Home, Users, Hotel, DoorOpen } from "lucide-react";

const categories = [
  { to: "/discover?category=hostel", label: "Hostels", note: "Student & working", icon: Hotel },
  { to: "/discover?category=pg", label: "PG & co-living", note: "Food, laundry, Wi-Fi", icon: Building2 },
  { to: "/discover?category=flat", label: "Flats & apartments", note: "1RK to 4BHK+", icon: Home },
  { to: "/discover?category=house", label: "Independent houses", note: "Families & groups", icon: DoorOpen },
  { to: "/discover?category=shared", label: "Shared rooms", note: "Bed in an occupied flat", icon: Users },
];

export default function CategoryRail() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {categories.map(({ to, label, note, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-3xl border border-border bg-card p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-soft sm:p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground/70 transition group-hover:bg-accent group-hover:text-accent-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-4 text-sm font-medium tracking-tight">{label}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{note}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}