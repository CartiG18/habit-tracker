"use client";

import { useId, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

// ─── Princess Icon Set ────────────────────────────────────────────────────────
// Storybook icons on lucide's 24×24 grid in the theme's pink + gold palette.
// They are full-color artwork (they ignore `currentColor`), so they read the
// same on cards, buttons and modals.

const GOLD = ["#FFF1B8", "#F2C14E", "#B8862B"] as const;
const GOLD_EDGE = "#B8862B";
const PINK = "#E0679A";
const PINK_LIGHT = "#F8C8DA";
const CREAM = "#FFF8E7";

/** Shared frame: provides a unique gold gradient id (`url(#…)`) to the artwork. */
function GoldIcon({ className, children }: { className?: string; children: (gold: string) => ReactNode }) {
  const id = `pg${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        {/* userSpaceOnUse: bounding-box gradients can't paint perfectly straight lines (zero-width bbox) */}
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor={GOLD[0]} />
          <stop offset="50%" stopColor={GOLD[1]} />
          <stop offset="100%" stopColor={GOLD[2]} />
        </linearGradient>
      </defs>
      {children(`url(#${id})`)}
    </svg>
  );
}

/** Tiny 4-point glint used as an accent on several icons. */
function Glint({ x, y, r = 1.6, fill }: { x: number; y: number; r?: number; fill: string }) {
  return (
    <path
      d={`M${x} ${y - r}Q${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y}Q${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r}Q${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y}Q${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r}Z`}
      fill={fill}
    />
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/** Appearance — a magic hand mirror */
export function MirrorIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M12 16.2v5.3" stroke={gold} strokeWidth={2.4} />
          <ellipse cx="12" cy="9" rx="5.6" ry="6.8" fill={PINK_LIGHT} stroke={gold} strokeWidth={1.8} />
          <path d="M9.4 6.2q1-1.6 2.6-1.9" stroke="#FFFFFF" strokeWidth={1.2} />
          <circle cx="12" cy="16.4" r="1.1" fill={PINK} />
          <Glint x={19.6} y={4.2} fill={gold} />
        </>
      )}
    </GoldIcon>
  );
}

/** Notifications — a golden bell with a pink bow */
export function BellBowIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M6.2 17v-5.3a5.8 5.8 0 0 1 11.6 0V17l1.6 1.9H4.6z" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.9} />
          <circle cx="12" cy="20.6" r="1.4" fill={PINK} />
          <path d="M12 5.2 8.6 3.2l.3 4zM12 5.2l3.4-2 -.3 4z" fill={PINK} />
          <circle cx="12" cy="5.3" r="1.1" fill={PINK} />
          <path d="M9 11.5q.6-2.2 2.4-3" stroke="#FFFFFF" strokeWidth={1} opacity={0.8} />
        </>
      )}
    </GoldIcon>
  );
}

/** Account — an ornate key with a heart in its bow */
export function KeyIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <circle cx="7" cy="12" r="4.2" stroke={gold} strokeWidth={2} />
          <path d="M7 14.1c-1.7-1-2.3-1.9-2.3-2.7a1.1 1.1 0 0 1 2.3-.4 1.1 1.1 0 0 1 2.3.4c0 .8-.6 1.7-2.3 2.7z" fill={PINK} />
          <path d="M11.2 12h10" stroke={gold} strokeWidth={2.2} />
          <path d="M18.6 12v3.2M15.6 12v2.2" stroke={gold} strokeWidth={2} />
        </>
      )}
    </GoldIcon>
  );
}

/** Sign out — a pumpkin coach (leaving the ball) */
export function CoachIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <ellipse cx="12" cy="12.5" rx="8.2" ry="6" fill={PINK} />
          <path d="M12 6.6v11.8M8 7.4q-2.2 5 0 10.2M16 7.4q2.2 5 0 10.2" stroke={PINK_LIGHT} strokeWidth={1.1} />
          <path d="M12 6.6q-.2-2.4 1.8-3.3M13.8 3.3q1.6.1 1.9 1.4" stroke={gold} strokeWidth={1.6} />
          <circle cx="7" cy="19.3" r="2.2" fill={CREAM} stroke={gold} strokeWidth={1.4} />
          <circle cx="17" cy="19.3" r="2.2" fill={CREAM} stroke={gold} strokeWidth={1.4} />
        </>
      )}
    </GoldIcon>
  );
}

/** Wallpaper upload — a gilded picture frame with a tiny flower */
export function FrameIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <rect x="3" y="4.5" width="15" height="15" rx="2.5" fill={CREAM} stroke={gold} strokeWidth={2} />
          <circle cx="10.5" cy="12" r="2.4" fill={PINK} />
          <circle cx="10.5" cy="12" r="0.9" fill={GOLD[1]} />
          <path d="M20 2.5v5M17.5 5h5" stroke={PINK} strokeWidth={1.8} />
        </>
      )}
    </GoldIcon>
  );
}

