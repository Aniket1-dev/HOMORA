import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Bed, ShieldCheck } from "lucide-react";
import { inr } from "@/lib/pricing";

const categoryLabel = {
  hostel: "Hostel",
  pg: "PG / Co-living",
  flat: "Flat",
  house: "House",
  shared: "Shared room",
};

export default function PropertyCard({ property, footer = null }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No photo</div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            {categoryLabel[property.category] || "Home"}
          </span>
          {property.ownerVerified && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-medium text-white">
              <ShieldCheck className="h-3 w-3" /> Verified owner
            </span>
          )}
        </div>

        <div className="space-y-3 p-5">
          <div>
            <h3 className="line-clamp-1 text-[15px] font-semibold tracking-tight">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.locality}, {property.city}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            {property.subtype && <span>{property.subtype}</span>}
            {property.bedrooms ? (
              <span className="inline-flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                {property.bedrooms} bed
              </span>
            ) : null}
            {property.carpetArea ? <span>{property.carpetArea} sq ft</span> : null}
          </div>

          <div className="flex items-end justify-between border-t border-border pt-3">
            <div>
              <p className="text-[17px] font-semibold tracking-tight">
                {inr(property.rent)}
                <span className="text-[12px] font-normal text-muted-foreground">
                  {property.rentUnit === "bed" ? " / bed / mo" : " / mo"}
                </span>
              </p>
              {property.rating ? (
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                  {property.rating.toFixed(1)} · {property.reviewCount || 0} reviews
                </p>
              ) : null}
            </div>
            <span className="text-[12px] text-muted-foreground">View details →</span>
          </div>
        </div>
      </Link>
      {footer}
    </article>
  );
}