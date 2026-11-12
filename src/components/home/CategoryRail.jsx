import { Link } from "react-router-dom";
import { Building2, Home, Users, Hotel, DoorOpen, ArrowUpRight } from "lucide-react";

const categories = [
  { to: "/discover?category=hostel", label: "Hostels", note: "Student & working stays", icon: Hotel, tone: "lavender" },
  { to: "/discover?category=pg", label: "PG & co-living", note: "Easy, managed living", icon: Building2, tone: "mint" },
  { to: "/discover?category=flat", label: "Flats & apartments", note: "Your own space", icon: Home, tone: "peach" },
  { to: "/discover?category=house", label: "Independent homes", note: "Room for everyone", icon: DoorOpen, tone: "blue" },
  { to: "/discover?category=shared", label: "Shared rooms", note: "Good spaces, good people", icon: Users, tone: "rose" },
];

export default function CategoryRail() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="hm-section-kicker">FIND YOUR KIND OF SPACE</p><h2 className="mt-2 text-[23px] font-bold tracking-tight sm:text-[28px]">Explore by stay type</h2></div>
        <Link to="/discover" className="hidden items-center gap-1 text-[13px] font-semibold text-violet-700 sm:inline-flex">View all <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map(({ to, label, note, icon: Icon, tone }) => (
          <Link key={to} to={to} className="hm-category-card group">
            <span className={`hm-category-icon ${tone}`}><Icon className="h-5 w-5" /></span>
            <span className="mt-5 block text-[14px] font-bold tracking-tight text-slate-900">{label}</span>
            <span className="mt-1 block text-[11px] leading-5 text-slate-500">{note}</span>
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600" />
          </Link>
        ))}
      </div>
    </section>
  );
}
