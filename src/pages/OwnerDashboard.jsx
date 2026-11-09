import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui-bits/StatCard";
import PropertiesPanel from "@/components/owner/PropertiesPanel";
import EnquiriesPanel from "@/components/owner/EnquiriesPanel";
import VisitsPanel from "@/components/owner/VisitsPanel";
import BookingsPanel from "@/components/owner/BookingsPanel";
import RoomsManager from "@/components/owner/RoomsManager";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "properties", label: "Properties" },
  { key: "enquiries", label: "Enquiries" },
  { key: "visits", label: "Visits" },
  { key: "bookings", label: "Bookings" },
];

export default function OwnerDashboard() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ properties: [], enquiries: [], visits: [], bookings: [] });
  const [availableBeds, setAvailableBeds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roomsFor, setRoomsFor] = useState(null);

  const load = useCallback(async () => {
    const [propertyPage, enquiryPage, visitPage, bookingPage, beds] = await Promise.all([
      base44.entities.Property.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Enquiry.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Visit.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Booking.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Bed.count({ status: "available" }),
    ]);
    setData({
      properties: propertyPage?.items || [],
      enquiries: enquiryPage?.items || [],
      visits: visitPage?.items || [],
      bookings: bookingPage?.items || [],
    });
    setAvailableBeds(beds || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { properties, enquiries, visits, bookings } = data;
  const published = properties.filter((property) => property.status === "published");
  const pending = properties.filter((property) => property.status === "pending");
  const newEnquiries = enquiries.filter((enquiry) => enquiry.status === "new");
  const openVisits = visits.filter((visit) => ["requested", "reschedule_requested"].includes(visit.status));
  const openBookings = bookings.filter((booking) => booking.status === "requested");
  const totalViews = properties.reduce((sum, property) => sum + (property.views || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Owner workspace</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Properties & tenants</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {published.length} live listing{published.length === 1 ? "" : "s"} · {availableBeds} beds available ·{" "}
            {totalViews} listing views
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/host/verification" className="rounded-full border border-border bg-card px-4 py-2.5 text-[13px]">
            Owner verification
          </Link>
          <Link
            to="/host/listings/new"
            className="rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            List a property
          </Link>
        </div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] transition ${
              tab === item.key ? "bg-secondary font-medium" : "text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 h-40 animate-pulse rounded-3xl border border-border bg-card" />
      ) : (
        <div className="mt-6">
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Published" value={published.length} hint={`${pending.length} awaiting moderation`} />
                <StatCard label="Beds available" value={availableBeds} hint="Across all rooms" tone="accent" />
                <StatCard label="New enquiries" value={newEnquiries.length} hint={`${enquiries.length} total`} />
                <StatCard
                  label="To action"
                  value={openVisits.length + openBookings.length}
                  hint={`${openVisits.length} visits · ${openBookings.length} bookings`}
                  tone={openVisits.length + openBookings.length ? "warn" : "default"}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold">Latest enquiries</h2>
                    <button type="button" onClick={() => setTab("enquiries")} className="text-[12px] text-muted-foreground">
                      View all
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {enquiries.slice(0, 4).map((enquiry) => (
                      <div key={enquiry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px]">{enquiry.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{enquiry.propertyTitle}</p>
                        </div>
                        <span className="shrink-0 text-[11px] capitalize text-muted-foreground">
                          {enquiry.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                    {enquiries.length === 0 && <p className="text-[13px] text-muted-foreground">No enquiries yet.</p>}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold">Visits this week</h2>
                    <button type="button" onClick={() => setTab("visits")} className="text-[12px] text-muted-foreground">
                      Manage
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {visits.slice(0, 4).map((visit) => (
                      <div key={visit.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px]">{visit.visitorName}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {visit.date} · {visit.time}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] capitalize text-muted-foreground">{visit.status}</span>
                      </div>
                    ))}
                    {visits.length === 0 && <p className="text-[13px] text-muted-foreground">No visits requested yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "properties" && (
            <PropertiesPanel properties={properties} onRefresh={load} onManageRooms={setRoomsFor} />
          )}
          {tab === "enquiries" && <EnquiriesPanel enquiries={enquiries} onRefresh={load} />}
          {tab === "visits" && <VisitsPanel visits={visits} onRefresh={load} />}
          {tab === "bookings" && <BookingsPanel bookings={bookings} onRefresh={load} />}
        </div>
      )}

      <RoomsManager
        property={roomsFor}
        open={!!roomsFor}
        onClose={() => setRoomsFor(null)}
        onRefresh={load}
      />
    </div>
  );
}