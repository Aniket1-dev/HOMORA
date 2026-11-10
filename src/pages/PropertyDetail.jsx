import { incrementPropertyViews } from "@/services/bookings";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin, ShieldCheck, Bookmark, BookmarkCheck, GitCompare, Flag, BedDouble, Bath, Ruler, Layers, CalendarClock, Check,
} from "lucide-react";
import { entities } from "@/services/entities";
import Gallery from "@/components/property/Gallery";
import CostBreakdown from "@/components/property/CostBreakdown";
import NearbyPlaces from "@/components/property/NearbyPlaces";
import OwnerCard from "@/components/property/OwnerCard";
import ReviewsSection from "@/components/property/ReviewsSection";
import EnquiryDialog from "@/components/property/EnquiryDialog";
import VisitDialog from "@/components/property/VisitDialog";
import BookingDialog from "@/components/property/BookingDialog";
import PropertyCard from "@/components/PropertyCard";
import Modal from "@/components/ui-bits/Modal";
import NotFoundState from "@/components/ui-bits/NotFoundState";
import { inr, monthlyCost } from "@/lib/pricing";
import { CATEGORY_LABELS, GENDER_LABELS, SHARING_LABELS } from "@/lib/constants";
import { addRecentView, getCompare, getSaved, toggleCompare, toggleSaved } from "@/lib/guestStore";

