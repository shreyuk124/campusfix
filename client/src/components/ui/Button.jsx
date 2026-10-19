
import { LoaderCircle } from "lucide-react";

const variants = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
  secondary:
    "border border-line-strong bg-white text-ink hover:bg-brand-50",
  ghost: "bg-transparent text-brand-500 hover:bg-brand-50",
  danger:
    "border border-danger bg-white text-danger hover:bg-danger-50",
  success: "bg-teal text-white hover:bg-teal-700",
};

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-[52px] px-5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md",
        "font-semibold transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-brand-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <LoaderCircle
          size={18}
          className="animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
