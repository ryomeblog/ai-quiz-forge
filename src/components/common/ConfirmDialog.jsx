import { Dialog } from "@headlessui/react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <Dialog open={open} onClose={() => onCancel?.()} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-brand-ink">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-2 text-sm text-brand-neutral-text">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-brand-neutral-border bg-brand-neutral-bg-alt px-4 py-2 text-sm text-brand-ink hover:opacity-90"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={
                danger
                  ? "rounded-md border border-brand-danger bg-brand-danger-bg px-4 py-2 text-sm font-medium text-brand-danger-text hover:opacity-90"
                  : "rounded-md border border-brand-primary bg-brand-primary-bg px-4 py-2 text-sm font-medium text-brand-primary-text hover:opacity-90"
              }
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
