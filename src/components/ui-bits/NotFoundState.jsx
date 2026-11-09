import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotFoundState({ title = "We couldn't find that page", body }) {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">404</p>
      <h1 className="mt-3 text-[26px] font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {body || "The link may have expired, or the listing is no longer published."}
      </p>
      <Link
        to="/discover"
        className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
      >
        Browse accommodation
      </Link>
    </div>
  );
}