/** Reset — a swirl of magic */
export function SwirlIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M5 12a7 7 0 1 0 2.2-5.1" stroke={gold} strokeWidth={2} />
          <path d="M4.2 3.6 7.4 7l-3.6 1" stroke={gold} strokeWidth={2} />
          <Glint x={12} y={12} r={2.4} fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

// ─── Habits ───────────────────────────────────────────────────────────────────

/** Daily plan — a parchment scroll */
export function ScrollIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M6 4.5h11.5v13.8a2.2 2.2 0 0 1-2.2 2.2H6.5" fill={CREAM} stroke={gold} strokeWidth={1.6} />
          <path d="M6 4.5a2 2 0 0 0-2 2v1.5h4V6.5a2 2 0 0 0-2-2z" fill={gold} />
          <path d="M6.5 20.5a2.2 2.2 0 0 1-2.2-2.2V17h8.8v1.3a2.2 2.2 0 0 0 2.2 2.2" fill={CREAM} stroke={gold} strokeWidth={1.6} />
          <path d="M9.5 8.5h5.5M9.5 11.5h5.5M9.5 14.3h3.5" stroke={PINK} strokeWidth={1.4} />
        </>
      )}
    </GoldIcon>
  );
}

/** Streak — a shooting star */
export function ShootingStarIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M3 20.5 10 13.5M5.5 21.5l4.8-4.8M2.5 17.5l4.6-4.6" stroke={PINK} strokeWidth={1.5} />
          <path d="m15.5 2.8 1.9 3.8 4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3 4.2-.6z" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.8} />
        </>
      )}
    </GoldIcon>
  );
}

/** Success rate — a magic wand */
export function WandIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M4 20 14 10" stroke={gold} strokeWidth={2.4} />
          <path d="m16.5 3.2 1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z" fill={PINK} />
          <Glint x={20.5} y={13.5} r={1.5} fill={gold} />
          <Glint x={9.5} y={4.5} r={1.3} fill={gold} />
        </>
      )}
    </GoldIcon>
  );
}

/** Best streak — a jeweled crown */
export function CrownIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M3.5 8.5 7.8 12 12 5.5l4.2 6.5 4.3-3.5-1.8 9.5H5.3z" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.9} />
          <path d="M5.3 18h13.4v2H5.3z" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.9} />
          <circle cx="12" cy="14.3" r="1.5" fill={PINK} />
          <circle cx="3.5" cy="8.3" r="1.2" fill={PINK} />
          <circle cx="12" cy="5.3" r="1.2" fill={PINK} />
          <circle cx="20.5" cy="8.3" r="1.2" fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

/** Edit — a quill */
export function QuillIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M20.5 3.5C13 4 8.5 9 7.2 16.8l.1.1C15 15.5 20 11 20.5 3.5z" fill={PINK_LIGHT} stroke={PINK} strokeWidth={1.3} />
          <path d="M18 6.2 9.5 14.6" stroke={PINK} strokeWidth={1.1} />
          <path d="M7.2 16.8 4 20.2" stroke={gold} strokeWidth={2.2} />
        </>
      )}
    </GoldIcon>
  );
}

/** Delete — a broken heart */
export function BrokenHeartIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M12 20.5C5.5 16.5 3 13 3 9.6A4.6 4.6 0 0 1 12 7.6a4.6 4.6 0 0 1 9 2c0 3.4-2.5 6.9-9 10.9z" fill={PINK} />
          <path d="M12 7.6 10.4 11l2.6 2-1.8 3.4" stroke="#FFFFFF" strokeWidth={1.4} />
          <Glint x={19.8} y={3.8} r={1.4} fill={gold} />
        </>
      )}
    </GoldIcon>
  );
}

/** Close — a golden × with a pink heart-dot */
export function CloseIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M6 6l12 12M18 6 6 18" stroke={gold} strokeWidth={2.4} />
          <circle cx="12" cy="12" r="1.5" fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

/** Card chevron — a slim golden arrow */
export function ChevronIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => <path d="m9 5.5 6.5 6.5L9 18.5" stroke={gold} strokeWidth={2.2} />}
    </GoldIcon>
  );
}

// ─── Habit States ─────────────────────────────────────────────────────────────

/** Rest day — a sleepy cloud with drifting z's */
export function RestCloudIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M7 19.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 6.9 11 4.25 4.25 0 0 0 7 19.5z" fill={PINK_LIGHT} stroke={PINK} strokeWidth={1.3} />
          <path d="M9.3 15q1 .9 2 0M12.8 15q1 .9 2 0" stroke={PINK} strokeWidth={1.1} />
          <path d="M17.5 3h3l-3 3.2h3" stroke={gold} strokeWidth={1.5} />
        </>
      )}
    </GoldIcon>
  );
}

