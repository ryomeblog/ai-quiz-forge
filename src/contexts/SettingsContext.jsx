import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KEYS, readString, writeString } from "../utils/storage.js";

const SettingsContext = createContext(null);

const VALID_PROVIDERS = ["anthropic", "openai", "openrouter"];

export function SettingsProvider({ children }) {
  const [provider, setProviderState] = useState(() => {
    const v = readString(KEYS.provider, "anthropic");
    return VALID_PROVIDERS.includes(v) ? v : "anthropic";
  });
  const [apiKeys, setApiKeys] = useState(() => ({
    anthropic: readString(KEYS.apiKeyAnthropic, ""),
    openai: readString(KEYS.apiKeyOpenAI, ""),
    openrouter: readString(KEYS.apiKeyOpenRouter, ""),
  }));
  const [openrouterModel, setOpenrouterModelState] = useState(() =>
    readString(KEYS.modelOpenRouter, "google/gemini-2.5-pro")
  );

  const setProvider = useCallback((p) => {
    setProviderState(p);
    writeString(KEYS.provider, p);
  }, []);

  const setApiKey = useCallback((name, value) => {
    setApiKeys((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });
    if (name === "anthropic") writeString(KEYS.apiKeyAnthropic, value);
    if (name === "openai") writeString(KEYS.apiKeyOpenAI, value);
    if (name === "openrouter") writeString(KEYS.apiKeyOpenRouter, value);
  }, []);

  const setOpenrouterModel = useCallback((v) => {
    setOpenrouterModelState(v);
    writeString(KEYS.modelOpenRouter, v);
  }, []);

  const value = useMemo(
    () => ({
      provider,
      setProvider,
      apiKeys,
      setApiKey,
      openrouterModel,
      setOpenrouterModel,
    }),
    [provider, setProvider, apiKeys, setApiKey, openrouterModel, setOpenrouterModel]
  );

  // 外部から localStorage が更新された場合の同期（マルチタブなど）
  useEffect(() => {
    function onStorage(e) {
      if (!e.key) return;
      if (e.key === KEYS.provider && e.newValue) setProviderState(e.newValue);
      if (e.key === KEYS.modelOpenRouter && e.newValue) setOpenrouterModelState(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
