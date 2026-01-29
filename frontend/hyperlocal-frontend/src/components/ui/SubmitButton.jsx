import React from 'react';

/**
 * Reusable form submit button with loading state
 */
const SubmitButton = ({
  loading,
  disabled = false,
  label,
  loadingLabel,
  icon = 'arrow_forward'
}) => {
  return (
    <button
      className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary text-base"
      type="submit"
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <span className="animate-spin material-symbols-outlined text-xl">sync</span>
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <span className="material-symbols-outlined text-xl group-hover:translate-x-1 group-hover:scale-110 transition-all">
            {icon}
          </span>
        </>
      )}
    </button>
  );
};

export default SubmitButton;
