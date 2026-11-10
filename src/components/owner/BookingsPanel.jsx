import { manageBooking } from "@/services/bookings";
import { useState } from "react";
import StatusPill from "@/components/ui-bits/StatusPill";
import { inr } from "@/lib/pricing";

export default function BookingsPanel({ bookings, onRefresh }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const act = async (booking, action) => {
    setBusy(booking.id);
    setError("");
    const response = await manageBooking({ action, bookingId: booking.id });
    if (response.data?.error) setError(response.data.error);
    await onRefresh();
    setBusy("");
  };

  if (!bookings.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
        No booking requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-[12px] text-red-700 dark:text-red-400">{error}</p>}
      {bookings.map((booking) => (
        <div key={booking.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">
                {booking.tenantName} ·{" "}
                <a href={`tel:${booking.phone}`} className="text-accent underline underline-offset-2">
                  {booking.phone}
                </a>
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {booking.propertyTitle} · {booking.bedNumber ? `Room ${booking.roomNumber}, bed ${booking.bedNumber}` : "Whole home"} ·{" "}
                {inr(booking.monthlyRent)} / month
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Ref {booking.reference} · deposit {inr(booking.deposit)} · payment {booking.paymentStatus?.replace(/_/g, " ")}
                {booking.moveInDate ? ` · move-in ${booking.moveInDate}` : ""}
              </p>
            </div>
            <StatusPill status={booking.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {booking.status === "requested" && (
              <>
                <button
                  type="button"
                  onClick={() => act(booking, "approve")}
                  disabled={busy === booking.id}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => act(booking, "reject")}
                  disabled={busy === booking.id}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  Reject & release bed
                </button>
              </>
            )}
            {booking.status === "approved" && (
              <button
                type="button"
                onClick={() => act(booking, "confirm")}
                disabled={busy === booking.id}
                className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
              >
                Mark move-in confirmed
              </button>
            )}
            {["approved", "confirmed"].includes(booking.status) && (
              <button
                type="button"
                onClick={() => act(booking, "cancel")}
                disabled={busy === booking.id}
                className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground disabled:opacity-50"
              >
                Cancel & release bed
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}