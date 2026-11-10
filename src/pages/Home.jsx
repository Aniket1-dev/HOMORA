import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryRail from "@/components/home/CategoryRail";
import RoommateSpotlight from "@/components/home/RoommateSpotlight";
import TrustSection from "@/components/home/TrustSection";
import PropertyCard from "@/components/PropertyCard";
import { entities } from "@/services/entities";
import { supabase } from "@/lib/supabase/client";

const partnerUrl = (import.meta.env.VITE_PARTNER_APP_URL || "").trim();

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const loadPublished = async () => {
      try {
        const page = await entities.Property.filter({ status: "published" }, { sort: "-created_date", limit: 6 });
        if (active) {
          setProperties(page?.items || []);
          setLoadError("");
        }
      } catch (error) {
        if (active) setLoadError(error.message || "Published listings could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPublished();
    const channel = supabase.channel("discover-home-published-properties")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, loadPublished)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <HeroSearch />
      <CategoryRail />
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Live from HOMORA Partner</p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Places worth calling home</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">Listings approved by HOMORA appear here automatically.</p>
          </div>
          <Link to="/discover" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] transition hover:shadow-soft">
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[320px] animate-pulse rounded-3xl border border-border bg-card" />)}
          </div>
        ) : loadError ? (
          <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>
        ) : properties.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold">New places are on the way</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              When a property is approved in HOMORA Partner, it will appear here from the shared listings database.
            </p>
          </div>
        )}
      </section>

      <RoommateSpotlight />
      <TrustSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "radial-gradient(600px 240px at 20% 0%, hsl(var(--accent) / 0.55), transparent 70%), radial-gradient(500px 220px at 85% 100%, hsl(199 80% 60% / 0.4), transparent 70%)" }} />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Own a hostel, PG or flat? Reach tenants on HOMORA.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/75">
              Manage properties, rooms, beds, enquiries and bookings in the separate HOMORA Partner workspace.
              Approved listings are shared with Discover automatically.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {partnerUrl ? (
                <a href={partnerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary transition hover:opacity-90">
                  Open HOMORA Partner <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="rounded-full border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground/85">
                  HOMORA Partner portal URL will be available soon
                </span>
              )}
              <Link to="/discover" className="rounded-full border border-primary-foreground/25 px-5 py-3 text-sm font-medium transition hover:bg-primary-foreground/10">
                Explore homes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
