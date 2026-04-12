import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ApiKeyInput({ label, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-ink">{label}</label>
      <div className="flex items-stretch gap-2">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "APIキー"}
          className="flex-1 rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm font-mono"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-3 text-brand-ink"
          aria-label={visible ? "キーを隠す" : "キーを表示"}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );
}
