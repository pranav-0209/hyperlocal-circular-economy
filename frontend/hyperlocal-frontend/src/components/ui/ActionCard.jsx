/**
 * ActionCard Component
 * Displays a community action card with optional lock state.
 * Used on HomePage for Join/Create Community actions.
 */
export default function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  isLocked = false,
  lockMessage = null,
}) {
  return (
    <div
      className={`bg-white rounded-lg p-8 border border-gray-200 transition-all ${
        isLocked ? 'opacity-60' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="text-4xl">{icon}</div>
        {isLocked && (
          <span className="material-symbols-outlined text-gray-400 text-2xl">
            lock
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-muted-green mb-6">{description}</p>

      {isLocked && lockMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-yellow-700">{lockMessage}</p>
        </div>
      )}

      <button
        onClick={onClick}
        disabled={isLocked}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          isLocked
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}
