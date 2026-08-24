/**
 * Official token check badge. Monochrome, scales with the surrounding text
 * (1em), so it sits inline next to a token name.
 */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="Official token"
      className={`inline-block h-[0.9em] w-[0.9em] shrink-0 align-middle ${className ?? ""}`}
    >
      <title>Official</title>
      <circle cx="12" cy="12" r="11" fill="#000" />
      <path
        d="M6.8 12.4 l3.4 3.4 L17.2 8.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
