export default function Badge({ variant = "single", children }) {
  if (variant === "multi") {
    return (
      <span className="inline-flex items-center rounded-md border border-brand-accent-border bg-brand-accent-bg px-2 py-0.5 text-xs font-medium text-brand-accent-text">
        {children || "複数選択"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-2 py-0.5 text-xs font-medium text-brand-neutral-text">
      {children || "単一選択"}
    </span>
  );
}
