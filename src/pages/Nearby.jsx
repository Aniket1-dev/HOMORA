import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { entities } from "@/services/entities";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/nearby/PropertyMap";
import NearbyControls from "@/components/nearby/NearbyControls";
import EmptyState from "@/components/ui-bits/EmptyState";
import { LANDMARKS, haversineKm } from "@/lib/nearby";

const INDIA_CENTRE = { lat: 22.9734, lng: 78.6569 };
const driveMinutes = (km) => Math.max(3, Math.round(km * 2.5 + 2));

export default function Nearby() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [maxRent, setMaxRent] = useState(60000);
  const [anchorId, setAnchorId] = useState("centre");
  const [radius, setRadius] = useState(12);
  const [locality, setLocality] = useState("");

  useEffect(() => {
    let active = true;
    const loadProperties = async () => {
      try {
        const page = await entities.Property.filter({ status: "published" }, { limit: 100 });
        if (!active) return;
        setProperties((page?.items || []).filter((item) => typeof item.lat === "number" && typeof item.lng === "number"));
      } finally {
        if (active) setLoading(false);
      }
    };
    const onSharedChange = (event) => {
      if (event.detail?.table === "properties") loadProperties().catch((error) => console.error("Nearby listings refresh failed", error));
    };
    loadProperties().catch((error) => console.error("Nearby listings load failed", error));
    window.addEventListener("homora:realtime-change", onSharedChange);
    return () => {
      active = false;
      window.removeEventListener("homora:realtime-change", onSharedChange);
    };
  }, []);

  const cities = useMemo(
    () => [...new Set(properties.map((item) => item.city).filter(Boolean))].sort(),
    [properties]
  );

  const landmarks = useMemo(
    () => LANDMARKS.filter((item) => !city || item.city === city),
    [city]
  );

  const anchor = useMemo(() => {
    if (anchorId !== "centre") {
      const found = LANDMARKS.find((item) => item.name === anchorId);
      if (found) return { lat: found.lat, lng: found.lng, label: found.name, isLandmark: true };
    }
    const pool = properties.filter((item) => !city || item.city === city);
    if (!pool.length) return { ...INDIA_CENTRE, label: "All listings", isLandmark: false };
    const lat = pool.reduce((sum, item) => sum + item.lat, 0) / pool.length;
    const lng = pool.reduce((sum, item) => sum + item.lng, 0) / pool.length;
    return { lat, lng, label: city ? `${city} centre` : "All listings", isLandmark: false };
  }, [anchorId, city, properties]);

  const results = useMemo(() => {
    const base = properties
      .filter((item) => !city || item.city === city)
      .filter((item) => !category || item.category === category)
      .filter((item) => Number(item.rent || 0) <= maxRent)
      .map((item) => ({ ...item, distanceKm: haversineKm(anchor.lat, anchor.lng, item.lat, item.lng) }));

    const scoped = anchor.isLandmark ? base.filter((item) => item.distanceKm <= radius) : base;
    const localised = locality ? scoped.filter((item) => item.locality === locality) : scoped;

    return localised.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [properties, city, category, maxRent, anchor, radius, locality]);

  const localities = useMemo(
    () => [...new Set(results.map((item) => item.locality).filter(Boolean))].slice(0, 8),
    [results]
  );

  const zoom = city ? 12 : 5;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Map & locality</p>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">Nearby you</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {loading ? "Loading listings…" : `${results.length} home${results.length === 1 ? "" : "s"} match · centred on ${anchor.label}`}
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground">
          <MapPin className="h-3.5 w-3.5" /> Owner-saved coordinates
        </p>
      </div>

      <div className="mt-5">
        <NearbyControls
          cities={cities}
          landmarks={landmarks}
          city={city}
          onCity={(value) => {
            setCity(value);
            setLocality("");
            setAnchorId("centre");
          }}
          category={category}
          onCategory={setCategory}
          maxRent={maxRent}
          onMaxRent={setMaxRent}
          anchorId={anchorId}
          onAnchor={setAnchorId}
          radius={radius}
          onRadius={setRadius}
        />
      </div>

      {loading ? (
        <div className="mt-5 h-[330px] animate-pulse rounded-3xl border border-border bg-card sm:h-[460px]" />
      ) : (
        <div className="mt-5">
          <PropertyMap properties={results} centre={anchor} zoom={zoom} />
        </div>
      )}

      {localities.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setLocality("")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
              locality ? "border border-border bg-card text-muted-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            All localities
          </button>
          {localities.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLocality(item === locality ? "" : item)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                locality === item ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-[320px] animate-pulse rounded-3xl border border-border bg-card" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title="Nothing in this radius"
            body="Widen the distance, raise the rent limit, or switch to another city."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                footer={
                  <div className="border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
                    {anchor.isLandmark
                      ? `${property.distanceKm.toFixed(1)} km from ${anchor.label} · ~${driveMinutes(property.distanceKm)} min drive`
                      : `${property.locality}, ${property.city}`}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        Pins use the coordinates owners saved when listing. Distances are straight-line estimates between those points,
        and drive times assume average city traffic — not live routing.
      </p>
    </div>
  );
}