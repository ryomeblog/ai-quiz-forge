import { sanitizePromptInput, MAX_THEME_LEN, MAX_SCOPE_LEN } from "../utils/sanitize.js";

export const SYSTEM_PROMPT = `あなたは資格試験・学習向けの選択式クイズ問題を作成する専門家です。
Web検索ツールで最新の一次情報・公式ドキュメント・信頼できる学習リソースを
確認した上で、正確かつ実践的な問題を生成してください。

# 出力契約（厳守）
- 応答は必ず以下のJSON形式のみ。前置き・後置きの文章は一切含めない。
- コードフェンス（\`\`\`）で囲んでもよいが、JSON以外の文字列を含めない。

{
  "questions": [
    {
      "text": "<問題文>",
      "choices": [
        { "text": "<選択肢テキスト>", "isCorrect": true },
        { "text": "<選択肢テキスト>", "isCorrect": false }
      ],
      "explanation": "<1〜3文の解説>"
    }
  ]
}

# 制約
- 各問題の選択肢は必ず指定された個数。
- 各問題には isCorrect:true が最低1つ必須。
- 単一正解問題は isCorrect:true をちょうど1つにする。
- 複数正解許可モードでも、全問を複数正解にはせず単一と複数を混在させる。
- 選択肢の順序は正解が特定の位置に偏らないようにする。
- 解説は「なぜ正解なのか」「他の選択肢がなぜ違うのか」を含む簡潔なもの。
- 事実不明な場合は推測で問題を作らず、Web検索で裏取りしてから出題する。`;

export function buildUserPrompt({ theme, scope, language, count, choiceCount, multiSelect }) {
  const safeTheme = sanitizePromptInput(theme, MAX_THEME_LEN);
  const safeScope = sanitizePromptInput(scope, MAX_SCOPE_LEN);
  const scopeLine = safeScope || "（指定なし：テーマの頻出範囲からバランスよく）";
  const langLabel = language === "en" ? "English" : "日本語";
  return `# 生成依頼
- テーマ / 資格名: ${safeTheme}
- 出題範囲 / 詳細指示: ${scopeLine}
- 出題言語: ${langLabel}
- 問題数: ${count} 問
- 各問題の選択肢数: ${choiceCount} 個
- 複数正解の混在: ${
    multiSelect ? "許可（全問ではなく一部のみ複数正解にする）" : "禁止（全問で正解は1つのみ）"
  }

Web検索で最新情報・公式情報を確認した上で、上記条件を厳密に満たす
クイズをJSONで出力してください。`;
}

export function extractJSON(text) {
  if (!text || typeof text !== "string") throw new Error("空のレスポンス");
  // コードフェンス優先
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    return JSON.parse(fence[1].trim());
  }
  // 最初の { から対応する } を抜く単純抽出
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }
  throw new Error("JSONブロックが見つかりませんでした");
}
