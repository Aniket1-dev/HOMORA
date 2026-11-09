import { useState } from "react";
import { CATEGORY_OPTIONS } from "@/lib/constants";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

const defaults = {
  displayName: "",
  age: "",
  occupation: "student",
  organisation: "",
  city: "",
  locality: "",
  preferredCategory: "any",
  budgetMin: "",
  budgetMax: "",
  moveInDate: "",
  stayMonths: 12,
  sleepSchedule: "flexible",
  cleanliness: "average",
  social: "balanced",
  guestFrequency: "sometimes",
  noiseTolerance: "medium",
  foodHabit: "vegetarian",
  cooking: "sometimes",
  acUsage: "medium",
  smoker: false,
  drinks: false,
  pets: false,
  wfh: false,
  studyEnvironment: "balanced",
  bio: "",
  contactEmail: "",
};

const options = {
  occupation: [
    ["student", "Student"],
    ["professional", "Working professional"],
    ["other", "Other"],
  ],
  sleepSchedule: [
    ["early_bird", "Early riser"],
    ["night_owl", "Night owl"],
    ["flexible", "Flexible"],
  ],
  cleanliness: [
    ["relaxed", "Relaxed"],
    ["average", "Average"],
    ["very_tidy", "Very tidy"],
  ],
  social: [
    ["introvert", "Introvert"],
    ["balanced", "Balanced"],
    ["extrovert", "Extrovert"],
  ],
  guestFrequency: [
    ["rare", "Rarely"],
    ["sometimes", "Sometimes"],
    ["often", "Often"],
  ],
  noiseTolerance: [
    ["low", "Low — needs quiet"],
    ["medium", "Medium"],
    ["high", "High"],
  ],
  studyEnvironment: [
    ["quiet", "Quiet"],
    ["balanced", "Balanced"],
    ["lively", "Lively"],
  ],
  foodHabit: [
    ["vegetarian", "Vegetarian"],
    ["non_vegetarian", "Non-vegetarian"],
    ["eggetarian", "Eggetarian"],
    ["vegan", "Vegan"],
  ],
  cooking: [
    ["never", "Never"],
    ["sometimes", "Sometimes"],
    ["often", "Often"],
  ],
  acUsage: [
    ["low", "Low"],
    ["medium", "Medium"],
    ["high", "High"],
  ],
};

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
    <div className="mt-1.5">{children}</div>
    {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
  </label>
);

const Select = ({ name, value, onChange }) => (
  <select name={name} value={value} onChange={onChange} className={inputClass}>
    {options[name].map(([optionValue, label]) => (
      <option key={optionValue} value={optionValue}>
        {label}
      </option>
    ))}
  </select>
);

const Toggle = ({ label, name, value, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-[13px]">
    <input type="checkbox" name={name} checked={value} onChange={onChange} className="h-4 w-4 accent-accent" />
    {label}
  </label>
);

export default function ProfileWizard({ initial, onSubmit, submitLabel = "Publish my profile" }) {
  const [form, setForm] = useState({ ...defaults, ...(initial || {}) });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.displayName.trim().length < 2) return setError("Add your name so flatmates know who they're talking to.");
    if (!form.city.trim()) return setError("Add your city.");
    if (!form.budgetMax) return setError("Add the maximum monthly rent you can pay.");
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        age: form.age ? Number(form.age) : null,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : 0,
        budgetMax: Number(form.budgetMax),
        stayMonths: form.stayMonths ? Number(form.stayMonths) : null,
        moveInDate: form.moveInDate || null,
        paused: false,
      });
    } catch (err) {
      setError(err?.message || "Could not save your profile.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">About you</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input name="displayName" value={form.displayName} onChange={change} className={inputClass} placeholder="First name is fine" />
          </Field>
          <Field label="Age">
            <input name="age" type="number" min="16" max="99" value={form.age} onChange={change} className={inputClass} placeholder="22" />
          </Field>
          <Field label="Occupation">
            <Select name="occupation" value={form.occupation} onChange={change} />
          </Field>
          <Field label="College or workplace">
            <input name="organisation" value={form.organisation} onChange={change} className={inputClass} placeholder="e.g. KIET Group of Institutions" />
          </Field>
          <Field label="City">
            <input name="city" value={form.city} onChange={change} className={inputClass} placeholder="Ghaziabad" />
          </Field>
          <Field label="Preferred locality">
            <input name="locality" value={form.locality} onChange={change} className={inputClass} placeholder="Muradnagar" />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">Budget & timing</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Minimum budget (₹ / month)">
            <input name="budgetMin" type="number" value={form.budgetMin} onChange={change} className={inputClass} placeholder="7000" />
          </Field>
          <Field label="Maximum budget (₹ / month)">
            <input name="budgetMax" type="number" value={form.budgetMax} onChange={change} className={inputClass} placeholder="12000" />
          </Field>
          <Field label="Preferred move-in">
            <input name="moveInDate" type="date" value={form.moveInDate} onChange={change} className={inputClass} />
          </Field>
          <Field label="Expected stay (months)">
            <input name="stayMonths" type="number" value={form.stayMonths} onChange={change} className={inputClass} />
          </Field>
          <Field label="Looking for">
            <select name="preferredCategory" value={form.preferredCategory} onChange={change} className={inputClass}>
              <option value="any">Any accommodation</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">Daily rhythm</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">These drive most of the compatibility score.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Sleep schedule">
            <Select name="sleepSchedule" value={form.sleepSchedule} onChange={change} />
          </Field>
          <Field label="Cleanliness">
            <Select name="cleanliness" value={form.cleanliness} onChange={change} />
          </Field>
          <Field label="Social style">
            <Select name="social" value={form.social} onChange={change} />
          </Field>
          <Field label="Guests at home">
            <Select name="guestFrequency" value={form.guestFrequency} onChange={change} />
          </Field>
          <Field label="Noise you can live with">
            <Select name="noiseTolerance" value={form.noiseTolerance} onChange={change} />
          </Field>
          <Field label="Study / work environment">
            <Select name="studyEnvironment" value={form.studyEnvironment} onChange={change} />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">Living together</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Food habits">
            <Select name="foodHabit" value={form.foodHabit} onChange={change} />
          </Field>
          <Field label="Cooking at home">
            <Select name="cooking" value={form.cooking} onChange={change} />
          </Field>
          <Field label="AC usage">
            <Select name="acUsage" value={form.acUsage} onChange={change} />
          </Field>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Toggle label="I smoke" name="smoker" value={form.smoker} onChange={change} />
          <Toggle label="I drink occasionally" name="drinks" value={form.drinks} onChange={change} />
          <Toggle label="I have or want pets" name="pets" value={form.pets} onChange={change} />
          <Toggle label="I work from home often" name="wfh" value={form.wfh} onChange={change} />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Smoking, pets and budget are treated as hard constraints — a mismatch blocks the match instead of lowering the
          score.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">A line about you</h2>
        <div className="mt-4 space-y-3">
          <textarea
            name="bio"
            value={form.bio}
            onChange={change}
            rows={3}
            className={`${inputClass} min-h-[90px]`}
            placeholder="What's your routine like? What would a good flatmate know about you?"
          />
          <Field label="Contact email" hint="Only shown to people you have mutually accepted.">
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={change}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>
        </div>
      </section>

      {error && <p className="text-[12px] text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:w-auto"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}