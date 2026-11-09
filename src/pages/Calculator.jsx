import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import CostInputs from "@/components/calculator/CostInputs";
import CostSummary from "@/components/calculator/CostSummary";

const defaults = {
  rent: 15000,
  deposit: 30000,
  maintenance: 1500,
  electricity: 1200,
  food: 0,
  wifi: 500,
  laundry: 0,
  brokerage: 0,
  oneTime: 0,
  months: 11,
  budget: "",
};

const num = (value) => Number(value) || 0;

const fromProperty = (property) => ({
  rent: num(property.rent),
  deposit: num(property.deposit),
  maintenance: num(property.maintenance),
  electricity: num(property.electricity),
  food: num(property.foodCharges),
  wifi: num(property.wifiCharges),
  laundry: num(property.laundryCharges),
  brokerage: num(property.brokerage),
  oneTime: num(property.maintenanceDeposit) + num(property.oneTimeCharges),
  months: 11,
  budget: "",
});

export default function Calculator() {
  const [values, setValues] = useState(defaults);
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    base44.entities.Property.filter({ status: "published" }, { sort: "-created_date", limit: 50 }).then((page) =>
      setListings(page?.items || [])
    );
    const requested = new URLSearchParams(window.location.search).get("property");
    if (requested) {
      base44.entities.Property.get(requested)
        .then((property) => {
          setValues(fromProperty(property));
          setSelectedId(property.id);
        })
        .catch(() => {});
    }
  }, []);

  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const pickListing = (id) => {
    setSelectedId(id);
    const found = listings.find((item) => item.id === id);
    if (found) setValues(fromProperty(found));
  };

  const recurring =
    num(values.rent) +
    num(values.maintenance) +
    num(values.electricity) +
    num(values.food) +
    num(values.wifi) +
    num(values.laundry);
  const moveIn = num(values.rent) + num(values.deposit) + num(values.brokerage) + num(values.oneTime);
  const months = num(values.months) || 11;
  const firstYear = moveIn + recurring * months;
  const budget = num(values.budget);
  const verdict = !budget
    ? null
    : recurring <= budget
      ? { tone: "good", label: "Within your monthly budget" }
      : recurring <= budget * 1.12
        ? { tone: "warn", label: "Slightly above your budget" }
        : { tone: "bad", label: "Above your budget" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Plan your money</p>
      <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">Rent & expense calculator</h1>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
        Rent is never the whole cost. Add the extras owners quote separately to see what a home really costs each month —
        and what it takes to move in.
      </p>

      <div className="mt-6 max-w-md">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Start from a listing
          </span>
          <select
            value={selectedId}
            onChange={(event) => pickListing(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-[13px] outline-none focus:border-primary"
          >
            <option value="">Enter my own numbers</option>
            {listings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} — {item.city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <CostInputs values={values} onChange={set} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CostSummary
            recurring={recurring}
            moveIn={moveIn}
            firstYear={firstYear}
            perDay={Math.round(recurring / 30)}
            deposit={num(values.deposit)}
            months={months}
            verdict={verdict}
          />
        </div>
      </div>
    </div>
  );
}