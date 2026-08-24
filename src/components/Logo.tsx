/**
 * Pork mark — a minimal snout inside a coin, rendered on the rose→ember
 * gradient. Pure SVG so it stays crisp at any size and needs no assets.
 */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Pork">
      <defs>
        <linearGradient id="porkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6fa0" />
          <stop offset="0.5" stopColor="#ff3d7f" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#porkGrad)" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {/* snout */}
      <rect x="13" y="16" width="22" height="16" rx="8" fill="#0b0708" opacity="0.92" />
      <ellipse cx="19.5" cy="24" rx="2.4" ry="3.2" fill="url(#porkGrad)" />
      <ellipse cx="28.5" cy="24" rx="2.4" ry="3.2" fill="url(#porkGrad)" />
    </svg>
  );
}
