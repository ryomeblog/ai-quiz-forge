import { useState } from "react";

export default function ExamForm({ initial, submitLabel, onSubmit, onCancel, questionCount }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError("タイトルは必須です");
      return;
    }
    onSubmit({ title: t, description: description.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">
          タイトル<span className="text-brand-danger"> *</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: AWS SAA 模擬試験"
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-brand-ink focus:border-brand-primary focus:outline-none"
          maxLength={200}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">説明（任意）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-brand-ink focus:border-brand-primary focus:outline-none"
          maxLength={1000}
        />
      </div>
      {typeof questionCount === "number" && (
        <p className="text-xs text-brand-neutral-text">登録済み問題数: {questionCount}</p>
      )}
      {error && (
        <p className="rounded-md bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger-text">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md border border-brand-primary bg-brand-primary-bg px-4 py-2 font-medium text-brand-primary-text"
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
