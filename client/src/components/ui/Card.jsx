
export default function Card({
  children,
  title,
  description,
  className = "",
  contentClassName = "",
  ...props
}) {
  return (
    <section
      className={[
        "rounded-lg border border-line bg-white shadow-card",
        className,
      ].join(" ")}
      {...props}
    >
      {(title || description) && (
        <header className="border-b border-line px-4 py-4 sm:px-5">
          {title && (
            <h2 className="font-semibold text-ink">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </header>
      )}

      <div className={["p-4 sm:p-5", contentClassName].join(" ")}>
        {children}
      </div>
    </section>
  );
}
