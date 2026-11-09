import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StatusPill from "@/components/ui-bits/StatusPill";
import { OWNER_TYPES } from "@/lib/constants";
import { getMyVerificationId, setMyVerificationId } from "@/lib/guestStore";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";

const documentTypes = [
  ["ownership_deed", "Ownership deed / sale deed"],
  ["utility_bill", "Utility bill in owner's name"],
  ["rent_agreement", "Rent / lease agreement"],
  ["authorization_letter", "Owner authorization letter"],
  ["gst_registration", "GST registration (operator)"],
];

export default function OwnerVerificationPage() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    ownerName: "",
    businessName: "",
    ownerType: "individual",
    email: "",
    phone: "",
    city: "",
    propertyCount: 1,
    documentType: "ownership_deed",
    documentUri: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedId = getMyVerificationId();
    if (!storedId) {
      setLoading(false);
      return;
    }
    base44.entities.OwnerVerification.get(storedId)
      .then((found) => {
        setRecord(found);
        setForm((prev) => ({ ...prev, ...found }));
      })
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, []);

  const patch = (update) => setForm((prev) => ({ ...prev, ...update }));

  const uploadDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      patch({ documentUri: result.file_uri });
    } catch (err) {
      setError(err?.message || "Could not upload the document.");
    }
    setUploading(false);
    event.target.value = "";
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.ownerName.trim()) return setError("Add the owner's full name.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Add a valid 10-digit phone number.");
    if (!form.documentUri) return setError("Upload one proof document so we can review it.");
    setSaving(true);
    const payload = {
      ownerName: form.ownerName.trim(),
      businessName: form.businessName,
      ownerType: form.ownerType,
      email: form.email,
      phone: form.phone,
      city: form.city,
      propertyCount: Number(form.propertyCount) || 1,
      documentType: form.documentType,
      documentUri: form.documentUri,
      status: "pending",
    };
    const saved = record
      ? await base44.entities.OwnerVerification.update(record.id, payload)
      : await base44.entities.OwnerVerification.create(payload);
    setMyVerificationId(saved.id);
    setRecord(saved);
    setSaving(false);
  };

  const approved = record?.status === "approved";
  const inReview = record?.status === "pending";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Owner verification</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Prove who you are, and that you may rent it</h1>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
        Identity verification and ownership proof are reviewed separately, by a person. An approved owner gets a verified
        badge on published listings. Documents are stored privately and are never shown on your listing.
      </p>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-3xl border border-border bg-card" />
      ) : approved ? (
        <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <p className="mt-3 text-[15px] font-semibold">Verified owner</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {record.ownerName} · {OWNER_TYPES.find((type) => type.value === record.ownerType)?.label}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Verification scope: identity and the authorization document you supplied were reviewed. It does not certify
            the condition of any property or the conduct of any owner.
          </p>
          <Link to="/host" className="mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground">
            Back to workspace
          </Link>
        </div>
      ) : (
        <>
          {record && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <StatusPill status={record.status} />
              <p className="text-[12px] text-muted-foreground">
                Submitted for {record.ownerName}
                {record.adminNote ? ` · Reviewer note: ${record.adminNote}` : ""}
              </p>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Owner full name
                <input className={`${inputClass} mt-1.5`} value={form.ownerName} onChange={(e) => patch({ ownerName: e.target.value })} />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Business name (optional)
                <input className={`${inputClass} mt-1.5`} value={form.businessName} onChange={(e) => patch({ businessName: e.target.value })} />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Owner type
                <select className={`${inputClass} mt-1.5`} value={form.ownerType} onChange={(e) => patch({ ownerType: e.target.value })}>
                  {OWNER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                City
                <input className={`${inputClass} mt-1.5`} value={form.city} onChange={(e) => patch({ city: e.target.value })} />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Phone
                <input className={`${inputClass} mt-1.5`} value={form.phone} onChange={(e) => patch({ phone: e.target.value })} />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Email
                <input className={`${inputClass} mt-1.5`} type="email" value={form.email} onChange={(e) => patch({ email: e.target.value })} />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Properties you list
                <input
                  className={`${inputClass} mt-1.5`}
                  type="number"
                  min="1"
                  value={form.propertyCount}
                  onChange={(e) => patch({ propertyCount: e.target.value })}
                />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Proof document type
                <select className={`${inputClass} mt-1.5`} value={form.documentType} onChange={(e) => patch({ documentType: e.target.value })}>
                  {documentTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-4 text-[13px]">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span>
                {uploading ? "Uploading…" : form.documentUri ? "Document attached — replace" : "Attach proof document"}
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  PDF or image, stored privately. Only moderators can open it.
                </span>
              </span>
              <input type="file" accept="image/*,application/pdf" onChange={uploadDocument} className="hidden" disabled={uploading} />
            </label>

            {error && <p className="text-[12px] text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Submitting…" : inReview ? "Update submission" : "Submit for review"}
            </button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              A verified phone number or email is not the same as owner verification. The badge appears only after a
              reviewer approves this submission.
            </p>
          </form>
        </>
      )}
    </div>
  );
}