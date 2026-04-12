import { ExportSchema } from "./schemas.js";

export function buildExportPayload(exams, history) {
  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    exams,
    history,
  };
}

export function downloadExport(exams, history) {
  const payload = buildExportPayload(exams, history);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.download = `ai-quiz-forge-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportJSON(text) {
  const data = JSON.parse(text);
  return ExportSchema.parse(data);
}
