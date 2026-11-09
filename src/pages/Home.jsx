import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryRail from "@/components/home/CategoryRail";
import RoommateSpotlight from "@/components/home/RoommateSpotlight";
import TrustSection from "@/components/home/TrustSection";
import PropertyCard from "@/components/PropertyCard";
import { sampleProperties } from "@/lib/sampleData";

export default function Home() {
  return (
    <div>
      <HeroSearch />
      <CategoryRail />

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Handpicked listings
            </p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
              Homes people are moving into
            </h2>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] transition hover:shadow-soft"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sampleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      <RoommateSpotlight />
      <TrustSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(600px 240px at 20% 0%, hsl(var(--accent) / 0.55), transparent 70%), radial-gradient(500px 220px at 85% 100%, hsl(199 80% 60% / 0.4), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Own a hostel, PG or flat? Fill beds with tenants who stay.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
              Publish rooms and beds, manage availability, approve visits and track enquiries — with pricing that shows
              tenants the honest total.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/host/listings/new"
                className="rounded-full bg-primary-foreground px-5 py-3 text-sm font-medium text-primary transition hover:opacity-90"
              >
                List a property
              </Link>
              <Link
                to="/host"
                className="rounded-full border border-primary-foreground/25 px-5 py-3 text-sm font-medium transition hover:bg-primary-foreground/10"
              >
                Open Homora Host
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}