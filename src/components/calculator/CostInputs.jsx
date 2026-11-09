const charges = [
  { key: "rent", label: "Monthly rent", hint: "Advertised amount" },
  { key: "deposit", label: "Security deposit", hint: "Usually refundable" },
  { key: "maintenance", label: "Maintenance", hint: "Per month" },
  { key: "electricity", label: "Electricity", hint: "Estimated per month" },
  { key: "food", label: "Food / mess", hint: "If not included" },
  { key: "wifi", label: "Wi-Fi", hint: "Per month" },
  { key: "laundry", label: "Laundry", hint: "Per month" },
  { key: "brokerage", label: "Brokerage", hint: "One-time" },
  { key: "oneTime", label: "Other one-time", hint: "Setup or maintenance deposit" },
];

export default function CostInputs({ values, onChange }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold">Charges you would actually pay</h2>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Start from a listing or enter your own numbers. Nothing here is saved.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {charges.map((field) => (
          <label key={field.key} className="block">
            <span className="text-[12px] font-medium text-foreground/80">{field.label}</span>
            <span className="mt-1.5 flex items-center rounded-xl border border-input bg-background px-3 focus-within:border-primary">
              <span className="text-[13px] text-muted-foreground">₹</span>
              <input
                type="number"
                min={0}
                step={500}
                inputMode="numeric"
                value={values[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="w-full bg-transparent px-2 py-2.5 text-[13px] outline-none"
              />
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">{field.hint}</span>
          </label>
        ))}

        <label className="block">
          <span className="text-[12px] font-medium text-foreground/80">Months staying</span>
          <select
            value={values.months}
            onChange={(event) => onChange("months", event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-[13px] outline-none focus:border-primary"
          >
            {[3, 6, 11, 12, 18, 24].map((month) => (
              <option key={month} value={month}>
                {month} months
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-muted-foreground">Typical agreements run 11 months</span>
        </label>

        <label className="block">
          <span className="text-[12px] font-medium text-foreground/80">Your monthly budget</span>
          <span className="mt-1.5 flex items-center rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <span className="text-[13px] text-muted-foreground">₹</span>
            <input
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              value={values.budget}
              onChange={(event) => onChange("budget", event.target.value)}
              placeholder="Optional"
              className="w-full bg-transparent px-2 py-2.5 text-[13px] outline-none"
            />
          </span>
          <span className="mt-1 block text-[11px] text-muted-foreground">Compares the all-in monthly total</span>
        </label>
      </div>
    </div>
  );
}