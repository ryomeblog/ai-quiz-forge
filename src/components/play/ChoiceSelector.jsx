export default function ChoiceSelector({ question, selected, onChange }) {
  const multi = question.isMultiSelect;

  function toggle(id) {
    if (multi) {
      const has = selected.includes(id);
      onChange(has ? selected.filter((x) => x !== id) : [...selected, id]);
    } else {
      onChange([id]);
    }
  }

  return (
    <ul className="space-y-2">
      {question.choices.map((c, i) => {
        const isSelected = selected.includes(c.id);
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => toggle(c.id)}
              className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition ${
                isSelected
                  ? "border-brand-primary bg-brand-primary-bg text-brand-primary-text"
                  : "border-brand-neutral-border bg-white text-brand-ink"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${
                  multi ? "rounded-md" : "rounded-full"
                } border ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-neutral-border-alt bg-white"
                }`}
              >
                {isSelected ? (multi ? "✓" : "●") : ""}
              </span>
              <span className="flex-1">
                {String.fromCharCode(65 + i)}. {c.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
