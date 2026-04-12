import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiUpload, FiTrash2 } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader.jsx";
import ApiKeyInput from "../components/settings/ApiKeyInput.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { useSettings } from "../contexts/SettingsContext.jsx";
import { useExams } from "../contexts/ExamContext.jsx";
import { useHistory } from "../contexts/HistoryContext.jsx";
import { downloadExport, parseImportJSON } from "../utils/exportImport.js";
import { clearAll } from "../utils/storage.js";

export default function SettingsPage() {
  const { provider, setProvider, apiKeys, setApiKey, openrouterModel, setOpenrouterModel } =
    useSettings();
  const { exams, replaceAll: replaceExams } = useExams();
  const { history, replaceAll: replaceHistory } = useHistory();
  const fileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  function handleExport() {
    downloadExport(exams, history);
    toast.success("エクスポートしました");
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportJSON(text);
      setPendingImport(parsed);
    } catch (err) {
      toast.error("インポートに失敗: " + (err.message || "形式不正"));
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    replaceExams(pendingImport.exams);
    replaceHistory(pendingImport.history);
    setPendingImport(null);
    toast.success("インポートしました");
  }

  function handleClearAll() {
    clearAll();
    replaceExams([]);
    replaceHistory([]);
    setConfirmClearAll(false);
    toast.success("すべてのデータを削除しました");
  }

  return (
    <>
      <PageHeader title="設定" />
      <div className="mx-auto max-w-md space-y-5 p-4">
        <section className="space-y-3 rounded-xl border border-brand-neutral-border bg-white p-4">
          <h2 className="text-sm font-semibold text-brand-ink">AIプロバイダー</h2>
          <div>
            <label className="mb-1 block text-sm text-brand-neutral-text">
              デフォルトプロバイダー
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>
          <ApiKeyInput
            label="Anthropic APIキー"
            value={apiKeys.anthropic}
            onChange={(v) => setApiKey("anthropic", v)}
          />
          <ApiKeyInput
            label="OpenAI APIキー"
            value={apiKeys.openai}
            onChange={(v) => setApiKey("openai", v)}
          />
          <ApiKeyInput
            label="OpenRouter APIキー"
            value={apiKeys.openrouter}
            onChange={(v) => setApiKey("openrouter", v)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-ink">
              OpenRouter モデル名
            </label>
            <input
              type="text"
              value={openrouterModel}
              onChange={(e) => setOpenrouterModel(e.target.value)}
              placeholder="例: google/gemini-2.5-pro"
              className="w-full rounded-md border border-brand-neutral-border bg-white px-3 py-2 text-sm font-mono"
            />
            <p className="mt-1 text-xs text-brand-neutral-text">
              `:online` が無ければ自動付与されます
            </p>
          </div>
          <p className="rounded-md bg-brand-danger-bg p-2 text-xs text-brand-danger-text">
            APIキーはこの端末に保存されます。共有端末では使用しないでください。
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-brand-neutral-border bg-white p-4">
          <h2 className="text-sm font-semibold text-brand-ink">データ管理</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-3 py-2 text-sm text-brand-primary-text"
            >
              <FiDownload /> エクスポート
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="inline-flex items-center gap-1 rounded-md border border-brand-primary bg-brand-primary-bg px-3 py-2 text-sm text-brand-primary-text"
            >
              <FiUpload /> インポート
            </button>
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="inline-flex items-center gap-1 rounded-md border border-brand-danger bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger-text"
            >
              <FiTrash2 /> 全データ削除
            </button>
          </div>
          <p className="text-xs text-brand-neutral-text">
            エクスポートにAPIキーは含まれません。インポートは現在のデータを上書きします。
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFile}
          />
        </section>
      </div>

      <ConfirmDialog
        open={!!pendingImport}
        title="インポートで上書きしますか？"
        description="現在の試験・履歴はすべて置き換えられます。"
        confirmLabel="上書き"
        danger
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmDialog
        open={confirmClearAll}
        title="すべてのデータを削除しますか？"
        description="試験・履歴・APIキーを含むこの端末の全データが削除されます。"
        confirmLabel="削除"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </>
  );
}
