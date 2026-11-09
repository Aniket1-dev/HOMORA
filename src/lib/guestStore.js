// Guest-side preferences (saved listings, comparison, recent views, my submitted
// requests). Marketplace records always live in the database; this only keeps
// references for a visitor who has not signed in.
const KEYS = {
  saved: "nivas:saved",
  compare: "nivas:compare",
  recent: "nivas:recent",
  searches: "nivas:searches",
  profile: "nivas:roommate-profile",
  requests: "nivas:requests",
  connections: "nivas:connections",
  verification: "nivas:verification",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("nivas:storage"));
  return value;
}

export const getSaved = () => read(KEYS.saved, []);
export const isSaved = (id) => getSaved().includes(id);
export function toggleSaved(id) {
  const current = getSaved();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  return write(KEYS.saved, next);
}

export const getCompare = () => read(KEYS.compare, []);
export function toggleCompare(id) {
  const current = getCompare();
  if (current.includes(id)) return write(KEYS.compare, current.filter((x) => x !== id));
  if (current.length >= 4) return current;
  return write(KEYS.compare, [...current, id]);
}
export const clearCompare = () => write(KEYS.compare, []);

export function addRecentView(id) {
  const current = read(KEYS.recent, []).filter((x) => x !== id);
  return write(KEYS.recent, [id, ...current].slice(0, 8));
}
export const getRecentViews = () => read(KEYS.recent, []);

export function addRecentSearch(query) {
  if (!query || !query.trim()) return;
  const current = read(KEYS.searches, []).filter((x) => x !== query);
  write(KEYS.searches, [query, ...current].slice(0, 5));
}
export const getRecentSearches = () => read(KEYS.searches, []);

export const getMyProfileId = () => read(KEYS.profile, null);
export const setMyProfileId = (id) => write(KEYS.profile, id);

export const getMyRequests = () => read(KEYS.requests, { enquiries: [], visits: [], bookings: [] });
export function addMyRequest(kind, id) {
  const current = getMyRequests();
  const list = current[kind] || [];
  return write(KEYS.requests, { ...current, [kind]: [id, ...list] });
}

export const getMyConnections = () => read(KEYS.connections, []);
export function addMyConnection(id) {
  const current = getMyConnections();
  if (current.includes(id)) return current;
  return write(KEYS.connections, [id, ...current]);
}

export const getMyVerificationId = () => read(KEYS.verification, null);
export const setMyVerificationId = (id) => write(KEYS.verification, id);