
import { useId } from "react";
import { AlertCircle } from "lucide-react";

export default function Input({
  label,
  hint,
  error,
  required = false,
  id,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
    props["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
          {required && (
            <span className="ml-1 text-muted">(required)</span>
          )}
        </label>
      )}

      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "min-h-11 w-full rounded-md border bg-white px-3",
          "text-base text-body placeholder:text-muted",
          "focus:border-brand-500 focus:outline-none",
          "focus:ring-2 focus:ring-brand-100",
          error ? "border-danger" : "border-line-strong",
          className,
        ].join(" ")}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="mt-1.5 flex items-center gap-1.5 text-sm text-danger"
          role="alert"
        >
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
