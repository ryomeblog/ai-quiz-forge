export function sanitizePromptInput(input, maxLength) {
  if (!input) return "";
  let s = String(input);
  if (s.length > maxLength) s = s.slice(0, maxLength);
  s = s.replace(/[\r\n]+/g, " ");
  s = s.replace(/`/g, "'");
  // 制御文字除去（改行はすでに置換済み）
  s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  return s.trim();
}

export const MAX_THEME_LEN = 100;
export const MAX_SCOPE_LEN = 500;
