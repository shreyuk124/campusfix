import React from 'react';
import { LoaderCircle } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  secondary:
    'border border-line-strong bg-white text-ink hover:bg-brand-50',
  outline:
    'border border-line-strong bg-transparent text-ink hover:bg-surface-muted',
  ghost:
    'bg-transparent text-brand-500 hover:bg-brand-50',
  danger:
    'border border-danger bg-white text-danger hover:bg-danger-50',
  success:
    'bg-teal text-white hover:bg-teal-700',
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-[52px] px-5 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const buttonClasses = [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-semibold transition-colors duration-150',
    'focus-visible:outline focus-visible:outline-2',
    'focus-visible:outline-offset-2 focus-visible:outline-brand-500',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && (
        <LoaderCircle
          size={18}
          className="animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

export default Button;
