// Curated landmark dataset. Distances are straight-line estimates derived from
// coordinates and converted to an approximate drive time — never live traffic.
const PLACES = [
  { name: "KIET Group of Institutions", category: "education", city: "Ghaziabad", lat: 28.7522, lng: 77.4975 },
  { name: "IMS Engineering College", category: "education", city: "Ghaziabad", lat: 28.6796, lng: 77.4592 },
  { name: "Muradnagar Railway Station", category: "transport", city: "Ghaziabad", lat: 28.7796, lng: 77.4977 },
  { name: "Shaheed Sthal Metro Station", category: "transport", city: "Ghaziabad", lat: 28.6669, lng: 77.4385 },
  { name: "MMG District Hospital", category: "healthcare", city: "Ghaziabad", lat: 28.665, lng: 77.438 },
  { name: "Opulent Mall", category: "lifestyle", city: "Ghaziabad", lat: 28.667, lng: 77.44 },
  { name: "Raj Nagar Market", category: "daily", city: "Ghaziabad", lat: 28.6735, lng: 77.4435 },
  { name: "Noida Electronic City Metro", category: "transport", city: "Noida", lat: 28.628, lng: 77.375 },
  { name: "Amity University Noida", category: "education", city: "Noida", lat: 28.544, lng: 77.333 },
  { name: "Jaypee Hospital", category: "healthcare", city: "Noida", lat: 28.5355, lng: 77.36 },
  { name: "DLF Mall of India", category: "lifestyle", city: "Noida", lat: 28.5677, lng: 77.322 },
  { name: "Sector 18 Market", category: "daily", city: "Noida", lat: 28.57, lng: 77.326 },
  { name: "Delhi University North Campus", category: "education", city: "Delhi", lat: 28.688, lng: 77.209 },
  { name: "GTB Nagar Metro Station", category: "transport", city: "Delhi", lat: 28.698, lng: 77.207 },
  { name: "AIIMS Delhi", category: "healthcare", city: "Delhi", lat: 28.5672, lng: 77.21 },
  { name: "Hauz Khas Metro Station", category: "transport", city: "Delhi", lat: 28.5433, lng: 77.2066 },
  { name: "Connaught Place", category: "daily", city: "Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "Cyber Hub Gurugram", category: "daily", city: "Gurugram", lat: 28.4949, lng: 77.0895 },
  { name: "Huda City Centre Metro", category: "transport", city: "Gurugram", lat: 28.4595, lng: 77.0726 },
  { name: "Medanta Hospital", category: "healthcare", city: "Gurugram", lat: 28.438, lng: 77.04 },
  { name: "Sector 29 Market", category: "lifestyle", city: "Gurugram", lat: 28.47, lng: 77.065 },
  { name: "Manyata Tech Park", category: "education", city: "Bengaluru", lat: 13.045, lng: 77.62 },
  { name: "Indiranagar Metro", category: "transport", city: "Bengaluru", lat: 12.9784, lng: 77.6408 },
  { name: "Christ University", category: "education", city: "Bengaluru", lat: 12.936, lng: 77.606 },
  { name: "Forum Mall Koramangala", category: "lifestyle", city: "Bengaluru", lat: 12.9345, lng: 77.6111 },
  { name: "ITPL Whitefield", category: "education", city: "Bengaluru", lat: 12.985, lng: 77.736 },
  { name: "Kempegowda Airport", category: "transport", city: "Bengaluru", lat: 13.1986, lng: 77.7066 },
  { name: "KSR Bengaluru City Railway", category: "transport", city: "Bengaluru", lat: 12.977, lng: 77.57 },
  { name: "Manipal Hospital Old Airport Road", category: "healthcare", city: "Bengaluru", lat: 12.959, lng: 77.649 },
  { name: "Andheri Railway Station", category: "transport", city: "Mumbai", lat: 19.1197, lng: 72.8468 },
  { name: "Bandra Kurla Complex", category: "education", city: "Mumbai", lat: 19.065, lng: 72.868 },
  { name: "IIT Bombay", category: "education", city: "Mumbai", lat: 19.1334, lng: 72.917 },
  { name: "Hiranandani Gardens Powai", category: "daily", city: "Mumbai", lat: 19.117, lng: 72.906 },
  { name: "Mumbai Airport T2", category: "transport", city: "Mumbai", lat: 19.0896, lng: 72.8656 },
  { name: "Hinjewadi IT Park", category: "education", city: "Pune", lat: 18.5913, lng: 73.7389 },
  { name: "Savitribai Phule Pune University", category: "education", city: "Pune", lat: 18.5529, lng: 73.8258 },
  { name: "Koregaon Park", category: "lifestyle", city: "Pune", lat: 18.5362, lng: 73.894 },
  { name: "Pune Railway Station", category: "transport", city: "Pune", lat: 18.5285, lng: 73.874 },
  { name: "Hitec City", category: "education", city: "Hyderabad", lat: 17.4435, lng: 78.3772 },
  { name: "IIIT Hyderabad", category: "education", city: "Hyderabad", lat: 17.4456, lng: 78.3498 },
  { name: "Inorbit Mall Madhapur", category: "lifestyle", city: "Hyderabad", lat: 17.434, lng: 78.386 },
  { name: "Gachibowli Metro", category: "transport", city: "Hyderabad", lat: 17.4401, lng: 78.3489 },
];

export const LANDMARKS = PLACES;

export const NEARBY_GROUPS = [
  { key: "education", label: "Education" },
  { key: "transport", label: "Transport" },
  { key: "healthcare", label: "Healthcare" },
  { key: "daily", label: "Daily needs" },
  { key: "lifestyle", label: "Lifestyle" },
];

const toRad = (value) => (value * Math.PI) / 180;

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ~24 km/h average urban speed plus a short buffer; explicitly an estimate.
const driveMinutes = (km) => Math.max(3, Math.round(km * 2.5 + 2));

export function nearbyPlaces(lat, lng, { maxKm = 12, limit = 3 } = {}) {
  if (typeof lat !== "number" || typeof lng !== "number") return [];
  const scored = PLACES.map((place) => {
    const distanceKm = haversineKm(lat, lng, place.lat, place.lng);
    return { ...place, distanceKm, minutes: driveMinutes(distanceKm) };
  })
    .filter((place) => place.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const grouped = {};
  for (const place of scored) {
    if (!grouped[place.category]) grouped[place.category] = [];
    if (grouped[place.category].length < limit) grouped[place.category].push(place);
  }
  return NEARBY_GROUPS.filter((group) => grouped[group.key]).map((group) => ({
    ...group,
    places: grouped[group.key],
  }));
}

export function nearest(lat, lng, category) {
  const matches = nearbyPlaces(lat, lng, { maxKm: 25, limit: 1 }).find((g) => g.key === category);
  return matches?.places?.[0] || null;
}