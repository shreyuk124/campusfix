import { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Input({
  id,
  label,
  type = 'text',
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const inputClasses = [
    'block h-11 w-full rounded-md border bg-surface px-3',
    'text-base text-ink placeholder:text-muted',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2',
    error
      ? 'border-danger focus:border-danger focus:ring-danger-50'
      : 'border-line-strong focus:border-brand-500 focus:ring-brand-100',
    'disabled:cursor-not-allowed disabled:bg-surface-muted',
    'disabled:text-muted',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1 block text-sm font-medium text-ink"
      >
        {label}

        {required && (
          <span className="ml-1 text-muted">
            (required)
          </span>
        )}
      </label>

      <input
        {...inputProps}
        id={inputId}
        type={type}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={inputClasses}
      />

      {helperText && (
        <p
          id={helperId}
          className="mt-1 text-xs text-muted"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 flex items-start gap-1 text-xs text-danger"
        >
          <AlertCircle
            size={14}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
