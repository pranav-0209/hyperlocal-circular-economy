/**
 * SubmitButton — primary form submit button with loading state.
 *
 * Props:
 *  text      — label text (default "Submit")
 *  isLoading — shows spinner and disables the button when true
 *  className — extra Tailwind classes to merge in (e.g. "ml-auto")
 *  disabled  — additional disabled flag independent of isLoading
 */
const SubmitButton = ({ text = 'Submit', isLoading = false, className = '', disabled = false }) => (
  <button
    type="submit"
    disabled={isLoading || disabled}
    className={[
      'inline-flex items-center justify-center gap-2',
      'px-6 py-3 rounded-lg font-semibold text-sm text-white',
      'bg-primary hover:brightness-110 active:brightness-95',
      'transition-all duration-200',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:brightness-100',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {isLoading ? (
      <>
        {/* Spinner */}
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span>Please wait…</span>
      </>
    ) : (
      <span>{text}</span>
    )}
  </button>
);

export default SubmitButton;
