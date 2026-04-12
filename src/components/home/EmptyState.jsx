import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

export default function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-brand-neutral-border bg-white p-8 text-center">
      <p className="text-brand-neutral-text">まだ試験がありません。</p>
      <Link
        to="/exams/new"
        className="mt-4 inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-4 py-2 text-sm font-medium text-brand-primary-text"
      >
        <FiPlus /> 最初の試験を作成
      </Link>
    </div>
  );
}
