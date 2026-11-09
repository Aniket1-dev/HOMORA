import { useEffect } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { inr, inrCompact } from "@/lib/pricing";

const pinIcon = (rent) =>
  L.divIcon({
    className: "homora-pin",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:64px;height:24px;border-radius:999px;background:#7F11C0;color:#fff;font:700 11px/1 'Plus Jakarta Sans',system-ui,sans-serif;box-shadow:0 6px 16px rgba(24,12,36,0.28)">${inrCompact(rent)}</span>`,
    iconSize: [64, 24],
    iconAnchor: [32, 24],
  });

function Recenter({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

export default function PropertyMap({ properties, centre, zoom = 12 }) {
  return (
    <div className="relative isolate z-0 h-[330px] overflow-hidden rounded-3xl border border-border bg-muted sm:h-[460px]">
      <MapContainer center={[centre.lat, centre.lng]} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={centre.lat} lng={centre.lng} zoom={zoom} />
        {properties.map((property) => (
          <Marker key={property.id} position={[property.lat, property.lng]} icon={pinIcon(property.rent)}>
            <Popup>
              <p className="text-[12px] font-semibold">{property.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {property.locality}, {property.city}
              </p>
              <p className="mt-1 text-[12px] font-semibold">
                {inr(property.rent)}
                <span className="text-[10px] font-normal text-muted-foreground">
                  {property.rentUnit === "bed" ? " / bed / mo" : " / mo"}
                </span>
              </p>
              <Link
                to={`/property/${property.id}`}
                className="mt-1.5 inline-block text-[11px] font-semibold text-primary underline underline-offset-2"
              >
                View home
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}