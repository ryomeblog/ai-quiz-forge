import { Disclosure } from "@headlessui/react";
import { FiChevronRight, FiTrash2 } from "react-icons/fi";
import AnswerAccordion from "../result/AnswerAccordion.jsx";

export default function HistoryAccordion({ entries, onDelete }) {
  return (
    <div className="space-y-2">
      {entries.map((h) => {
        const pct = Math.round((h.score / h.totalQuestions) * 100);
        const date = new Date(h.playedAt).toLocaleString();
        return (
          <Disclosure key={h.id}>
            {({ open }) => (
              <div className="rounded-md border border-brand-neutral-border bg-white">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Disclosure.Button className="flex flex-1 items-center gap-2 text-left">
                    <div className="flex-1">
                      <p className="truncate text-sm font-medium text-brand-ink">{h.examTitle}</p>
                      <p className="text-xs text-brand-neutral-text">
                        {date} ・ {pct}% ({h.score}/{h.totalQuestions})
                      </p>
                    </div>
                    <FiChevronRight className={`shrink-0 transition ${open ? "rotate-90" : ""}`} />
                  </Disclosure.Button>
                  <button
                    type="button"
                    onClick={() => onDelete(h.id)}
                    aria-label="履歴を削除"
                    className="rounded p-1 text-brand-danger-text hover:bg-brand-danger-bg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <Disclosure.Panel className="border-t border-brand-neutral-border p-3">
                  <AnswerAccordion answers={h.answers} />
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
}
