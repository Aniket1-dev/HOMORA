export default function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}