export default function ProviderSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm"
    >
      <option value="anthropic">Anthropic (Claude)</option>
      <option value="openai">OpenAI</option>
      <option value="openrouter">OpenRouter</option>
    </select>
  );
}
