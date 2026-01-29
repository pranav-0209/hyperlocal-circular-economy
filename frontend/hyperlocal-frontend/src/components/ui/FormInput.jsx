import React from 'react';

/**
 * Reusable form input component with icon, label, and error handling
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  icon,
  value,
  onChange,
  placeholder,
  error,
  ariaLabel,
  disabled = false
}) => {
  const borderColor = error ? 'border-red-500' : 'border-gray-300';
  const focusBorder = error ? 'focus:border-red-400' : 'focus:border-primary';
  
  return (
    <div className="group">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-2 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          className={`w-full pl-11 pr-4 h-11 rounded-lg border transition-all text-charcoal placeholder:text-muted-green/40 text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${borderColor} ${focusBorder}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-0.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
