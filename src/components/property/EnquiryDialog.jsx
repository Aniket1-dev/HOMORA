import { useState } from "react";
import { base44 } from "@/api/base44Client";
import Modal from "@/components/ui-bits/Modal";
import { addMyRequest } from "@/lib/guestStore";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

export default function EnquiryDialog({ open, onClose, property }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", moveInDate: "" });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const patch = (update) => setForm((prev) => ({ ...prev, ...update }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Enter a valid 10-digit phone number.");
    setState("saving");
    try {
      const created = await base44.entities.Enquiry.create({
        propertyId: property.id,
        propertyTitle: property.title,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        moveInDate: form.moveInDate || null,
        status: "new",
      });
      addMyRequest("enquiries", created.id);
      setState("done");
    } catch (err) {
      setError(err?.message || "Could not send your enquiry. Try again.");
      setState("idle");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send an enquiry"
      description={`Your message goes to the owner of ${property.title}. Contact details are only shared with them.`}
    >
      {state === "done" ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Enquiry sent.</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            The owner can now see your name and number. Most owners reply within a day — you'll find this enquiry in
            My activity.
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
          <input
            className={inputClass}
            placeholder="Your name"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Phone (10 digits)"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
          </div>
          <label className="block text-[12px] text-muted-foreground">
            Preferred move-in date
            <input
              type="date"
              className={`${inputClass} mt-1`}
              value={form.moveInDate}
              onChange={(e) => patch({ moveInDate: e.target.value })}
            />
          </label>
          <textarea
            className={`${inputClass} min-h-[96px]`}
            placeholder="Anything the owner should know? Occupancy, duration, questions about the deposit…"
            value={form.message}
            onChange={(e) => patch({ message: e.target.value })}
          />
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={state === "saving"}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "saving" ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      )}
    </Modal>
  );
}