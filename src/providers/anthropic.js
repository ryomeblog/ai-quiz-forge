import { httpRequest } from "./httpClient.js";
import { SYSTEM_PROMPT, buildUserPrompt, extractJSON } from "./prompts.js";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-5";

export async function generateWithAnthropic({ apiKey, params }) {
  if (!apiKey) throw new Error("Anthropic APIキーが未設定です");
  const body = {
    model: DEFAULT_MODEL,
    max_tokens: 8192,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(params) }],
  };
  const { status, data } = await httpRequest({
    url: ENDPOINT,
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body,
    timeoutMs: 120000,
  });
  if (status === 401) throw new Error("APIキー（Anthropic）が無効です");
  if (status === 429) throw new Error("レート制限。しばらく待って再試行してください");
  if (status >= 500) throw new Error("Anthropicサーバーエラー");
  if (status < 200 || status >= 300) {
    throw new Error(`Anthropicエラー: ${status} ${JSON.stringify(data).slice(0, 200)}`);
  }
  const blocks = data?.content || [];
  const textBlocks = blocks.filter((b) => b.type === "text").map((b) => b.text);
  if (textBlocks.length === 0) throw new Error("テキスト応答がありません");
  const searchUsed = blocks.some(
    (b) =>
      (b.type === "server_tool_use" || b.type === "web_search_tool_result") &&
      (b.name === "web_search" || b.tool_use_id)
  );
  if (!searchUsed) {
    // ヒントとして扱う。厳密判定は parseResponse の zod で。
  }
  const text = textBlocks.join("\n");
  return extractJSON(text);
}
