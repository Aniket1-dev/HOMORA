export const CATEGORY_LABELS = {
  hostel: "Hostel",
  pg: "PG / Co-living",
  flat: "Flat / Apartment",
  house: "Independent house",
  shared: "Shared room",
};

export const CATEGORY_OPTIONS = [
  { value: "hostel", label: "Hostel" },
  { value: "pg", label: "PG / Co-living" },
  { value: "flat", label: "Flat / Apartment" },
  { value: "house", label: "Independent house" },
  { value: "shared", label: "Shared room" },
];

export const GENDER_LABELS = {
  boys: "Boys",
  girls: "Girls",
  coed: "Co-living",
  family: "Family",
  any: "No restriction",
};

export const SHARING_LABELS = {
  single: "Single occupancy",
  double: "Double sharing",
  triple: "Triple sharing",
  four: "Four sharing",
  any: "Any sharing",
};

export const AMENITIES = [
  "Wi-Fi",
  "AC",
  "Geyser",
  "Refrigerator",
  "Washing machine",
  "Water purifier",
  "Power backup",
  "Lift",
  "CCTV",
  "Security guard",
  "Parking",
  "Gym",
  "Swimming pool",
  "Balcony",
  "Garden",
  "Kitchen",
  "Housekeeping",
  "Laundry",
  "Mess",
  "Drinking water",
  "Study room",
  "Common area",
  "Fire safety",
  "First aid",
  "Wheelchair access",
  "Pet friendly",
];

export const FILTER_AMENITIES = [
  "Wi-Fi",
  "AC",
  "Mess",
  "Kitchen",
  "Laundry",
  "Housekeeping",
  "Parking",
  "Lift",
  "Power backup",
  "CCTV",
  "Security guard",
  "Gym",
  "Study room",
  "Pet friendly",
];

export const OWNER_TYPES = [
  { value: "individual", label: "Individual property owner" },
  { value: "hostel_operator", label: "Hostel operator" },
  { value: "pg_operator", label: "PG operator" },
  { value: "management_company", label: "Property management company" },
  { value: "authorized_manager", label: "Authorized property manager" },
];

export const STATUS_STYLES = {
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  draft: "bg-secondary text-muted-foreground",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  suspended: "bg-red-500/10 text-red-700 dark:text-red-400",
  archived: "bg-secondary text-muted-foreground",
  open: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  investigating: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  dismissed: "bg-secondary text-muted-foreground",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  info_requested: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  requested: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confirmed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-secondary text-muted-foreground",
  new: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  contacted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  converted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending_connection: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export const CITIES = ["Ghaziabad", "Noida", "Delhi", "Gurugram", "Bengaluru", "Mumbai", "Pune", "Hyderabad"];