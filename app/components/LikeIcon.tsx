export function LikeIcon({
  filled = false,
  className,
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-4.35-9.5-8.5C.5 9.2 2.2 6 5.7 6c2 0 3.3 1.1 4.3 2.4C11 7.1 12.3 6 14.3 6c3.5 0 5.2 3.2 3.2 6.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}
