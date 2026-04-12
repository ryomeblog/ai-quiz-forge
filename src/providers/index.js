import { generateWithAnthropic } from "./anthropic.js";
import { generateWithOpenAI } from "./openai.js";
import { generateWithOpenRouter } from "./openrouter.js";
import { AIResponseSchema } from "../utils/schemas.js";
import { uuid } from "../utils/uuid.js";

export async function generateQuestions({ provider, apiKey, openrouterModel, params }) {
  let raw;
  if (provider === "anthropic") {
    raw = await generateWithAnthropic({ apiKey, params });
  } else if (provider === "openai") {
    raw = await generateWithOpenAI({ apiKey, params });
  } else if (provider === "openrouter") {
    raw = await generateWithOpenRouter({ apiKey, model: openrouterModel, params });
  } else {
    throw new Error(`不明なプロバイダー: ${provider}`);
  }

  const parsed = AIResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[AI] schema mismatch raw=", raw, "issues=", parsed.error?.issues);
    throw new Error("生成結果の形式が不正です。再生成してください");
  }

  const { count, choiceCount } = params;
  const questions = parsed.data.questions;
  if (questions.length !== count) {
    throw new Error(
      `問題数が不一致（期待 ${count}、実際 ${questions.length}）。再生成してください`
    );
  }
  for (const q of questions) {
    if (q.choices.length !== choiceCount) {
      throw new Error(`選択肢数が不一致。再生成してください`);
    }
    if (!q.choices.some((c) => c.isCorrect)) {
      throw new Error(`正解のない問題があります。再生成してください`);
    }
  }

  return questions.map((q) => ({
    id: uuid(),
    text: q.text,
    choices: q.choices.map((c) => ({ id: uuid(), text: c.text, isCorrect: c.isCorrect })),
    isMultiSelect: q.choices.filter((c) => c.isCorrect).length >= 2,
    explanation: q.explanation || null,
    source: "ai",
  }));
}
