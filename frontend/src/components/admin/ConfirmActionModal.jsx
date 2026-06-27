import { createPortal } from "react-dom";
import { Trash2, AlertTriangle } from "lucide-react";

function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const isDanger  = variant === "danger";
  const isWarning = variant === "warning";

  const iconBlockClass = isDanger
    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
    : isWarning
    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";

  const confirmButtonClass = isDanger
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-900"
    : isWarning
    ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-200 dark:focus:ring-amber-900"
    : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-200";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 dark:bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-slate-100 dark:border-slate-800 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBlockClass}`}>
            {isDanger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 text-center">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
        </div>

        {/* Actions */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-4 disabled:opacity-50 ${confirmButtonClass}`}
          >
            {loading ? "Traitement..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmActionModal;
