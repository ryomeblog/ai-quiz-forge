import { httpRequest } from "./httpClient.js";
import { SYSTEM_PROMPT, buildUserPrompt, extractJSON } from "./prompts.js";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// 無料モデル（:free を含む）に :online を付けると Web 検索が有料扱いで Key limit 超過になるため付与しない。
// 有料モデルのみ自動で :online を付けて Web 検索を有効化する。
function normalizeModel(model) {
  if (!model) return "google/gemini-2.5-pro:online";
  if (model.includes(":free")) return model.replace(/:online\b/g, "");
  return model.includes(":online") ? model : `${model}:online`;
}

function withoutOnline(model) {
  if (!model) return "google/gemini-2.5-pro";
  return model.replace(/:online\b/g, "");
}

// Primary が 3 秒以内に応答しない／失敗した場合に切り替えるモデル
const TIMEOUT_FALLBACK_MODEL = "z-ai/glm-4.5-air:free";
const PRIMARY_TIMEOUT_MS = 3000;
const FALLBACK_TIMEOUT_MS = 120000;

async function callOpenRouter({ apiKey, modelName, params, timeoutMs }) {
  const body = {
    model: modelName,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(params) },
    ],
    response_format: { type: "json_object" },
  };
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
    "X-Title": "AI Quiz Forge",
  };
  return httpRequest({ url: ENDPOINT, headers, body, timeoutMs });
}

function isTimeoutError(err) {
  const msg = String(err?.message || err || "");
  return /タイムアウト|timeout|aborted|AbortError/i.test(msg);
}

export async function generateWithOpenRouter({ apiKey, model, params }) {
  if (!apiKey) throw new Error("OpenRouter APIキーが未設定です");

  const primaryModel = normalizeModel(model);
  let status;
  let data;
  let usedModel = primaryModel;

  try {
    ({ status, data } = await callOpenRouter({
      apiKey,
      modelName: primaryModel,
      params,
      timeoutMs: PRIMARY_TIMEOUT_MS,
    }));
  } catch (err) {
    if (!isTimeoutError(err)) throw err;
    console.warn(
      `[openrouter] ${primaryModel} が ${PRIMARY_TIMEOUT_MS}ms でタイムアウトしたため ${TIMEOUT_FALLBACK_MODEL} にフォールバック`
    );
    usedModel = TIMEOUT_FALLBACK_MODEL;
    ({ status, data } = await callOpenRouter({
      apiKey,
      modelName: TIMEOUT_FALLBACK_MODEL,
      params,
      timeoutMs: FALLBACK_TIMEOUT_MS,
    }));
  }

  // :online で 403（Key limit 超過など）が返った場合、:online を外して再試行
  if (status === 403 && usedModel.includes(":online")) {
    const stripped = withoutOnline(usedModel);
    console.warn(
      `[openrouter] ${usedModel} が 403 を返したため ${stripped} で再試行（Web検索なし）`
    );
    usedModel = stripped;
    ({ status, data } = await callOpenRouter({
      apiKey,
      modelName: stripped,
      params,
      timeoutMs: FALLBACK_TIMEOUT_MS,
    }));
  }

  if (status === 401) throw new Error("APIキー（OpenRouter）が無効です");
  if (status === 403) {
    throw new Error(
      "OpenRouter 403: キーの利用上限またはモデルのアクセス制限に達しました。キー設定またはモデル名を確認してください"
    );
  }
  if (status === 429) throw new Error("レート制限。しばらく待って再試行してください");
  if (status >= 500) throw new Error("OpenRouterサーバーエラー");
  if (status < 200 || status >= 300) {
    throw new Error(`OpenRouterエラー: ${status} ${JSON.stringify(data).slice(0, 200)}`);
  }
  const message = data?.choices?.[0]?.message;
  const text = extractTextFromMessage(message);
  if (!text) {
    throw new Error(
      "OpenRouter応答からテキストを抽出できませんでした。別モデルを試すか再生成してください"
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    return extractJSON(text);
  }
}

function extractTextFromMessage(message) {
  if (!message) return null;
  const { content, reasoning, reasoning_content: reasoningContent } = message;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const parts = content
      .map((c) => {
        if (typeof c === "string") return c;
        if (c && typeof c.text === "string") return c.text;
        if (c && typeof c.text?.value === "string") return c.text.value;
        return "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join("\n");
  }
  if (typeof reasoning === "string" && reasoning.trim()) return reasoning;
  if (typeof reasoningContent === "string" && reasoningContent.trim()) return reasoningContent;
  return null;
}
