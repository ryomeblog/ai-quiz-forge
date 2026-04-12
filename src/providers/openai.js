import { httpRequest } from "./httpClient.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";

const ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string" },
          choices: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                text: { type: "string" },
                isCorrect: { type: "boolean" },
              },
              required: ["text", "isCorrect"],
            },
          },
          explanation: { type: "string" },
        },
        required: ["text", "choices", "explanation"],
      },
    },
  },
  required: ["questions"],
};

export async function generateWithOpenAI({ apiKey, params }) {
  if (!apiKey) throw new Error("OpenAI APIキーが未設定です");
  const body = {
    model: DEFAULT_MODEL,
    tools: [{ type: "web_search_preview" }],
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(params) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "quiz_questions",
        schema: SCHEMA,
        strict: true,
      },
    },
  };
  const { status, data } = await httpRequest({
    url: ENDPOINT,
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
    timeoutMs: 120000,
  });
  if (status === 401) throw new Error("APIキー（OpenAI）が無効です");
  if (status === 429) throw new Error("レート制限。しばらく待って再試行してください");
  if (status >= 500) throw new Error("OpenAIサーバーエラー");
  if (status < 200 || status >= 300) {
    throw new Error(`OpenAIエラー: ${status} ${JSON.stringify(data).slice(0, 200)}`);
  }
  const text = extractOpenAIText(data);
  if (!text) throw new Error("OpenAIのレスポンスからテキストを抽出できませんでした");
  return JSON.parse(text);
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === "string" && data.output_text) return data.output_text;
  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      const contents = item?.content;
      if (Array.isArray(contents)) {
        for (const c of contents) {
          if (typeof c?.text === "string" && c.text) return c.text;
          if (typeof c?.text?.value === "string" && c.text.value) return c.text.value;
        }
      }
    }
  }
  return null;
}
