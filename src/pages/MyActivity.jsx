import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { entities } from "@/services/entities";
import PropertyCard from "@/components/PropertyCard";
import EmptyState from "@/components/ui-bits/EmptyState";
import StatusPill from "@/components/ui-bits/StatusPill";
import { inr } from "@/lib/pricing";
import { addMyConnection, getMyRequests as getSavedRequestIds, getSaved } from "@/lib/guestStore";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { cancelVisit as cancelVisitRequest, getMyRequests, manageBooking } from "@/services/bookings";

const tabs = [
  { key: "bookings", label: "Bookings" },
  { key: "visits", label: "Visits" },
  { key: "enquiries", label: "Enquiries" },
  { key: "saved", label: "Saved" },
  { key: "connections", label: "Connections" },
];

const fetchByIds = async (entity, ids) => {
  if (!ids.length) return [];
  const page = await entity.filter({ id: { $in: ids } }, { limit: 50 });
  const order = new Map(ids.map((id, index) => [id, index]));
  return (page?.items || []).sort((a, b) => (order.get(a.id) || 0) - (order.get(b.id) || 0));
};

export default function MyActivity() {
  const { user } = useAuth();
  const { search } = useLocation();
  const requestedTab = new URLSearchParams(search).get("tab");
  const [tab, setTab] = useState(
    tabs.some((item) => item.key === requestedTab) ? requestedTab : "bookings"
  );
  const [data, setData] = useState({ bookings: [], visits: [], enquiries: [], saved: [], connections: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const requests = getSavedRequestIds();

    const [mine, saved] = await Promise.all([
      user ? entities.RoommateProfile.filter({ ownerId: user.id }, { limit: 1 }).then((p) => p.items[0]) : null,
      fetchByIds(entities.Property, getSaved()),
    ]);
    const { bookings, visits, enquiries } = await getMyRequests(requests).catch(() => ({ bookings: [], visits: [], enquiries: [] }));
    const merged = mine
      ? (await entities.RoommateConnection.filter({ $or: [{ fromProfileId: mine.id }, { toProfileId: mine.id }] }, { limit: 100 })).items
      : [];

    setData({ bookings, visits, enquiries, saved, connections: merged });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let refreshTimer;
    const refresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => load(), 120);
    };
    const channel = supabase.channel("discover-tenant-activity-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: "tenant_id=eq." + user.id }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "visits", filter: "tenant_id=eq." + user.id }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "enquiries", filter: "tenant_id=eq." + user.id }, refresh)
      .subscribe();
    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id, load]);

  useEffect(() => {
    const next = new URLSearchParams(search).get("tab");
    if (next && tabs.some((item) => item.key === next)) setTab(next);
  }, [search]);

  const cancelBooking = async (booking) => {
    setBusy(booking.id);
    await manageBooking({ action: "cancel", bookingId: booking.id });
    await load();
    setBusy("");
  };

  const cancelVisit = async (visit) => {
    setBusy(visit.id);
    await cancelVisitRequest(visit.id);
    await load();
    setBusy("");
  };

  const acceptConnection = async (connection) => {
    setBusy(connection.id);
    await entities.RoommateConnection.update(connection.id, { status: "accepted" });
    addMyConnection(connection.id);
    await load();
    setBusy("");
  };

  const counts = Object.fromEntries(tabs.map((item) => [item.key, data[item.key]?.length || 0]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">My activity</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Everything you have saved, requested or connected with. Requests are linked to this browser.
      </p>

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
            {item.label} {counts[item.key] ? `(${counts[item.key]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 h-40 animate-pulse rounded-3xl border border-border bg-card" />
      ) : (
        <div className="mt-6">
          {tab === "bookings" &&
            (data.bookings.length === 0 ? (
              <EmptyState
                title="No booking requests yet"
                body="When you request a bed or a home, the reference and status appear here."
                action={
                  <Link to="/discover" className="rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Browse listings
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {data.bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium">{booking.propertyTitle}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          Reference {booking.reference} ·{" "}
                          {booking.bedNumber ? `Room ${booking.roomNumber}, bed ${booking.bedNumber}` : "Whole home"} ·{" "}
                          {inr(booking.monthlyRent)} / month
                        </p>
                      </div>
                      <StatusPill status={booking.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                      <span className="capitalize">Payment: {booking.paymentStatus?.replace(/_/g, " ")}</span>
                      <Link to={`/property/${booking.propertyId}`} className="underline underline-offset-2">
                        View listing
                      </Link>
                      {["requested", "approved"].includes(booking.status) && (
                        <button
                          type="button"
                          onClick={() => cancelBooking(booking)}
                          disabled={busy === booking.id}
                          className="text-destructive disabled:opacity-50"
                        >
                          Cancel request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {tab === "visits" &&
            (data.visits.length === 0 ? (
              <EmptyState title="No visits scheduled" body="Request a visit from any listing and track its status here." />
            ) : (
              <div className="space-y-3">
                {data.visits.map((visit) => (
                  <div key={visit.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium">{visit.propertyTitle}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {visit.date} at {visit.time} · {visit.mode === "virtual" ? "Video call" : "In person"}
                        </p>
                      </div>
                      <StatusPill status={visit.status} />
                    </div>
                    {visit.status === "confirmed" && (
                      <p className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-700 dark:text-emerald-400">
                        Confirmed. The owner has your number — call ahead if you're running late.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                      <Link to={`/property/${visit.propertyId}`} className="underline underline-offset-2">
                        View listing
                      </Link>
                      {["requested", "confirmed"].includes(visit.status) && (
                        <button
                          type="button"
                          onClick={() => cancelVisit(visit)}
                          disabled={busy === visit.id}
                          className="text-destructive disabled:opacity-50"
                        >
                          Cancel visit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {tab === "enquiries" &&
            (data.enquiries.length === 0 ? (
              <EmptyState title="No enquiries sent" body="Enquiries you send to owners are listed here with their status." />
            ) : (
              <div className="space-y-3">
                {data.enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium">{enquiry.propertyTitle}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">{enquiry.message || "No message"}</p>
                      </div>
                      <StatusPill status={enquiry.status} />
                    </div>
                    {enquiry.ownerNote && (
                      <p className="mt-3 rounded-xl bg-secondary/70 px-3 py-2 text-[12px] text-muted-foreground">
                        Owner note: {enquiry.ownerNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}

          {tab === "saved" &&
            (data.saved.length === 0 ? (
              <EmptyState
                title="Nothing saved yet"
                body="Tap Save on any listing to keep it here while you decide."
                action={
                  <Link to="/discover" className="rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Browse listings
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.saved.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ))}

          {tab === "connections" &&
            (data.connections.length === 0 ? (
              <EmptyState
                title="No roommate connections"
                body="Send a request from the roommate tab — mutual acceptance unlocks contact details."
                action={
                  <Link to="/roommates" className="rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Find roommates
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {data.connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                  >
                    <div>
                      <p className="text-[13px] font-medium">{connection.fromName} → {connection.toName}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{connection.message}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={connection.status} />
                      {connection.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => acceptConnection(connection)}
                          disabled={busy === connection.id}
                          className="rounded-xl border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}