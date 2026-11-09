export const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const inrCompact = (value) => {
  const amount = Number(value || 0);
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `₹${amount}`;
};

const n = (value) => (typeof value === "number" ? value : 0);

/**
 * Estimated recurring monthly cost. Every component is either the advertised
 * amount or an explicit estimate — never presented as a confirmed bill.
 */
export function monthlyCost(property) {
  const parts = [
    { key: "rent", label: "Monthly rent", amount: n(property.rent), note: "Advertised" },
    { key: "maintenance", label: "Maintenance", amount: n(property.maintenance), note: "Monthly" },
    { key: "electricity", label: "Electricity", amount: n(property.electricity), note: "Estimated" },
    { key: "water", label: "Water", amount: n(property.water), note: "Estimated" },
    { key: "food", label: "Food / mess", amount: n(property.foodCharges), note: "Monthly" },
    { key: "wifi", label: "Wi-Fi", amount: n(property.wifiCharges), note: "Monthly" },
    { key: "laundry", label: "Laundry", amount: n(property.laundryCharges), note: "Monthly" },
    { key: "parking", label: "Parking", amount: n(property.parkingCharges), note: "Monthly" },
    { key: "other", label: "Other recurring", amount: n(property.otherCharges), note: "Monthly" },
  ].filter((part) => part.amount > 0);

  const total = parts.reduce((sum, part) => sum + part.amount, 0);
  const fixed = parts
    .filter((part) => !["electricity", "water", "other"].includes(part.key))
    .reduce((sum, part) => sum + part.amount, 0);

  return { parts, total, fixed, variable: total - fixed };
}

export function moveInCost(property) {
  const recurring = monthlyCost(property);
  const parts = [
    { key: "deposit", label: "Security deposit", amount: n(property.deposit), refundable: property.depositRefundable !== false },
    { key: "rent", label: "First month rent", amount: n(property.rent), refundable: false },
    { key: "brokerage", label: "Brokerage", amount: n(property.brokerage), refundable: false },
    {
      key: "onetime",
      label: "One-time charges",
      amount: n(property.maintenanceDeposit) + n(property.oneTimeCharges),
      refundable: false,
    },
  ].filter((part) => part.amount > 0);

  const total = parts.reduce((sum, part) => sum + part.amount, 0);
  const refundable = parts.filter((p) => p.refundable).reduce((sum, p) => sum + p.amount, 0);

  return { parts, total, refundable, netOfDeposit: total - refundable, firstMonth: recurring.total };
}

export function costVerdict(property, budgetMax) {
  const { total } = monthlyCost(property);
  if (!budgetMax) return null;
  if (total <= budgetMax) return { tone: "good", label: "Within your budget" };
  if (total <= budgetMax * 1.12) return { tone: "warn", label: "Slightly above budget" };
  return { tone: "bad", label: "Above your budget" };
}