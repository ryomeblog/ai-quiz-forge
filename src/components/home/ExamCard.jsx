import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiList, FiPlay, FiTrash2 } from "react-icons/fi";
import { HiMiniStar } from "react-icons/hi2";
import { useHistory } from "../../contexts/HistoryContext.jsx";

function computeSteps(total) {
  if (total < 5) return [];
  const steps = [];
  for (let n = 5; n <= total; n += 5) steps.push(n);
  if (steps[steps.length - 1] !== total) steps.push(total);
  return steps;
}

export default function ExamCard({ exam, onStart, onDeleteRequest }) {
  const total = exam.questions.length;
  const steps = useMemo(() => computeSteps(total), [total]);
  const defaultCount = total < 5 ? total : steps.includes(10) ? 10 : steps[0];
  const [count, setCount] = useState(defaultCount);
  const { getLatestForExam, hasPerfectForCurrentExam } = useHistory();

  const latest = getLatestForExam(exam.id);
  const latestPct = latest ? Math.round((latest.score / latest.totalQuestions) * 100) : null;
  const showStar = hasPerfectForCurrentExam(exam.id, exam.updatedAt);

  const disabled = total === 0;

  const sliderIndex = steps.indexOf(count);

  function handleSliderChange(e) {
    const idx = Number(e.target.value);
    setCount(steps[idx]);
  }

  const createdAt = new Date(exam.createdAt).toLocaleDateString();

  return (
    <article className="rounded-xl border border-brand-neutral-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="flex items-center gap-1 text-base font-semibold text-brand-ink">
          {showStar && <HiMiniStar className="text-yellow-500" aria-label="全問正解履歴あり" />}
          <span className="truncate">{exam.title}</span>
        </h2>
      </div>
      <p className="mt-1 text-xs text-brand-neutral-text">
        全 {total} 問・作成 {createdAt}
        {latestPct !== null && (
          <>
            {" "}
            ・前回 <span className="font-medium">{latestPct}%</span>
          </>
        )}
      </p>

      {disabled ? (
        <p className="mt-3 rounded-md bg-brand-neutral-bg-alt p-2 text-center text-sm text-brand-neutral-text">
          問題を追加してください
        </p>
      ) : total < 5 ? (
        <p className="mt-3 text-sm text-brand-neutral-text">
          出題数: <span className="font-semibold text-brand-ink">{total}</span>{" "}
          問（総問題数が5未満）
        </p>
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-neutral-text">出題数</span>
            <span className="font-semibold text-brand-ink">{count} 問</span>
          </div>
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            step={1}
            value={sliderIndex < 0 ? 0 : sliderIndex}
            onChange={handleSliderChange}
            className="mt-1 w-full accent-[color:var(--color-brand-primary)]"
            aria-label="出題数"
          />
          <div className="flex justify-between text-[10px] text-brand-neutral-text-alt">
            {steps.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStart(total < 5 ? total : count)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-brand-success bg-brand-success-bg px-3 py-2 text-sm font-medium text-brand-success-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiPlay /> スタート
        </button>
        <Link
          to={`/exams/${exam.id}/questions`}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-3 py-2 text-sm text-brand-primary-text"
        >
          <FiList /> 問題
        </Link>
        <Link
          to={`/exams/${exam.id}/edit`}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-3 py-2 text-sm text-brand-ink"
        >
          <FiEdit2 /> 編集
        </Link>
        <button
          type="button"
          onClick={onDeleteRequest}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-brand-danger bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger-text"
        >
          <FiTrash2 /> 削除
        </button>
      </div>
    </article>
  );
}
