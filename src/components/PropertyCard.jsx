import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Bed, ShieldCheck, ArrowUpRight, Bath, Ruler } from "lucide-react";
import { inr } from "@/lib/pricing";

const categoryLabel = { hostel: "Hostel", pg: "PG / Co-living", flat: "Flat", house: "House", shared: "Shared room" };

export default function PropertyCard({ property, footer = null }) {
  const photo = property.images?.[0];
  return (
    <article className="hm-property-card group">
      <Link to={`/property/${property.id}`} className="block">
        <div className="hm-property-photo">
          {photo ? <img src={photo} alt={property.title || "Accommodation"} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            : <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-50 to-slate-100 text-slate-400"><span className="text-2xl">⌂</span><span className="text-[10px] font-semibold">Photos coming soon</span></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
          <span className="absolute left-3 top-3 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur">{categoryLabel[property.category] || "Home"}</span>
          {property.ownerVerified && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm"><ShieldCheck className="h-3 w-3"/> Verified</span>}
          <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-800 shadow-md transition group-hover:bg-violet-700 group-hover:text-white"><ArrowUpRight className="h-4 w-4"/></span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-[14px] font-extrabold tracking-tight text-slate-900">{property.title}</h3><p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500"><MapPin className="h-3 w-3 shrink-0 text-violet-500"/>{[property.locality,property.city].filter(Boolean).join(", ")}</p></div>{property.rating ? <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700"><BadgeCheck className="h-3 w-3"/>{Number(property.rating).toFixed(1)}</span> : null}</div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-b border-slate-100 pb-3 text-[10px] font-medium text-slate-500">
            {property.subtype && <span>{property.subtype}</span>}
            {property.bedrooms ? <span className="inline-flex items-center gap-1"><Bed className="h-3 w-3"/>{property.bedrooms} bed</span> : null}
            {property.bathrooms ? <span className="inline-flex items-center gap-1"><Bath className="h-3 w-3"/>{property.bathrooms} bath</span> : null}
            {property.carpetArea ? <span className="inline-flex items-center gap-1"><Ruler className="h-3 w-3"/>{property.carpetArea} sq ft</span> : null}
          </div>
          <div className="flex items-end justify-between pt-3"><div><p className="text-[17px] font-extrabold tracking-tight text-slate-900">{inr(property.rent)}<span className="text-[10px] font-medium text-slate-400">{property.rentUnit === "bed" ? " / bed / mo" : " / mo"}</span></p><p className="mt-0.5 text-[10px] text-slate-400">Deposit: {property.deposit ? inr(property.deposit) : "Ask owner"}</p></div><span className="text-[10px] font-bold text-violet-700">View details →</span></div>
        </div>
      </Link>
      {footer}
    </article>
  );
}
