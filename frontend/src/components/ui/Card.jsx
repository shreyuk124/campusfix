export default function Card({
  children,
  as: Component = 'div',
  title,
  description,
  className = '',
  contentClassName = '',
  ...props
}) {
  const hasHeader = Boolean(title || description);

  if (hasHeader) {
    return (
      <Component
        className={`rounded-xl border border-line bg-surface shadow-card ${className}`}
        {...props}
      >
        <header className="border-b border-line px-5 py-4">
          {title && <h2 className="font-semibold text-ink text-base sm:text-lg">{title}</h2>}
          {description && <p className="mt-0.5 text-xs sm:text-sm text-muted">{description}</p>}
        </header>
        <div className={`p-5 sm:p-6 ${contentClassName}`}>{children}</div>
      </Component>
    );
  }

  return (
    <Component
      className={`rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
