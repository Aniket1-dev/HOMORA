import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Modal from "@/components/ui-bits/Modal";
import StatusPill from "@/components/ui-bits/StatusPill";
import { inr } from "@/lib/pricing";

const inputClass = "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[13px] outline-none";

const bedStatuses = ["available", "reserved", "occupied", "maintenance"];

export default function RoomsManager({ property, open, onClose, onRefresh }) {
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [form, setForm] = useState({ roomNumber: "", roomType: "double", totalBeds: 2, rentPerBed: property?.rent || "", ac: false, attachedBathroom: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!property) return;
    const [roomPage, bedPage] = await Promise.all([
      base44.entities.Room.filter({ propertyId: property.id }, { sort: "roomNumber", limit: 60 }),
      base44.entities.Bed.filter({ propertyId: property.id }, { sort: "bedNumber", limit: 200 }),
    ]);
    setRooms(roomPage?.items || []);
    setBeds(bedPage?.items || []);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, property?.id]);

  if (!property) return null;

  const addRoom = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.roomNumber.trim()) return setError("Add a room number.");
    const totalBeds = Number(form.totalBeds) || 1;
    if (totalBeds < 1) return setError("A room needs at least one bed.");
    setSaving(true);
    const room = await base44.entities.Room.create({
      propertyId: property.id,
      roomNumber: form.roomNumber.trim(),
      roomType: form.roomType,
      totalBeds,
      availableBeds: totalBeds,
      occupiedBeds: 0,
      reservedBeds: 0,
      rentPerBed: Number(form.rentPerBed) || property.rent,
      ac: form.ac,
      attachedBathroom: form.attachedBathroom,
      status: "available",
    });
    await base44.entities.Bed.bulkCreate(
      Array.from({ length: totalBeds }).map((_, index) => ({
        propertyId: property.id,
        roomId: room.id,
        roomNumber: room.roomNumber,
        bedNumber: `${room.roomNumber}-${String.fromCharCode(65 + index)}`,
        monthlyRent: Number(form.rentPerBed) || property.rent,
        status: "available",
      }))
    );
    await base44.entities.Property.update(property.id, {
      totalBeds: (property.totalBeds || 0) + totalBeds,
      availableBeds: (property.availableBeds || 0) + totalBeds,
    });
    setForm({ roomNumber: "", roomType: "double", totalBeds: 2, rentPerBed: property.rent || "", ac: false, attachedBathroom: false });
    await load();
    await onRefresh?.();
    setSaving(false);
  };

  const setBedStatus = async (bed, status) => {
    await base44.entities.Bed.update(bed.id, { status });
    await load();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={`Rooms & beds — ${property.title}`}
      description="Each bed is an independent, bookable unit. Marking a bed occupied removes it from availability."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          {rooms.length === 0 && (
            <p className="text-[13px] text-muted-foreground">No rooms yet. Add the first room below.</p>
          )}
          {rooms.map((room) => (
            <div key={room.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] font-medium">
                  Room {room.roomNumber} · <span className="capitalize text-muted-foreground">{room.roomType}</span>
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <StatusPill status={room.status} />
                  <span>{room.availableBeds}/{room.totalBeds} free</span>
                  <span>{inr(room.rentPerBed)} / bed</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {beds
                  .filter((bed) => bed.roomId === room.id)
                  .map((bed) => (
                    <select
                      key={bed.id}
                      value={bed.status}
                      onChange={(e) => setBedStatus(bed, e.target.value)}
                      aria-label={`Bed ${bed.bedNumber} status`}
                      className={`rounded-lg border px-2 py-1 text-[11px] capitalize ${
                        bed.status === "available"
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {bedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {bed.bedNumber} · {status}
                        </option>
                      ))}
                    </select>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addRoom} className="rounded-xl border border-border bg-background p-4">
          <p className="text-[13px] font-medium">Add a room</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <label className="text-[11px] text-muted-foreground">
              Room no.
              <input
                className={`${inputClass} mt-1`}
                value={form.roomNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
                placeholder="101"
              />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Type
              <select
                className={`${inputClass} mt-1`}
                value={form.roomType}
                onChange={(e) => setForm((prev) => ({ ...prev, roomType: e.target.value }))}
              >
                {["single", "double", "triple", "four", "dorm"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-muted-foreground">
              Beds
              <input
                type="number"
                min="1"
                className={`${inputClass} mt-1`}
                value={form.totalBeds}
                onChange={(e) => setForm((prev) => ({ ...prev, totalBeds: e.target.value }))}
              />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Rent / bed
              <input
                type="number"
                className={`${inputClass} mt-1`}
                value={form.rentPerBed}
                onChange={(e) => setForm((prev) => ({ ...prev, rentPerBed: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={form.ac}
                onChange={(e) => setForm((prev) => ({ ...prev, ac: e.target.checked }))}
                className="h-3.5 w-3.5 accent-accent"
              />
              AC
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={form.attachedBathroom}
                onChange={(e) => setForm((prev) => ({ ...prev, attachedBathroom: e.target.checked }))}
                className="h-3.5 w-3.5 accent-accent"
              />
              Attached bathroom
            </label>
          </div>
          {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="mt-3 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add room and beds"}
          </button>
        </form>
      </div>
    </Modal>
  );
}