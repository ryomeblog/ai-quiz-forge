import { Switch } from "@headlessui/react";
import { FiX } from "react-icons/fi";

export default function ChoiceInput({ choice, index, onChange, onRemove, disableRemove }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-brand-neutral-border bg-white p-2">
      <span className="w-6 text-center text-sm text-brand-neutral-text">{index + 1}.</span>
      <input
        type="text"
        value={choice.text}
        onChange={(e) => onChange({ ...choice, text: e.target.value })}
        placeholder="選択肢テキスト"
        className="flex-1 rounded-md border border-brand-neutral-border px-2 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
      />
      <label className="flex items-center gap-1 text-xs text-brand-neutral-text">
        <span>正解</span>
        <Switch
          checked={choice.isCorrect}
          onChange={(v) => onChange({ ...choice, isCorrect: v })}
          className={`${choice.isCorrect ? "bg-brand-success" : "bg-brand-neutral-border-alt"} relative inline-flex h-5 w-9 items-center rounded-full transition`}
        >
          <span
            className={`${choice.isCorrect ? "translate-x-5" : "translate-x-1"} inline-block h-3 w-3 transform rounded-full bg-white transition`}
          />
        </Switch>
      </label>
      <button
        type="button"
        onClick={onRemove}
        disabled={disableRemove}
        className="rounded p-1 text-brand-danger-text hover:bg-brand-danger-bg disabled:opacity-30"
        aria-label="選択肢を削除"
      >
        <FiX />
      </button>
    </div>
  );
}
