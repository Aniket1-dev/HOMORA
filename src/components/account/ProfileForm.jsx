import { useEffect, useState } from "react";
import { updateMyProfile } from "@/lib/auth";

const fields = [
  { key: "display_name", label: "Display name", placeholder: "How owners and roommates see you" },
  { key: "phone", label: "Phone", placeholder: "10-digit mobile number" },
  { key: "city", label: "City", placeholder: "Bengaluru" },
  { key: "organisation", label: "College or workplace", placeholder: "Optional" },
];

const occupations = [
  { value: "", label: "Not specified" },
  { value: "student", label: "Student" },
  { value: "professional", label: "Working professional" },
  { value: "other", label: "Other" },
];

export default function ProfileForm({ user, onSaved }) {
  const [form, setForm] = useState({ display_name: "", phone: "", city: "", organisation: "", occupation: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      display_name: user.display_name || user.full_name || "",
      phone: user.phone || "",
      city: user.city || "",
      organisation: user.organisation || "",
      occupation: user.occupation || "",
    });
  }, [user]);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setSaved(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateMyProfile(form);
      setSaved(true);
      if (onSaved) await onSaved();
    } catch (exception) {
      setError(exception.message || "Could not save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold">Personal details</h2>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Shared only when you send an enquiry or request a visit — never published on listings.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="text-[12px] font-medium text-foreground/80">{field.label}</span>
            <input
              type={field.key === "phone" ? "tel" : "text"}
              value={form[field.key]}
              onChange={set(field.key)}
              placeholder={field.placeholder}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-[13px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary"
            />
          </label>
        ))}

        <label className="block">
          <span className="text-[12px] font-medium text-foreground/80">I am a</span>
          <select
            value={form.occupation}
            onChange={set("occupation")}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-[13px] outline-none transition focus:border-primary"
          >
            {occupations.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-[12px] font-medium text-primary">Saved</span>}
      </div>
    </form>
  );
}