import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Badge from "../common/Badge.jsx";

export default function QuestionCard({ examId, question, index, onDelete }) {
  const preview = question.text.length > 30 ? question.text.slice(0, 30) + "…" : question.text;
  return (
    <article className="flex items-center justify-between gap-2 rounded-md border border-brand-neutral-border bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-brand-ink">
          Q{index + 1}. {preview}
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-brand-neutral-text">
          <span>選択肢 {question.choices.length}</span>
          <Badge variant={question.isMultiSelect ? "multi" : "single"} />
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Link
          to={`/exams/${examId}/questions/${question.id}/edit`}
          className="inline-flex items-center gap-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-2 py-1 text-xs text-brand-ink"
        >
          <FiEdit2 /> 編集
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-md border border-brand-danger bg-brand-danger-bg px-2 py-1 text-xs text-brand-danger-text"
        >
          <FiTrash2 /> 削除
        </button>
      </div>
    </article>
  );
}
