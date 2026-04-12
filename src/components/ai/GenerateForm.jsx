import { useState } from "react";
import { Switch } from "@headlessui/react";
import ProviderSelector from "./ProviderSelector.jsx";
import { useSettings } from "../../contexts/SettingsContext.jsx";
import { MAX_SCOPE_LEN, MAX_THEME_LEN } from "../../utils/sanitize.js";

const COUNT_OPTIONS = [5, 10, 15, 20];

export default function GenerateForm({ loading, onGenerate }) {
  const { provider, setProvider, apiKeys } = useSettings();
  const [theme, setTheme] = useState("");
  const [scope, setScope] = useState("");
  const [language, setLanguage] = useState("ja");
  const [count, setCount] = useState(10);
  const [choiceCount, setChoiceCount] = useState(4);
  const [multiSelect, setMultiSelect] = useState(false);
  const [localError, setLocalError] = useState(null);

  const missingKey = !apiKeys[provider];

  function handleSubmit(e) {
    e.preventDefault();
    if (!theme.trim()) {
      setLocalError("テーマは必須です");
      return;
    }
    if (missingKey) {
      setLocalError("設定画面でAPIキーを登録してください");
      return;
    }
    setLocalError(null);
    onGenerate({
      theme,
      scope,
      language,
      count,
      choiceCount,
      multiSelect,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">プロバイダー</label>
        <ProviderSelector value={provider} onChange={setProvider} />
        {missingKey && (
          <p className="mt-1 text-xs text-brand-danger-text">
            このプロバイダーのAPIキーが未設定です。設定画面から登録してください。
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">
          テーマ / 資格名 <span className="text-brand-danger">*</span>
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="例: AWS SAA"
          maxLength={MAX_THEME_LEN}
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">
          出題範囲 / 詳細指示（任意）
        </label>
        <textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          rows={2}
          maxLength={MAX_SCOPE_LEN}
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">出題言語</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm"
        >
          <option value="ja">日本語</option>
          <option value="en">English</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-ink">問題数</label>
        <div className="grid grid-cols-4 gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`rounded-md border px-2 py-1.5 text-sm ${
                count === n
                  ? "border-brand-primary bg-brand-primary-bg text-brand-primary-text"
                  : "border-brand-neutral-border bg-white text-brand-ink"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-brand-ink">選択肢数</label>
          <span className="font-semibold text-brand-ink">{choiceCount}</span>
        </div>
        <input
          type="range"
          min={2}
          max={10}
          step={1}
          value={choiceCount}
          onChange={(e) => setChoiceCount(Number(e.target.value))}
          className="w-full accent-[color:var(--color-brand-primary)]"
        />
      </div>

      <label className="flex items-center justify-between rounded-md border border-brand-neutral-border bg-white p-3 text-sm">
        <span>
          複数正解を含める
          <span className="block text-xs text-brand-neutral-text">
            ON で単一／複数の混在を許可（全問複数にはしません）
          </span>
        </span>
        <Switch
          checked={multiSelect}
          onChange={setMultiSelect}
          className={`${multiSelect ? "bg-brand-success" : "bg-brand-neutral-border-alt"} relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${multiSelect ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </label>

      {localError && (
        <p className="rounded-md bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger-text">
          {localError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md border border-brand-success bg-brand-success-bg px-4 py-2 font-medium text-brand-success-text disabled:opacity-60"
      >
        {loading ? "生成中..." : "生成"}
      </button>
    </form>
  );
}
