import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BadgeCheck, MapPin, ShieldCheck, Sparkles, ExternalLink, X, CheckCircle2 } from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryRail from "@/components/home/CategoryRail";
import RoommateSpotlight from "@/components/home/RoommateSpotlight";
import TrustSection from "@/components/home/TrustSection";
import PropertyCard from "@/components/PropertyCard";
import { entities } from "@/services/entities";
import { supabase } from "@/lib/supabase/client";

const partnerUrl = (import.meta.env.VITE_PARTNER_APP_URL || "").trim();
const cities = [
  { name: "Delhi", detail: "Capital living", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=85" },
  { name: "Noida", detail: "Work & campus life", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=85" },
  { name: "Ghaziabad", detail: "Close to everything", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85" },
  { name: "Gurugram", detail: "A city that moves", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85" },
];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("homora:welcome-seen")) return;
    const timer = window.setTimeout(() => setShowWelcome(true), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  const closeWelcome = () => {
    sessionStorage.setItem("homora:welcome-seen", "1");
    setShowWelcome(false);
  };

  useEffect(() => {
    let active = true;
    const loadPublished = async () => {
      try {
        const page = await entities.Property.filter({ status: "published" }, { sort: "-created_date", limit: 6 });
        if (active) { setProperties(page?.items || []); setLoadError(""); }
      } catch (error) {
        if (active) setLoadError(error.message || "Published listings could not be loaded.");
      } finally { if (active) setLoading(false); }
    };
    loadPublished();
    const channel = supabase.channel("discover-home-published-properties")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, loadPublished).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="hm-home">
      <HeroSearch />
      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8"><div className="hm-promo-ribbon"><div className="hm-promo-copy"><span className="hm-promo-label">HOMORA PICKS · NORTH INDIA</span><h2>Moving for college or work?</h2><p>Find a place close to your campus, office and everyday essentials.</p><Link to="/discover?q=Ghaziabad" className="hm-promo-link">Explore nearby stays <ArrowRight className="h-4 w-4" /></Link></div><div className="hm-promo-photo" role="img" aria-label="Bright, welcoming modern apartment interior" /></div></section>
      <div className="hm-assurance-strip"><div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div><ShieldCheck /><span><b>Verified listings</b><small>Reviewed before they go live</small></span></div>
        <div><BadgeCheck /><span><b>Know the full cost</b><small>Rent and deposit, clearly shown</small></span></div>
        <div><Sparkles /><span><b>Made for real life</b><small>Find a stay that fits your routine</small></span></div>
      </div></div>

      <CategoryRail />

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="hm-section-kicker">HANDPICKED FROM HOMORA</p><h2 className="mt-2 text-[25px] font-bold tracking-tight sm:text-[32px]">Stays you’ll feel good coming home to</h2><p className="mt-2 text-[13px] text-slate-500">Live properties published by verified HOMORA partners.</p></div>
          <Link to="/discover" className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2.5 text-[12px] font-bold text-violet-700 transition hover:border-violet-400 hover:shadow-sm">Explore all stays <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map((item) => <div key={item} className="h-[320px] animate-pulse rounded-3xl bg-slate-100" />)}</div>
        : loadError ? <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>
        : properties.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div>
        : <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600"><MapPin className="h-5 w-5" /></div><h3 className="mt-4 text-lg font-bold">Your next stay is getting ready</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">New properties approved by HOMORA will appear here automatically. Explore destinations or check back soon.</p><Link to="/discover" className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white">Explore listings <ArrowRight className="h-4 w-4" /></Link></div>}
      </section>

      <section className="hm-destinations">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4"><div><p className="hm-section-kicker">WHERE TO NEXT?</p><h2 className="mt-2 text-[25px] font-bold tracking-tight sm:text-[32px]">Popular places to call home</h2><p className="mt-2 text-sm text-slate-500">Explore neighbourhoods that keep you close to what matters.</p></div><span className="hidden text-xs font-semibold text-slate-400 sm:block">MORE CITIES COMING SOON</span></div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cities.map((city) => <Link key={city.name} to={`/discover?q=${encodeURIComponent(city.name)}`} className="hm-city-card" style={{ backgroundImage: `linear-gradient(180deg,rgba(15,12,30,.02) 20%,rgba(15,12,30,.76) 100%),url("${city.image}")` }}><span><b>{city.name}</b><small>{city.detail}</small></span><ArrowUpRight className="h-5 w-5" /></Link>)}</div>
        </div>
      </section>

      <RoommateSpotlight />
      <TrustSection />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="hm-partner-banner" style={{ backgroundImage: "linear-gradient(100deg,rgba(39,25,76,.96) 0%,rgba(70,43,120,.90) 55%,rgba(70,43,120,.48) 100%),url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85)", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="relative z-10 max-w-2xl"><span className="hm-banner-tag">FOR PROPERTY OWNERS</span><h2 className="mt-4 text-[27px] font-bold leading-tight tracking-tight text-white sm:text-[38px]">Your property deserves<br className="hidden sm:block" /> the right people.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/75">Reach genuine tenants, manage enquiries and keep every listing organised with HOMORA Partner.</p><div className="mt-7 flex flex-wrap gap-3">{partnerUrl ? <a href={partnerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-violet-800 hover:bg-violet-50">List your property <ExternalLink className="h-4 w-4" /></a> : <span className="rounded-full border border-white/30 px-5 py-3 text-sm text-white/80">Partner portal coming soon</span>}<Link to="/discover" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Explore HOMORA <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div></div>
          <div className="hm-banner-orbit"><div><span>H</span><small>HOMORA</small></div></div>
        </div>
      </section>
    </div>
  );
}
