// Stylized "M" monogram adapted from Abdelkrim Meliani's business card logo,
// recolored onto the site's --accent/--foreground tokens instead of the
// reference's hardcoded hex so it themes correctly (including dark mode).
export function BrandMonogram({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="var(--accent)"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.35"
      />
      <line x1="20" y1="94" x2="100" y2="94" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="94" x2="48" y2="94" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M 28 94 L 28 42 L 52 18 L 60 48"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <line x1="22" y1="64" x2="48" y2="64" stroke="var(--accent)" strokeWidth="2.5" />
      <path
        d="M 44 94 L 44 26 L 68 12 L 76 68 L 92 24 L 92 94"
        stroke="var(--foreground)"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="26" y="92" width="4" height="4" fill="var(--accent)" />
      <rect x="90" y="92" width="4" height="4" fill="var(--foreground)" />
    </svg>
  );
}
