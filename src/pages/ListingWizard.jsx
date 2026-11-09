import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { steps, emptyListing, numericFields } from "@/components/listing/wizardSchema";
import RoomsEditor from "@/components/listing/RoomsEditor";
import MediaUploader from "@/components/listing/MediaUploader";
import { inr } from "@/lib/pricing";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

const requiresRooms = ["hostel", "pg", "shared"];

export default function ListingWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...emptyListing });
  const [rooms, setRooms] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    if (!id) return;
    base44.entities.Property.get(id)
      .then((property) => {
        setForm({ ...emptyListing, ...property, availableFrom: property.availableFrom?.slice(0, 10) || "" });
      })
      .catch(() => setError("Could not load this listing."));
  }, [id]);

  const patch = (update) => setForm((prev) => ({ ...prev, ...update }));

  const allSteps = [
    ...steps.slice(0, 4),
    ...(requiresRooms.includes(form.category) ? [{ key: "rooms", title: "Rooms & beds", description: "Individual rooms and the beds inside them." }] : []),
    ...steps.slice(4),
    { key: "media", title: "Photos", description: "The first photo becomes the cover image." },
    { key: "review", title: "Review & submit", description: "Check everything before sending it to moderation." },
  ];

  const step = allSteps[Math.min(index, allSteps.length - 1)];

  const validateStep = () => {
    const fields = step.fields || [];
    const missing = fields.find((field) => field.required && !String(form[field.name] || "").trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return false;
    }
    setError("");
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setIndex((prev) => Math.min(prev + 1, allSteps.length - 1));
  };

  const save = async (status) => {
    setError("");
    if (!form.title.trim()) {
      setError("Add a listing title before saving.");
      setIndex(0);
      return;
    }
    if (status === "pending" && (!form.city.trim() || !form.rent)) {
      setError("A city and monthly rent are required before submitting for moderation.");
      setIndex(0);
      return;
    }
    setSaving(status);
    try {
      const payload = { status };
      for (const [key, value] of Object.entries(form)) {
        if (numericFields.includes(key)) {
          payload[key] = value === "" || value === null || value === undefined ? null : Number(value);
        } else if (Array.isArray(value)) {
          payload[key] = value;
        } else if (typeof value === "boolean") {
          payload[key] = value;
        } else {
          payload[key] = value === "" || value === undefined ? null : value;
        }
      }
      if (!payload.ownerVerified) payload.ownerVerified = false;

      if (id) {
        await base44.entities.Property.update(id, payload);
      } else {
        const created = await base44.entities.Property.create(payload);
        for (const room of rooms) {
          const roomRecord = await base44.entities.Room.create({
            propertyId: created.id,
            roomNumber: room.roomNumber,
            floor: Number(room.floor) || 0,
            roomType: room.roomType,
            totalBeds: Number(room.totalBeds) || 1,
            availableBeds: Number(room.totalBeds) || 1,
            occupiedBeds: 0,
            reservedBeds: 0,
            rentPerBed: Number(room.rentPerBed || form.rent) || 0,
            ac: !!room.ac,
            attachedBathroom: !!room.attachedBathroom,
            status: "available",
          });
          const beds = Array.from({ length: Number(room.totalBeds) || 1 }).map((_, bedIndex) => ({
            propertyId: created.id,
            roomId: roomRecord.id,
            roomNumber: room.roomNumber,
            bedNumber: `${room.roomNumber}-${String.fromCharCode(65 + bedIndex)}`,
            monthlyRent: Number(room.rentPerBed || form.rent) || 0,
            status: "available",
          }));
          await base44.entities.Bed.bulkCreate(beds);
        }
        if (rooms.length) {
          const totalBeds = rooms.reduce((sum, room) => sum + (Number(room.totalBeds) || 0), 0);
          await base44.entities.Property.update(created.id, { totalBeds, availableBeds: totalBeds });
        }
      }
      navigate("/owner");
    } catch (err) {
      setError(err?.message || "Could not save this listing.");
      setSaving("");
    }
  };

  const renderField = (field) => {
    const value = form[field.name] ?? "";
    const common = { id: field.name, className: inputClass };

    if (field.type === "textarea") {
      return <textarea {...common} rows={field.rows || 3} value={value} onChange={(e) => patch({ [field.name]: e.target.value })} placeholder={field.placeholder} />;
    }
    if (field.type === "select") {
      return (
        <select {...common} value={value} onChange={(e) => patch({ [field.name]: e.target.value })}>
          {field.options.map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "toggle") {
      return (
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => patch({ [field.name]: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          {field.label}
        </label>
      );
    }
    if (field.type === "checkgroup") {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.options.map(([optionValue, label]) => {
            const active = selected.includes(optionValue);
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() =>
                  patch({
                    [field.name]: active ? selected.filter((item) => item !== optionValue) : [...selected, optionValue],
                  })
                }
                className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                  active ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      );
    }
    return (
      <input
        {...common}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        step={field.step}
        value={value || ""}
        onChange={(e) => patch({ [field.name]: e.target.value })}
        placeholder={field.placeholder}
      />
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => navigate("/owner")} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Owner workspace
        </button>
        <span className="text-[12px] text-muted-foreground">
          Step {index + 1} of {allSteps.length}
        </span>
      </div>

      <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
        {id ? "Edit listing" : "List a property"}
      </h1>
      <p className="mt-1 text-[13px] text-muted-foreground">{step.title} · {step.description}</p>

      <div className="mt-5 flex gap-1">
        {allSteps.map((item, itemIndex) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={item.title}
            className={`h-1.5 flex-1 rounded-full transition ${itemIndex <= index ? "bg-accent" : "bg-secondary"}`}
          />
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
        {step.key === "rooms" && <RoomsEditor rooms={rooms} onChange={setRooms} />}

        {step.key === "media" && (
          <MediaUploader images={form.images || []} onChange={(images) => patch({ images })} />
        )}

        {step.key === "review" && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {form.images?.[0] ? (
                <img src={form.images[0]} alt="" className="h-24 w-32 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-24 w-32 items-center justify-center rounded-2xl bg-secondary text-[11px] text-muted-foreground">
                  No cover photo
                </div>
              )}
              <div>
                <p className="text-[15px] font-semibold">{form.title || "Untitled listing"}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {form.locality ? `${form.locality}, ` : ""}
                  {form.city || "City not set"} · {form.category}
                </p>
                <p className="mt-2 text-[13px] font-medium">
                  {form.rent ? `${inr(form.rent)} / month` : "Rent not set"}
                  {form.deposit ? ` · ${inr(form.deposit)} deposit` : ""}
                </p>
              </div>
            </div>

            <dl className="grid gap-2 sm:grid-cols-2">
              {[
                ["Amenities", (form.amenities || []).length ? `${form.amenities.length} selected` : "None"],
                ["Rooms", rooms.length ? `${rooms.length} rooms · ${rooms.reduce((sum, room) => sum + (Number(room.totalBeds) || 0), 0)} beds` : "No rooms added"],
                ["Photos", `${(form.images || []).length} uploaded`],
                ["Available from", form.availableFrom || "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-[13px]">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="rounded-xl bg-secondary/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Submitting sends this listing to moderation. It becomes visible to tenants only after an administrator
              approves it — and a verified badge only appears once owner documents are approved.
            </p>
          </div>
        )}

        {step.fields && (
          <div className="grid gap-3 sm:grid-cols-2">
            {step.fields.map((field) => (
              <label key={field.name} className={`block ${field.full ? "sm:col-span-2" : ""}`}>
                {field.type !== "toggle" && field.type !== "checkgroup" && (
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                )}
                <div className={field.type === "toggle" || field.type === "checkgroup" ? "" : "mt-1.5"}>
                  {renderField(field)}
                </div>
              </label>
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-[12px] text-destructive">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((prev) => prev - 1)}
                className="rounded-xl border border-border px-4 py-2.5 text-[13px]"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save("draft")}
              disabled={!!saving}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] disabled:opacity-60"
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>
            {index < allSteps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => save("pending")}
                disabled={!!saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" /> {saving === "pending" ? "Submitting…" : "Submit for moderation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}