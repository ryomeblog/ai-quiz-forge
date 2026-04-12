import { useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import HistoryAccordion from "../components/history/HistoryAccordion.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { useHistory } from "../contexts/HistoryContext.jsx";

export default function HistoryPage() {
  const { history, deleteHistory, clearHistory } = useHistory();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <>
      <PageHeader
        title="履歴"
        right={
          history.length > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="rounded-md border border-brand-danger bg-brand-danger-bg px-3 py-1 text-xs text-brand-danger-text"
            >
              全削除
            </button>
          ) : null
        }
      />
      <div className="mx-auto max-w-md p-4">
        {history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-neutral-border bg-white p-8 text-center text-brand-neutral-text">
            履歴はまだありません。
          </p>
        ) : (
          <HistoryAccordion entries={history} onDelete={deleteHistory} />
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="すべての履歴を削除しますか？"
        description="この操作は取り消せません。"
        confirmLabel="削除"
        danger
        onConfirm={() => {
          clearHistory();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
