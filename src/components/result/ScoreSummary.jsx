export default function ScoreSummary({ score, total }) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const color =
    pct === 100
      ? "text-brand-success-text-alt"
      : pct >= 60
        ? "text-brand-primary-text"
        : "text-brand-danger-text";
  return (
    <div className="rounded-xl border border-brand-neutral-border bg-white p-6 text-center">
      <p className={`text-[36px] font-bold ${color}`}>{pct}%</p>
      <p className="mt-1 text-sm text-brand-neutral-text">
        {score} / {total} 正解
      </p>
    </div>
  );
}
