import React from 'react';

/**
 * Reusable checkbox component with label
 */
const FormCheckbox = ({
  id,
  checked,
  onChange,
  label,
  ariaLabel,
  error,
  disabled = false
}) => {
  return (
    <div>
      <div className="flex items-start gap-3 py-2">
        <input
          className={`mt-1 size-5 rounded cursor-pointer transition-colors shrink-0 focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-2 border-red-500 accent-red-500' : 'border-2 border-gray-300 accent-primary'
          }`}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          aria-label={ariaLabel || label}
          disabled={disabled}
        />
        <label className="text-sm text-muted-green leading-relaxed cursor-pointer flex-1" htmlFor={id}>
          {label}
        </label>
      </div>
      {error && (
        <p className="text-xs text-red-500 ml-8 mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormCheckbox;
