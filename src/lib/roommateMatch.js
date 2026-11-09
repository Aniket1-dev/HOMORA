// Roommate compatibility scoring. Hard blockers run first; only profiles that
// clear them get scored. Every weight is visible to the user.
export const WEIGHTS = {
  budget: 20,
  lifestyle: 20,
  location: 15,
  sleep: 10,
  cleanliness: 10,
  routine: 10,
  moveIn: 10,
  food: 5,
};

const BUDGET_BUCKET = 2500;

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

function budgetScore(a, b) {
  const aMin = a.budgetMin || 0;
  const aMax = a.budgetMax || aMin;
  const bMin = b.budgetMin || 0;
  const bMax = b.budgetMax || bMin;
  const overlap = Math.min(aMax, bMax) - Math.max(aMin, bMin);
  if (overlap < 0) return 0;
  const width = Math.max(aMax - aMin, bMax - bMin, BUDGET_BUCKET);
  return clamp(Math.round((overlap / width) * 100));
}

const exact = (a, b, partial = 70) => {
  if (!a || !b) return 75;
  return a === b ? 100 : partial;
};

function lifestyleScore(a, b) {
  const social = { introvert: 0, balanced: 1, extrovert: 2 };
  const diff = Math.abs((social[a.social] ?? 1) - (social[b.social] ?? 1));
  const socialScore = [100, 72, 38][diff] ?? 70;

  const guests = { rare: 0, sometimes: 1, often: 2 };
  const guestDiff = Math.abs((guests[a.guestFrequency] ?? 1) - (guests[b.guestFrequency] ?? 1));
  const guestScore = [100, 70, 35][guestDiff] ?? 70;

  const noise = { low: 0, medium: 1, high: 2 };
  const noiseDiff = Math.abs((noise[a.noiseTolerance] ?? 1) - (noise[b.noiseTolerance] ?? 1));
  const noiseScore = [100, 78, 45][noiseDiff] ?? 70;

  const studyScore = exact(a.studyEnvironment, b.studyEnvironment, 65);

  return clamp(Math.round(socialScore * 0.3 + guestScore * 0.25 + noiseScore * 0.2 + studyScore * 0.25));
}

function locationScore(a, b) {
  if (!a.city || !b.city) return 70;
  if (a.city.toLowerCase() !== b.city.toLowerCase()) return 20;
  if (a.locality && b.locality && a.locality.toLowerCase() === b.locality.toLowerCase()) return 100;
  return 72;
}

function sleepScore(a, b) {
  if (!a.sleepSchedule || !b.sleepSchedule) return 75;
  if (a.sleepSchedule === b.sleepSchedule) return 100;
  if (a.sleepSchedule === "flexible" || b.sleepSchedule === "flexible") return 78;
  return 35;
}

function cleanlinessScore(a, b) {
  const order = { relaxed: 0, average: 1, very_tidy: 2 };
  const diff = Math.abs((order[a.cleanliness] ?? 1) - (order[b.cleanliness] ?? 1));
  return [100, 72, 35][diff] ?? 70;
}

function routineScore(a, b) {
  const occupation = exact(a.occupation, b.occupation, 68);
  const wfh = a.wfh === b.wfh ? 100 : 70;
  const cooking = exact(a.cooking, b.cooking, 70);
  return clamp(Math.round(occupation * 0.5 + wfh * 0.25 + cooking * 0.25));
}

function moveInScore(a, b) {
  if (!a.moveInDate || !b.moveInDate) return 80;
  const diffDays = Math.abs(new Date(a.moveInDate) - new Date(b.moveInDate)) / 86400000;
  if (diffDays <= 14) return 100;
  if (diffDays <= 45) return 82;
  if (diffDays <= 90) return 55;
  return 25;
}

function foodScore(a, b) {
  if (!a.foodHabit || !b.foodHabit) return 80;
  if (a.foodHabit === b.foodHabit) return 100;
  const group = (habit) => (["vegetarian", "vegan"].includes(habit) ? "veg" : "nonveg");
  return group(a.foodHabit) === group(b.foodHabit) ? 78 : 52;
}

export function findBlockers(a, b) {
  const blockers = [];
  const budgetA = a.budgetMax || 0;
  const budgetB = b.budgetMax || 0;
  const minA = a.budgetMin || 0;
  const minB = b.budgetMin || 0;
  if (budgetA && budgetB && Math.min(budgetA, budgetB) < Math.max(minA, minB)) {
    blockers.push("Budget ranges do not overlap");
  }
  if (a.smoker !== b.smoker) blockers.push("Different smoking preferences");
  if (a.pets !== b.pets) blockers.push("Different pet preferences");
  if (a.moveInDate && b.moveInDate) {
    const diffDays = Math.abs(new Date(a.moveInDate) - new Date(b.moveInDate)) / 86400000;
    if (diffDays > 120) blockers.push("Move-in dates are more than 4 months apart");
  }
  return blockers;
}

const LABELS = {
  budget: "Budget",
  lifestyle: "Lifestyle",
  location: "Location",
  sleep: "Sleep schedule",
  cleanliness: "Cleanliness",
  routine: "Routine",
  moveIn: "Move-in date",
  food: "Food habits",
};

function describe(key, a, b) {
  const pair = {
    budget: [`₹${a.budgetMin || 0}–₹${a.budgetMax || 0}`, `₹${b.budgetMin || 0}–₹${b.budgetMax || 0}`],
    lifestyle: [`${a.social || "—"}, guests ${a.guestFrequency || "—"}`, `${b.social || "—"}, guests ${b.guestFrequency || "—"}`],
    location: [`${a.locality || a.city}`, `${b.locality || b.city}`],
    sleep: [a.sleepSchedule, b.sleepSchedule],
    cleanliness: [a.cleanliness, b.cleanliness],
    routine: [`${a.occupation}${a.wfh ? " · WFH" : ""}`, `${b.occupation}${b.wfh ? " · WFH" : ""}`],
    moveIn: [a.moveInDate, b.moveInDate],
    food: [a.foodHabit, b.foodHabit],
  }[key];
  return { key, label: LABELS[key], mine: String(pair[0] ?? "—"), theirs: String(pair[1] ?? "—") };
}

const scorers = {
  budget: budgetScore,
  lifestyle: lifestyleScore,
  location: locationScore,
  sleep: sleepScore,
  cleanliness: cleanlinessScore,
  routine: routineScore,
  moveIn: moveInScore,
  food: foodScore,
};

export function compatibility(me, other) {
  const blockers = findBlockers(me, other);
  const breakdown = Object.keys(WEIGHTS).map((key) => {
    const value = scorers[key](me, other);
    return { key, label: LABELS[key], weight: WEIGHTS[key], value, ...describe(key, me, other) };
  });

  const weighted = breakdown.reduce((sum, item) => sum + (item.value * item.weight) / 100, 0);
  const score = blockers.length ? 0 : Math.round(weighted);

  return {
    score,
    compatible: blockers.length === 0,
    blockers,
    breakdown,
    shared: breakdown.filter((item) => item.value >= 90).map((item) => item.label),
    differences: breakdown.filter((item) => item.value < 65).map((item) => item.label),
  };
}

export function matchTone(score) {
  if (score >= 85) return { label: "Excellent match", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  if (score >= 70) return { label: "Strong match", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" };
  if (score >= 55) return { label: "Worth exploring", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
  return { label: "Few overlaps", className: "bg-secondary text-muted-foreground" };
}