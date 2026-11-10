import { manageBooking } from "@/services/bookings";
import { useEffect, useState } from "react";
import { entities } from "@/services/entities";
import Modal from "@/components/ui-bits/Modal";
import { addMyRequest } from "@/lib/guestStore";
import { inr } from "@/lib/pricing";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

export default function BookingDialog({ open, onClose, property }) {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const [form, setForm] = useState({ tenantName: "", phone: "", email: "", moveInDate: "" });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setState("idle");
    setError("");
    setSelectedBed(null);
    entities.Bed.filter({ propertyId: property.id, status: "available" }, { sort: "bedNumber", limit: 60 })
      .then((page) => {
        if (!active) return;
        const items = page?.items || [];
        setBeds(items);
        if (items.length === 1) setSelectedBed(items[0]);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, property.id]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.tenantName.trim().length < 2) return setError("Please enter your name.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Enter a valid 10-digit phone number.");
    if (beds.length && !selectedBed) return setError("Choose an available bed.");
    setState("saving");
    try {
      const response = await manageBooking({
        action: "create",
        propertyId: property.id,
        roomId: selectedBed?.roomId || null,
        bedId: selectedBed?.id || null,
        tenantName: form.tenantName,
        phone: form.phone,
        email: form.email,
        moveInDate: form.moveInDate || null,
      });
      if (response.data?.error) {
        setError(response.data.error);
        setState("idle");
        return;
      }
      addMyRequest("bookings", response.data.booking.id);
      setBooking(response.data.booking);
      setState("done");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Could not submit this booking request.");
      setState("idle");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Request to book"
      description="A request only — the home is held for you until the owner responds. No payment is taken here."
    >
      {state === "done" && booking ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Booking request {booking.reference} submitted.</p>
          <div className="rounded-xl border border-border bg-background p-4 text-[13px]">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Monthly rent</span>
              <span className="font-medium">{inr(booking.monthlyRent)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Security deposit</span>
              <span className="font-medium">{inr(booking.deposit)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{booking.status}</span>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            The bed is now marked reserved. If the owner rejects or you cancel, it returns to available. Payment happens
            offline or through an invoice the owner issues — never send money before you have seen the property.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {beds.length ? "Choose an available bed" : "Availability"}
            </p>
            {loading ? (
              <p className="mt-2 text-[13px] text-muted-foreground">Checking live availability…</p>
            ) : beds.length === 0 ? (
              <p className="mt-2 rounded-xl bg-secondary/70 px-3 py-2 text-[13px] text-muted-foreground">
                No individual beds are listed for this home. You can still request the whole unit — the owner will
                confirm availability.
              </p>
            ) : (
              <div className="mt-2 grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
                {beds.map((bed) => (
                  <button
                    key={bed.id}
                    type="button"
                    onClick={() => setSelectedBed(bed)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition ${
                      selectedBed?.id === bed.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <span className="font-medium">Room {bed.roomNumber} · Bed {bed.bedNumber}</span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">{inr(bed.monthlyRent)} / month</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Your full name"
              value={form.tenantName}
              onChange={(e) => setForm((prev) => ({ ...prev, tenantName: e.target.value }))}
              required
            />
            <input
              className={inputClass}
              placeholder="Phone (10 digits)"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <label className="block text-[12px] text-muted-foreground">
              Move-in date
              <input
                type="date"
                className={`${inputClass} mt-1`}
                value={form.moveInDate}
                onChange={(e) => setForm((prev) => ({ ...prev, moveInDate: e.target.value }))}
              />
            </label>
          </div>

          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={state === "saving"}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "saving" ? "Submitting…" : "Submit booking request"}
          </button>
        </form>
      )}
    </Modal>
  );
}