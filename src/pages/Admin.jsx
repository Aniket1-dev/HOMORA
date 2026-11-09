import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui-bits/StatCard";
import StatusPill from "@/components/ui-bits/StatusPill";
import ModerationPanel from "@/components/admin/ModerationPanel";
import VerificationsPanel from "@/components/admin/VerificationsPanel";
import ReportsPanel from "@/components/admin/ReportsPanel";
import BookingsPanel from "@/components/owner/BookingsPanel";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "listings", label: "Listings" },
  { key: "owners", label: "Verifications" },
  { key: "reports", label: "Reports" },
  { key: "bookings", label: "Bookings" },
  { key: "audit", label: "Activity" },
];

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ properties: [], verifications: [], reports: [], bookings: [], rooms: [] });

  const load = useCallback(async () => {
    const [properties, verifications, reports, bookings, rooms] = await Promise.all([
      base44.entities.Property.list({ sort: "-created_date", limit: 200 }),
      base44.entities.OwnerVerification.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Report.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Booking.list({ sort: "-created_date", limit: 100 }),
      base44.entities.Room.list({ limit: 300 }),
    ]);
    setData({
      properties: properties?.items || [],
      verifications: verifications?.items || [],
      reports: reports?.items || [],
      bookings: bookings?.items || [],
      rooms: rooms?.items || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { properties, verifications, reports, bookings, rooms } = data;
  const counts = {
    users: new Set(properties.map((property) => property.ownerEmail).filter(Boolean)).size,
    published: properties.filter((property) => property.status === "published").length,
    pending: properties.filter((property) => property.status === "pending").length,
    rejected: properties.filter((property) => property.status === "rejected").length,
    suspended: properties.filter((property) => property.status === "suspended").length,
    verifiedOwners: new Set(properties.filter((property) => property.ownerVerified).map((property) => property.ownerEmail)).size,
    openReports: reports.filter((report) => ["open", "investigating"].includes(report.status)).length,
    bookings: bookings.length,
    openBookings: bookings.filter((booking) => booking.status === "requested").length,
    availableRooms: rooms.filter((room) => room.status === "available").length,
  };

  const activity = [
    ...properties.slice(0, 6).map((property) => ({
      id: `p-${property.id}`,
      when: property.created_date,
      text: `Listing “${property.title}” created by ${property.ownerName || "an owner"}`,
    })),
    ...reports.slice(0, 4).map((report) => ({
      id: `r-${report.id}`,
      when: report.created_date,
      text: `Report filed: ${report.reason} (${report.targetType})`,
    })),
    ...bookings.slice(0, 4).map((booking) => ({
      id: `b-${booking.id}`,
      when: booking.created_date,
      text: `Booking ${booking.reference} ${booking.status} for ${booking.propertyTitle}`,
    })),
  ]
    .filter((entry) => entry.when)
    .sort((a, b) => new Date(b.when) - new Date(a.when))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Platform administration</p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Trust & moderation</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {counts.pending} listings awaiting review · {counts.openReports} open reports · {counts.openBookings} booking
            requests
          </p>
        </div>
        <Link to="/host" className="rounded-full border border-border bg-card px-4 py-2.5 text-[13px]">
          Owner workspace
        </Link>
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
        <div className="mt-6 h-48 animate-pulse rounded-3xl border border-border bg-card" />
      ) : (
        <div className="mt-6">
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Listings" value={properties.length} hint={`${counts.published} published`} />
                <StatCard label="Awaiting review" value={counts.pending} hint={`${counts.rejected} rejected`} tone={counts.pending ? "warn" : "default"} />
                <StatCard label="Verified owners" value={counts.verifiedOwners} hint="With approved documents" tone="accent" />
                <StatCard label="Open reports" value={counts.openReports} hint={`${reports.length} all time`} tone={counts.openReports ? "warn" : "default"} />
                <StatCard label="Rooms available" value={counts.availableRooms} hint={`${rooms.length} rooms tracked`} />
                <StatCard label="Bookings" value={counts.bookings} hint={`${counts.openBookings} to action`} />
                <StatCard label="Suspended" value={counts.suspended} hint="Hidden from search" />
                <StatCard label="Owner accounts" value={counts.users} hint="Distinct owner emails" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold">Moderation queue</h2>
                    <button type="button" onClick={() => setTab("listings")} className="text-[12px] text-muted-foreground">
                      Open
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {properties.filter((property) => property.status === "pending").slice(0, 4).map((property) => (
                      <div key={property.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                        <span className="truncate text-[13px]">{property.title}</span>
                        <StatusPill status={property.status} />
                      </div>
                    ))}
                    {counts.pending === 0 && <p className="text-[13px] text-muted-foreground">Queue is clear.</p>}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold">Reports needing action</h2>
                    <button type="button" onClick={() => setTab("reports")} className="text-[12px] text-muted-foreground">
                      Open
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {reports.filter((report) => ["open", "investigating"].includes(report.status)).slice(0, 4).map((report) => (
                      <div key={report.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                        <span className="truncate text-[13px]">{report.reason}</span>
                        <StatusPill status={report.status} />
                      </div>
                    ))}
                    {counts.openReports === 0 && <p className="text-[13px] text-muted-foreground">No open reports.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "listings" && <ModerationPanel properties={properties} onRefresh={load} />}
          {tab === "owners" && <VerificationsPanel verifications={verifications} onRefresh={load} />}
          {tab === "reports" && <ReportsPanel reports={reports} onRefresh={load} />}
          {tab === "bookings" && <BookingsPanel bookings={bookings} onRefresh={load} />}

          {tab === "audit" && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <h2 className="text-[15px] font-semibold">Recent platform activity</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Listing, report and booking events, newest first. Each entry keeps its record id for follow-up.
              </p>
              <div className="mt-4 space-y-2">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
                    <span className="text-[13px] text-foreground/85">{entry.text}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(entry.when).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                {activity.length === 0 && <p className="text-[13px] text-muted-foreground">No activity yet.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}