/** Archive — a treasure chest */
export function ChestIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M3.5 11h17v8.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" fill={PINK} />
          <path d="M3.5 11V9a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5v2z" fill={PINK_LIGHT} stroke={PINK} strokeWidth={1.1} />
          <path d="M3.5 11h17M8 4.6V21M16 4.6V21" stroke={gold} strokeWidth={1.5} />
          <rect x="10.4" y="10" width="3.2" height="4" rx="0.8" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.6} />
        </>
      )}
    </GoldIcon>
  );
}

/** Pause — an hourglass */
export function HourglassIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M6 3h12M6 21h12" stroke={gold} strokeWidth={2.2} />
          <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" stroke={gold} strokeWidth={1.5} />
          <path d="M9.2 6.5h5.6c-.4 1.6-2 2.6-2.8 3.8-.8-1.2-2.4-2.2-2.8-3.8zM8.8 20q.6-3.4 3.2-4.2 2.6.8 3.2 4.2z" fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

/** Resume — a golden play arrow with a glint */
export function PlaySparkIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M7 4.8v14.4a1 1 0 0 0 1.5.9l11.3-7.2a1 1 0 0 0 0-1.8L8.5 3.9A1 1 0 0 0 7 4.8z" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.8} />
          <Glint x={4} y={5} r={1.5} fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

/** History — an open storybook */
export function StorybookIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M12 6.5C9.5 4.8 6.5 4.5 3 5v13.5c3.5-.5 6.5-.2 9 1.5 2.5-1.7 5.5-2 9-1.5V5c-3.5-.5-6.5-.2-9 1.5z" fill={CREAM} stroke={gold} strokeWidth={1.6} />
          <path d="M12 6.5V20" stroke={gold} strokeWidth={1.4} />
          <path d="M5.5 9.5q2.5-.4 4.5.5M5.5 12.5q2.5-.4 4.5.5M14 10q2-.9 4.5-.5" stroke={PINK} strokeWidth={1.1} />
          <path d="M16.2 12.3c-.9-.5-1.2-1-1.2-1.4a.6.6 0 0 1 1.2-.2.6.6 0 0 1 1.2.2c0 .4-.3.9-1.2 1.4z" fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

/** Drag handle — two columns of gold pearls */
export function PearlGripIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          {[6, 12, 18].map((y) => (
            <g key={y}>
              <circle cx="9" cy={y} r="1.7" fill={gold} />
              <circle cx="15" cy={y} r="1.7" fill={gold} />
            </g>
          ))}
        </>
      )}
    </GoldIcon>
  );
}

// ─── Time of Day ──────────────────────────────────────────────────────────────

/** Morning — sunrise over a pink horizon */
export function SunriseIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M6 17a6 6 0 0 1 12 0z" fill={gold} />
          <path d="M12 4.5v2.5M4.6 9.6l1.8 1.5M19.4 9.6l-1.8 1.5" stroke={gold} strokeWidth={1.6} />
          <path d="M2.5 17.5h19M6 20.5h12" stroke={PINK} strokeWidth={1.6} />
        </>
      )}
    </GoldIcon>
  );
}

/** Afternoon — a full golden sun */
export function SunIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <circle cx="12" cy="12" r="4.5" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.8} />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke={PINK} strokeWidth={1.6} />
        </>
      )}
    </GoldIcon>
  );
}

/** Evening — a crescent moon with a twinkling star */
export function MoonStarIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <path d="M15.5 19.5A8 8 0 0 1 10.6 4a7 7 0 1 0 9.2 10.8 8 8 0 0 1-4.3 4.7z" fill={gold} stroke={GOLD_EDGE} strokeWidth={0.8} />
          <Glint x={18.5} y={6} r={2.2} fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

/** Dates — a gilded calendar page */
export function CalendarIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => (
        <>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill={CREAM} stroke={gold} strokeWidth={1.6} />
          <path d="M3.5 9.5h17" stroke={gold} strokeWidth={1.6} />
          <path d="M8 3v4M16 3v4" stroke={gold} strokeWidth={1.8} />
          <path d="M12 17.6c-1.8-1.1-2.6-2.1-2.6-3a1.3 1.3 0 0 1 2.6-.5 1.3 1.3 0 0 1 2.6.5c0 .9-.8 1.9-2.6 3z" fill={PINK} />
        </>
      )}
    </GoldIcon>
  );
}

/** Increment — a golden plus */
export function PlusGoldIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => <path d="M12 5v14M5 12h14" stroke={gold} strokeWidth={2.6} />}
    </GoldIcon>
  );
}

/** Decrement — a golden minus */
export function MinusGoldIcon({ className }: LucideProps) {
  return (
    <GoldIcon className={className}>
      {(gold) => <path d="M5 12h14" stroke={gold} strokeWidth={2.6} />}
    </GoldIcon>
  );
}
