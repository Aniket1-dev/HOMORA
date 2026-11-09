import { useState } from "react";
import { base44 } from "@/api/base44Client";
import Modal from "@/components/ui-bits/Modal";
import { addMyRequest } from "@/lib/guestStore";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

const slots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export default function VisitDialog({ open, onClose, property }) {
  const [form, setForm] = useState({
    visitorName: "",
    phone: "",
    email: "",
    date: tomorrow(),
    time: "11:00 AM",
    mode: "in_person",
    message: "",
  });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const patch = (update) => setForm((prev) => ({ ...prev, ...update }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.visitorName.trim().length < 2) return setError("Please enter your name.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Enter a valid 10-digit phone number.");
    if (!form.date) return setError("Choose a visit date.");
    setState("saving");
    try {
      const created = await base44.entities.Visit.create({
        propertyId: property.id,
        propertyTitle: property.title,
        visitorName: form.visitorName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        date: form.date,
        time: form.time,
        mode: form.mode,
        message: form.message.trim(),
        status: "requested",
      });
      addMyRequest("visits", created.id);
      setReference(created.id.slice(-6).toUpperCase());
      setState("done");
    } catch (err) {
      setError(err?.message || "Could not request this visit. Try again.");
      setState("idle");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a property visit"
      description="The owner confirms the slot. Nothing is booked until they respond."
    >
      {state === "done" ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Visit requested for {form.date} at {form.time}.</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Reference {reference}. The owner can confirm, reject or propose another slot — you'll see the status in My
            activity.
          </p>
          <p className="rounded-xl bg-secondary/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            Safety: visit during daylight, bring someone with you, and never pay a deposit before you have seen the
            property and signed an agreement.
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
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Your name"
              value={form.visitorName}
              onChange={(e) => patch({ visitorName: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Phone (10 digits)"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              required
            />
          </div>
          <input
            className={inputClass}
            placeholder="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[12px] text-muted-foreground">
              Date
              <input
                type="date"
                min={tomorrow()}
                className={`${inputClass} mt-1`}
                value={form.date}
                onChange={(e) => patch({ date: e.target.value })}
                required
              />
            </label>
            <label className="block text-[12px] text-muted-foreground">
              Slot
              <select
                className={`${inputClass} mt-1`}
                value={form.time}
                onChange={(e) => patch({ time: e.target.value })}
              >
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "in_person", label: "In person" },
              { value: "virtual", label: "Video call" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => patch({ mode: option.value })}
                className={`rounded-xl border px-3 py-2.5 text-[13px] transition ${
                  form.mode === option.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            placeholder="Anything to plan for? (optional)"
            value={form.message}
            onChange={(e) => patch({ message: e.target.value })}
          />
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={state === "saving"}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "saving" ? "Requesting…" : "Request visit"}
          </button>
        </form>
      )}
    </Modal>
  );
}