import { BadgeCheck, Phone, ShieldCheck } from "lucide-react";

const ownerTypeLabel = {
  individual: "Individual owner",
  hostel_operator: "Hostel operator",
  pg_operator: "PG operator",
  management_company: "Management company",
  authorized_manager: "Authorized manager",
};

export default function OwnerCard({ property, onEnquire }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold">
          {(property.ownerName || "Owner")
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{property.ownerName || "Listing owner"}</p>
          <p className="text-[11px] text-muted-foreground">{ownerTypeLabel[property.ownerType] || "Property owner"}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ShieldCheck className={`h-3.5 w-3.5 ${property.ownerVerified ? "text-emerald-600" : "text-muted-foreground"}`} />
          {property.ownerVerified ? "Identity documents reviewed" : "Identity not yet verified"}
        </p>
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <BadgeCheck className={`h-3.5 w-3.5 ${property.propertyVerified ? "text-emerald-600" : "text-muted-foreground"}`} />
          {property.propertyVerified ? "Ownership / authorization reviewed" : "Ownership proof pending"}
        </p>
      </div>

      <button
        type="button"
        onClick={onEnquire}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] font-medium transition hover:shadow-soft"
      >
        <Phone className="h-3.5 w-3.5" /> Contact owner
      </button>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Verification confirms documents were reviewed. It is not a guarantee of condition or conduct.
      </p>
    </div>
  );
}