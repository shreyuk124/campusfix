
export default function Skeleton({
  className = "",
  ...props
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[#EFE8DA] ${className}`}
      {...props}
    />
  );
}
