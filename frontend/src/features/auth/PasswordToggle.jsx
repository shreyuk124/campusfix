import { Eye, EyeOff } from 'lucide-react';

export default function PasswordToggle({
  isVisible,
  onToggle,
  ariaLabel = isVisible ? 'Hide password' : 'Show password',
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:text-ink hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label={ariaLabel}
      title={ariaLabel}
      tabIndex={0}
    >
      {isVisible ? (
        <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
