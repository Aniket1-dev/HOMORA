import { useState } from "react";

export default function Gallery({ images = [], title }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [];

  if (!list.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-border bg-muted text-sm text-muted-foreground">
        No photos provided
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-border bg-muted">
        <img src={list[active]} alt={`${title} — photo ${active + 1}`} className="aspect-[16/10] w-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {list.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                index === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}