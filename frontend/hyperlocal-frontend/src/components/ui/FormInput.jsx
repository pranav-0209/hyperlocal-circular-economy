/**
 * FormInput — reusable labeled input with optional material-symbol icon.
 *
 * Props:
 *  label       — visible label text
 *  name        — input id / name attribute
 *  type        — input type (default "text")
 *  value       — controlled value
 *  onChange    — change handler
 *  placeholder — placeholder text
 *  icon        — material-symbols-outlined ligature name (e.g. "person")
 *  disabled    — renders a read-only styled field
 *  error       — optional error string shown below input
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  disabled = false,
  error,
}) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={name} className="text-sm font-medium text-charcoal">
        {label}
      </label>
    )}

    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl pointer-events-none">
          {icon}
        </span>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          'w-full px-3 py-2 border rounded-lg text-sm transition-colors',
          icon ? 'pl-10' : '',
          disabled
            ? 'bg-gray-50 text-muted-green border-gray-200 cursor-not-allowed'
            : 'bg-white text-charcoal border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          error ? 'border-red-400' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>

    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

export default FormInput;
