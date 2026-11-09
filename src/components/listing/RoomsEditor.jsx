import { Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[13px] outline-none focus:border-accent";

const roomTypes = ["single", "double", "triple", "four", "dorm"];

export default function RoomsEditor({ rooms, onChange }) {
  const patch = (index, update) =>
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...update } : room)));

  const add = () =>
    onChange([...rooms, { roomNumber: `${101 + rooms.length}`, roomType: "double", totalBeds: 2, rentPerBed: "", ac: false, attachedBathroom: false }]);

  return (
    <div className="space-y-3">
      {rooms.length === 0 && (
        <p className="rounded-xl bg-secondary/70 px-3 py-2 text-[12px] text-muted-foreground">
          Add rooms to track individual beds. Each bed becomes bookable on its own.
        </p>
      )}

      {rooms.map((room, index) => (
        <div key={index} className="rounded-2xl border border-border p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <label className="text-[11px] text-muted-foreground">
              Room no.
              <input value={room.roomNumber} onChange={(e) => patch(index, { roomNumber: e.target.value })} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Type
              <select value={room.roomType} onChange={(e) => patch(index, { roomType: e.target.value })} className={`${inputClass} mt-1`}>
                {roomTypes.map((type) => (
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
                value={room.totalBeds}
                onChange={(e) => patch(index, { totalBeds: Number(e.target.value) })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Rent / bed
              <input
                type="number"
                value={room.rentPerBed}
                onChange={(e) => patch(index, { rentPerBed: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => onChange(rooms.filter((_, i) => i !== index))}
                className="mb-0.5 rounded-lg border border-border p-2 text-muted-foreground"
                aria-label="Remove room"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={!!room.ac}
                onChange={(e) => patch(index, { ac: e.target.checked })}
                className="h-3.5 w-3.5 accent-accent"
              />
              AC
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={!!room.attachedBathroom}
                onChange={(e) => patch(index, { attachedBathroom: e.target.checked })}
                className="h-3.5 w-3.5 accent-accent"
              />
              Attached bathroom
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-[13px] transition hover:shadow-soft"
      >
        <Plus className="h-3.5 w-3.5" /> Add a room
      </button>
    </div>
  );
}