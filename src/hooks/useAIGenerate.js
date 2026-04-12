import { useCallback, useState } from "react";
import { generateQuestions } from "../providers/index.js";
import { useSettings } from "../contexts/SettingsContext.jsx";

export default function useAIGenerate() {
  const { provider, apiKeys, openrouterModel } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (params, providerOverride) => {
      const p = providerOverride || provider;
      setLoading(true);
      setError(null);
      try {
        const questions = await generateQuestions({
          provider: p,
          apiKey: apiKeys[p],
          openrouterModel,
          params,
        });
        return questions;
      } catch (e) {
        console.error("[AI] generation failed", e);
        if (e?.stack) console.error("[AI] stack:", e.stack);
        setError(e?.message || String(e));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [provider, apiKeys, openrouterModel]
  );

  return { run, loading, error, clearError: () => setError(null) };
}
