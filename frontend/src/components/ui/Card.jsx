export default function Card({
  children,
  className = '',
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
