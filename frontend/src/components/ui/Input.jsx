import { useId, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    id,
    label,
    type = 'text',
    helperText,
    error,
    required = false,
    disabled = false,
    className = '',
    endAdornment,
    ...inputProps
  },
  ref
) {
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
    endAdornment ? 'pr-11' : '',
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
      {label && (
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
      )}

      <div className="relative">
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={inputClasses}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAdornment}
          </div>
        )}
      </div>

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
});

export default Input;

