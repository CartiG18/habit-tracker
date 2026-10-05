"use client";

import type { LucideProps } from "lucide-react";

// ─── Twinkle Star ─────────────────────────────────────────────────────────────
// A 4-point star as seen through a telescope: slim concave spikes (vertical a
// touch longer than horizontal) around a softly glowing core. Filled, so
// `strokeWidth` is ignored.

export function TwinkleStarIcon({ className, strokeWidth: _strokeWidth, ...rest }: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.75))" }}
      aria-hidden
      {...rest}
    >
      <circle cx="12" cy="12" r="3.2" opacity="0.28" />
      <path d="M12 0.5C12.45 8.2 13.1 11.2 20 12C13.1 12.8 12.45 15.8 12 23.5C11.55 15.8 10.9 12.8 4 12C10.9 11.2 11.55 8.2 12 0.5Z" />
    </svg>
  );
}
