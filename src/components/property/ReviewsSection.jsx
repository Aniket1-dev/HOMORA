import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

function Stars({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-border"}`}
        />
      ))}
    </span>
  );
}

export default function ReviewsSection({ property, reviews, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ authorName: "", overall: 5, text: "" });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const name = user?.display_name || user?.full_name;
    if (name) setForm((prev) => (prev.authorName ? prev : { ...prev, authorName: name }));
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.authorName.trim().length < 2) return setError("Please add your name.");
    if (form.text.trim().length < 10) return setError("Add a little detail (at least 10 characters).");
    setState("saving");
    try {
      const created = await base44.entities.Review.create({
        propertyId: property.id,
        propertyTitle: property.title,
        authorName: form.authorName.trim(),
        overall: Number(form.overall),
        text: form.text.trim(),
        status: "published",
        verifiedVisit: false,
        verifiedTenancy: false,
      });
      setState("idle");
      setShowForm(false);
      setForm({ authorName: "", overall: 5, text: "" });
      onCreated?.(created);
    } catch (err) {
      setError(err?.message || "Could not publish your review.");
      setState("idle");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">
            {property.rating ? `${Number(property.rating).toFixed(1)} average` : "No rating yet"}
          </p>
          {property.reviewCount > 0 && (
            <span className="text-[12px] text-muted-foreground">· {property.reviewCount} reviews</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-border px-3.5 py-2 text-[13px] transition hover:shadow-soft"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Your name"
              value={form.authorName}
              onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
            />
            <label className="block text-[12px] text-muted-foreground">
              Overall rating
              <select
                className={`${inputClass} mt-1`}
                value={form.overall}
                onChange={(e) => setForm((prev) => ({ ...prev, overall: e.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <textarea
            className={`${inputClass} min-h-[90px]`}
            placeholder="What was accurate, what surprised you, what should the next tenant know?"
            value={form.text}
            onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
          />
          <p className="text-[11px] text-muted-foreground">
            Reviews are published immediately and moderated on report. A visit badge only appears when a confirmed visit
            exists.
          </p>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={state === "saving"}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {state === "saving" ? "Publishing…" : "Publish review"}
          </button>
        </form>
      )}

      <div className="mt-5 space-y-4">
        {reviews.length === 0 && (
          <p className="text-[13px] text-muted-foreground">No reviews yet. Be the first to describe this home.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-medium">{review.authorName}</p>
              <Stars value={review.overall} />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{review.text}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {review.verifiedVisit && (
                <span className="rounded-full bg-secondary px-2 py-0.5">Confirmed visit</span>
              )}
              {review.verifiedTenancy && (
                <span className="rounded-full bg-secondary px-2 py-0.5">Confirmed tenancy</span>
              )}
              <span>{new Date(review.created_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}