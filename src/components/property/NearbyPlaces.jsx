import { Route, Clock } from "lucide-react";
import { nearbyPlaces } from "@/lib/nearby";

export default function NearbyPlaces({ lat, lng }) {
  const groups = nearbyPlaces(lat, lng);

  if (!groups.length) {
    return (
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        This listing has no map pin yet, so nearby landmarks cannot be estimated. Ask the owner for exact directions.
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{group.label}</p>
            <ul className="mt-2 space-y-2">
              {group.places.map((place) => (
                <li key={place.name} className="flex items-start justify-between gap-3 text-[13px]">
                  <span className="text-foreground/85">{place.name}</span>
                  <span className="shrink-0 text-right text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Route className="h-3 w-3" /> ≈{place.distanceKm.toFixed(1)} km
                    </span>
                    <span className="mt-0.5 flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" /> ≈{place.minutes} min drive
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Distances are straight-line estimates from the listing's map pin, converted to an approximate drive time at
        city speeds. They are not live traffic measurements — check the route before you visit.
      </p>
    </div>
  );
}