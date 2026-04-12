export default function ProgressBar({ current, total }) {
  const pct = total === 0 ? 0 : Math.round(((current + 1) / total) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-brand-neutral-text">
        <span>
          {current + 1} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-brand-neutral-bg-alt">
        <div
          className="h-full rounded-full bg-brand-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
