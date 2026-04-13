import { Disclosure } from "@headlessui/react";
import { FiChevronRight, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function AnswerAccordion({ answers }) {
  return (
    <div className="space-y-2">
      {answers.map((a, i) => {
        const head =
          a.questionText.length > 20 ? a.questionText.slice(0, 20) + "…" : a.questionText;
        return (
          <Disclosure key={a.questionId || i}>
            {({ open }) => (
              <div
                className={`rounded-md border ${
                  a.isCorrect
                    ? "border-brand-success-border bg-brand-success-bg-alt"
                    : "border-brand-danger bg-brand-danger-bg"
                }`}
              >
                <Disclosure.Button className="flex w-full items-center gap-2 px-3 py-2 text-left">
                  {a.isCorrect ? (
                    <FiCheckCircle className="text-brand-success-text-alt" />
                  ) : (
                    <FiXCircle className="text-brand-danger-text" />
                  )}
                  <span
                    className={`flex-1 truncate text-sm ${
                      a.isCorrect ? "text-brand-success-text-alt" : "text-brand-danger-text"
                    }`}
                  >
                    Q{i + 1}. {head}
                  </span>
                  <FiChevronRight className={`shrink-0 transition ${open ? "rotate-90" : ""}`} />
                </Disclosure.Button>
                <Disclosure.Panel className="border-t border-brand-neutral-border bg-white px-3 py-3 text-sm">
                  <p className="mb-2 text-brand-ink">{a.questionText}</p>
                  <ul className="space-y-1">
                    {a.choices.map((c) => {
                      const wasSelected = a.selectedChoiceIds.includes(c.id);
                      const isCorrect = a.correctChoiceIds.includes(c.id);
                      let cls = "px-2 py-1 text-brand-neutral-text";
                      if (isCorrect) {
                        cls =
                          "rounded-md border-l-4 border-brand-success-border bg-brand-success-bg-alt px-2 py-1 text-brand-success-text-alt";
                      } else if (wasSelected) {
                        cls =
                          "rounded-md border-l-4 border-brand-danger bg-brand-danger-bg px-2 py-1 text-brand-danger-text";
                      }
                      return (
                        <li key={c.id} className={cls}>
                          {wasSelected ? "● " : ""}
                          {c.text}
                        </li>
                      );
                    })}
                  </ul>
                  {a.explanation && (
                    <div className="mt-3 rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt p-2">
                      <p className="mb-1 text-xs font-semibold text-brand-neutral-text">解説</p>
                      <p className="whitespace-pre-wrap text-xs text-brand-ink">
                        {a.explanation}
                      </p>
                    </div>
                  )}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
}
