import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import ChoiceInput from "./ChoiceInput.jsx";
import { uuid } from "../../utils/uuid.js";
import Badge from "../common/Badge.jsx";

function emptyChoice() {
  return { id: uuid(), text: "", isCorrect: false };
}

function defaultChoices() {
  return [emptyChoice(), emptyChoice()];
}

export default function QuestionForm({ initial, submitLabel = "問題を追加", onSubmit, onCancel }) {
  const [text, setText] = useState(initial?.text || "");
  const [choices, setChoices] = useState(
    initial?.choices?.length ? initial.choices : defaultChoices()
  );
  const [explanation, setExplanation] = useState(initial?.explanation || "");
  const [error, setError] = useState(null);

  const correctCount = choices.filter((c) => c.isCorrect).length;
  const isMulti = correctCount >= 2;

  function updateChoice(i, next) {
    setChoices((prev) => prev.map((c, idx) => (idx === i ? next : c)));
  }

  function addChoice() {
    if (choices.length >= 10) return;
    setChoices((prev) => [...prev, emptyChoice()]);
  }

  function removeChoice(i) {
    if (choices.length <= 2) return;
    setChoices((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) {
      setError("問題文は必須です");
      return;
    }
    if (choices.length < 2) {
      setError("選択肢は最低2つ必要です");
      return;
    }
    if (choices.some((c) => !c.text.trim())) {
      setError("空白の選択肢があります");
      return;
    }
    if (correctCount < 1) {
      setError("正解を最低1つ設定してください");
      return;
    }
    onSubmit({
      text: t,
      choices: choices.map((c) => ({ ...c, text: c.text.trim() })),
      explanation: explanation.trim() || null,
      source: initial?.source || "manual",
    });
    if (!initial) {
      setText("");
      setChoices(defaultChoices());
      setExplanation("");
      setError(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">問題文</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-ink">選択肢 ({choices.length}/10)</span>
        <Badge variant={isMulti ? "multi" : "single"} />
      </div>
      <div className="space-y-2">
        {choices.map((c, i) => (
          <ChoiceInput
            key={c.id}
            choice={c}
            index={i}
            onChange={(next) => updateChoice(i, next)}
            onRemove={() => removeChoice(i)}
            disableRemove={choices.length <= 2}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addChoice}
        disabled={choices.length >= 10}
        className="inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-3 py-1.5 text-sm text-brand-primary-text disabled:opacity-50"
      >
        <FiPlus /> 選択肢を追加
      </button>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">解説（任意）</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-md bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger-text">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md border border-brand-success bg-brand-success-bg px-4 py-2 font-medium text-brand-success-text"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-4 py-2 text-brand-ink"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
