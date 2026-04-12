import { Disclosure } from "@headlessui/react";
import { FiChevronRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

export default function PreviewAccordion({ questions, onRemove, onSaveAll }) {
  const { id } = useParams();
  if (!questions?.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-ink">プレビュー ({questions.length} 問)</h3>
        <button
          type="button"
          onClick={onSaveAll}
          className="rounded-md border border-brand-success bg-brand-success-bg px-3 py-1.5 text-sm font-medium text-brand-success-text"
        >
          すべて登録
        </button>
      </div>
      <div className="space-y-2">
        {questions.map((q, i) => {
          const head = q.text.length > 20 ? q.text.slice(0, 20) + "…" : q.text;
          return (
            <Disclosure key={q.id || i}>
              {({ open }) => (
                <div className="rounded-md border border-brand-neutral-border bg-white">
                  <Disclosure.Button className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
                    <span className="truncate text-sm text-brand-ink">
                      Q{i + 1}. {head}
                    </span>
                    <FiChevronRight className={`shrink-0 transition ${open ? "rotate-90" : ""}`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="border-t border-brand-neutral-border px-3 py-3 text-sm">
                    <p className="mb-2 text-brand-ink">{q.text}</p>
                    <ul className="space-y-1">
                      {q.choices.map((c) => (
                        <li
                          key={c.id}
                          className={
                            c.isCorrect
                              ? "rounded-md border-l-4 border-brand-success-border bg-brand-success-bg-alt px-2 py-1 text-brand-success-text-alt"
                              : "px-2 py-1 text-brand-neutral-text"
                          }
                        >
                          {c.text}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p className="mt-2 rounded-md bg-brand-neutral-bg-alt p-2 text-xs text-brand-neutral-text">
                        {q.explanation}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/exams/${id}/questions/edit?source=preview&index=${i}`}
                        className="inline-flex items-center gap-1 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-2 py-1 text-xs text-brand-ink"
                      >
                        <FiEdit2 /> 編集
                      </Link>
                      <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="inline-flex items-center gap-1 rounded-md border border-brand-danger bg-brand-danger-bg px-2 py-1 text-xs text-brand-danger-text"
                      >
                        <FiTrash2 /> 破棄
                      </button>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          );
        })}
      </div>
    </div>
  );
}