const reportReasons = [
  "Photos appear reused or fake",
  "Price looks like a bait listing",
  "Owner asks for advance payment",
  "Property does not exist",
  "Other concern",
];

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportState, setReportState] = useState("idle");

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const found = await entities.Property.get(id).catch((e) =>
        e.status === 404 || e.response?.status === 404 ? null : Promise.reject(e)
      );
      if (!active) return;
      setProperty(found);
      setLoading(false);
      if (!found) return;

      addRecentView(found.id);
      setSaved(getSaved().includes(found.id));
      setCompared(getCompare().includes(found.id));

      const [roomPage, bedPage, reviewPage, similarPage] = await Promise.all([
        entities.Room.filter({ propertyId: found.id }, { sort: "roomNumber", limit: 50 }),
        entities.Bed.filter({ propertyId: found.id }, { sort: "bedNumber", limit: 80 }),
        entities.Review.filter({ propertyId: found.id, status: "published" }, { sort: "-created_date", limit: 20 }),
        entities.Property.filter(
          { status: "published", city: found.city, category: found.category },
          { limit: 4 }
        ),
      ]);
      if (!active) return;
      setRooms(roomPage?.items || []);
      setBeds(bedPage?.items || []);
      setReviews(reviewPage?.items || []);
      setSimilar((similarPage?.items || []).filter((item) => item.id !== found.id).slice(0, 3));

      if (!sessionStorage.getItem(`nivas:viewed:${found.id}`)) {
        sessionStorage.setItem(`nivas:viewed:${found.id}`, "1");
        incrementPropertyViews(found.id);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Partner room and bed edits update these shared rows. Refresh availability in place.
  useEffect(() => {
    let active = true;
    const refreshInventory = async () => {
      const [roomPage, bedPage] = await Promise.all([
        entities.Room.filter({ propertyId: id }, { sort: "roomNumber", limit: 50 }),
        entities.Bed.filter({ propertyId: id }, { sort: "bedNumber", limit: 80 }),
      ]);
      if (!active) return;
      setRooms(roomPage?.items || []);
      setBeds(bedPage?.items || []);
    };
    const channel = supabase.channel("discover-property-inventory-" + id)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: "property_id=eq." + id }, refreshInventory)
      .on("postgres_changes", { event: "*", schema: "public", table: "beds", filter: "property_id=eq." + id }, refreshInventory)
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="h-[340px] animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!property) return <NotFoundState title="This listing is no longer available" />;

  const availableBeds = beds.filter((bed) => bed.status === "available");
  const monthly = monthlyCost(property);
  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Ruler, label: "Carpet area", value: property.carpetArea ? `${property.carpetArea} sq ft` : null },
    { icon: Layers, label: "Floor", value: property.totalFloors ? `${property.floor ?? 0} of ${property.totalFloors}` : null },
    { icon: CalendarClock, label: "Available from", value: property.availableFrom },
  ].filter((fact) => fact.value !== null && fact.value !== undefined && fact.value !== "");

  const submitReport = async () => {
    setReportState("saving");
    await entities.Report.create({
      targetType: "property",
      targetId: property.id,
      targetTitle: property.title,
      reason: reportReason,
      details: reportDetails,
      priority: "medium",
      status: "open",
    });
    setReportState("done");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Link to="/discover" className="hover:text-foreground">Discover</Link>
        <span>/</span>
        <span className="text-foreground/70">{CATEGORY_LABELS[property.category] || "Accommodation"}</span>
        <span>/</span>
        <span className="truncate">{property.city}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-balance text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
            {property.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {property.locality}, {property.city} {property.pincode}
            </span>
            {property.subtype && <span>· {property.subtype}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSaved(toggleSaved(property.id).includes(property.id))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px]"
          >
            {saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setCompared(toggleCompare(property.id).includes(property.id))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px]"
          >
            <GitCompare className="h-4 w-4" /> {compared ? "In comparison" : "Compare"}
          </button>
          <button
            type="button"
            onClick={() => setDialog("report")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground"
          >
            <Flag className="h-4 w-4" /> Report
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-10">
          <Gallery images={property.images} title={property.title} />

          <div className="flex flex-wrap gap-2">
            {[GENDER_LABELS[property.gender], SHARING_LABELS[property.sharing], property.furnishing]
              .filter(Boolean)
              .map((label) => (
                <span key={label} className="rounded-full bg-secondary px-3 py-1 text-[12px] capitalize text-foreground/80">
                  {label}
                </span>
              ))}
            {property.ac && <span className="rounded-full bg-secondary px-3 py-1 text-[12px]">AC</span>}
            {property.foodIncluded && <span className="rounded-full bg-secondary px-3 py-1 text-[12px]">Food included</span>}
            {property.petFriendly && <span className="rounded-full bg-secondary px-3 py-1 text-[12px]">Pet friendly</span>}
          </div>

          {facts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-border bg-card p-4">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-2 text-[13px] font-medium">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          )}

          <section>
            <h2 className="text-[17px] font-semibold tracking-tight">About this home</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-muted-foreground">
              {property.description || "The owner has not added a description yet."}
            </p>
          </section>

          {property.amenities?.length > 0 && (
            <section>
              <h2 className="text-[17px] font-semibold tracking-tight">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <p key={amenity} className="flex items-center gap-2 text-[13px] text-foreground/80">
                    <Check className="h-3.5 w-3.5 text-accent" /> {amenity}
                  </p>
                ))}
              </div>
            </section>
          )}

          {availableBeds.length > 0 && (
            <section>
              <h2 className="text-[17px] font-semibold tracking-tight">Rooms & beds</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {availableBeds.length} bed{availableBeds.length === 1 ? "" : "s"} currently available
                {rooms.length ? ` across ${rooms.length} rooms` : ""}.
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-secondary/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Room</th>
                      <th className="px-4 py-2.5">Beds</th>
                      <th className="px-4 py-2.5">Available</th>
                      <th className="px-4 py-2.5">Rent / bed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          {room.roomNumber}
                          <span className="ml-2 text-[11px] capitalize text-muted-foreground">{room.roomType}</span>
                        </td>
                        <td className="px-4 py-2.5">{room.totalBeds}</td>
                        <td className="px-4 py-2.5">{room.availableBeds}</td>
                        <td className="px-4 py-2.5">{inr(room.rentPerBed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {(property.rules || property.curfew || property.visitorPolicy) && (
            <section>
              <h2 className="text-[17px] font-semibold tracking-tight">House rules</h2>
              <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
                {property.rules && <p>{property.rules}</p>}
                {property.curfew && <p><span className="font-medium text-foreground/80">Curfew:</span> {property.curfew}</p>}
                {property.visitorPolicy && (
                  <p><span className="font-medium text-foreground/80">Visitors:</span> {property.visitorPolicy}</p>
                )}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-[17px] font-semibold tracking-tight">What's nearby</h2>
            <div className="mt-3">
              <NearbyPlaces lat={property.lat} lng={property.lng} />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <ReviewsSection
              property={property}
              reviews={reviews}
              onCreated={(review) => setReviews((prev) => [review, ...prev])}
            />
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="text-[17px] font-semibold tracking-tight">Similar homes in {property.city}</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((item) => (
                  <PropertyCard key={item.id} property={item} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[26px] font-semibold leading-none tracking-tight">{inr(property.rent)}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  advertised {property.rentUnit === "bed" ? "per bed / month" : "per month"}
                </p>
              </div>
              <p className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                {inr(monthly.total)} all-in est.
              </p>
            </div>

            <div className="mt-4">
              <CostBreakdown property={property} />
            </div>

            <Link
              to={`/calculator?property=${property.id}`}
              className="mt-3 inline-flex text-[12px] font-semibold text-primary underline underline-offset-2"
            >
              Model extras in the calculator
            </Link>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => setDialog("booking")}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                {availableBeds.length ? "Request a bed" : "Request to book"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDialog("visit")}
                  className="rounded-xl border border-border px-3 py-2.5 text-[13px] font-medium transition hover:shadow-soft"
                >
                  Book a visit
                </button>
                <button
                  type="button"
                  onClick={() => setDialog("enquiry")}
                  className="rounded-xl border border-border px-3 py-2.5 text-[13px] font-medium transition hover:shadow-soft"
                >
                  Enquire
                </button>
              </div>
            </div>

            <div className="mt-5">
              <OwnerCard property={property} onEnquire={() => setDialog("enquiry")} />
            </div>

            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Never transfer money before you have visited and signed an agreement. Report anything suspicious.
            </p>
          </div>
        </aside>
      </div>

      <EnquiryDialog open={dialog === "enquiry"} onClose={() => setDialog(null)} property={property} />
      <VisitDialog open={dialog === "visit"} onClose={() => setDialog(null)} property={property} />
      <BookingDialog open={dialog === "booking"} onClose={() => setDialog(null)} property={property} />

      <Modal
        open={dialog === "report"}
        onClose={() => {
          setDialog(null);
          setReportState("idle");
        }}
        title="Report this listing"
        description="Our moderators review every report. Include specifics if you can."
      >
        {reportState === "done" ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Report received.</p>
            <p className="text-[13px] text-muted-foreground">
              It is now in the moderation queue. We may contact you for more detail.
            </p>
            <button
              type="button"
              onClick={() => {
                setDialog(null);
                setReportState("idle");
              }}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="What did you notice?"
              className="min-h-[96px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={submitReport}
              disabled={reportState === "saving"}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {reportState === "saving" ? "Sending…" : "Submit report"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}