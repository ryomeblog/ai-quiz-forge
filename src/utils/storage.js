export const KEYS = {
  exams: "aqf_exams",
  history: "aqf_history",
  provider: "aqf_provider",
  apiKeyAnthropic: "aqf_apikey_anthropic",
  apiKeyOpenAI: "aqf_apikey_openai",
  apiKeyOpenRouter: "aqf_apikey_openrouter",
  modelOpenRouter: "aqf_model_openrouter",
  tutorialSeen: "aqf_tutorial_seen",
};

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("[storage] write failed", key, err);
  }
}

export function readString(key, fallback = "") {
  const v = localStorage.getItem(key);
  return v === null ? fallback : v;
}

export function writeString(key, value) {
  localStorage.setItem(key, value ?? "");
}

export function removeKey(key) {
  localStorage.removeItem(key);
}

export function clearAll() {
  Object.values(KEYS).forEach(removeKey);
}
