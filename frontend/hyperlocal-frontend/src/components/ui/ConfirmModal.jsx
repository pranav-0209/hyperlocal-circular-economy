/**
 * ConfirmModal — a lightweight confirm/cancel dialog.
 *
 * Props:
 *   open        {boolean}   whether the modal is visible
 *   title       {string}    bold heading
 *   message     {string|ReactNode}  body text
 *   confirmLabel {string}   label for the confirm button (default "Confirm")
 *   confirmClass {string}   extra Tailwind classes for the confirm button
 *                           (default: red / destructive style)
 *   onConfirm   {function}  called when the user clicks confirm
 *   onCancel    {function}  called when the user clicks cancel or backdrop
 *   loading     {boolean}   disables buttons and shows loading text when true
 */
export default function ConfirmModal({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    confirmClass = 'bg-red-600 text-white hover:bg-red-700',
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!open) return null;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onCancel}
        >
            {/* Panel — stop click propagation so clicking inside doesn't dismiss */}
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber-500 text-xl">warning</span>
                    </div>
                    <h2 className="font-bold text-charcoal text-base">{title}</h2>
                </div>

                {/* Message */}
                {message && (
                    <p className="text-sm text-muted-green leading-relaxed">{message}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-1">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 py-2 bg-gray-100 text-charcoal text-sm rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2 text-sm rounded-xl font-semibold transition-all disabled:opacity-60 ${confirmClass}`}
                    >
                        {loading ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
