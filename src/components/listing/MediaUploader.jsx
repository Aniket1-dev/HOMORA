import { uploadListingImage } from "@/services/storage";
import { useState } from "react";
import { Upload, X, ImagePlus } from "lucide-react";

export default function MediaUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files.slice(0, 6)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files can be uploaded.");
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          setError("Each image must be under 8 MB.");
          continue;
        }
        uploaded.push(await uploadListingImage(file));
      }
      onChange([...images, ...uploaded].slice(0, 12));
    } catch (err) {
      setError(err?.message || "Upload failed. Try a smaller image.");
    }
    setUploading(false);
    event.target.value = "";
  };

  const addUrl = () => {
    if (!urlDraft.trim()) return;
    onChange([...images, urlDraft.trim()].slice(0, 12));
    setUrlDraft("");
  };

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center transition hover:border-accent/50">
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-[13px] font-medium">{uploading ? "Uploading…" : "Upload photos"}</span>
        <span className="text-[11px] text-muted-foreground">
          JPG or PNG, up to 8 MB each · stored publicly so tenants can see them
        </span>
        <input type="file" accept="image/*" multiple onChange={upload} className="hidden" disabled={uploading} />
      </label>

      <div className="flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={addUrl}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 text-[13px]"
        >
          <ImagePlus className="h-4 w-4" /> Add
        </button>
      </div>

      {error && <p className="text-[12px] text-destructive">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="group relative overflow-hidden rounded-xl border border-border">
              <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 rounded-full bg-card/90 p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}