import { Activity, Home, Settings } from "lucide-react";
import { extendTheme } from "@/lib/themes/extend";
import { softBase } from "@/lib/themes/soft-base";

// ─── Foundation ───────────────────────────────────────────────────────────────
// Dark, data-forward and minimal (Whoop-like). Hierarchy comes from size,
// weight and gray value — not borders, shadows or decoration. Color carries
// meaning only: success for done, danger for destructive; everything else
// stays neutral. Visual-only: same skeleton, copy and behavior as the soft base.
//
// Palette → tokens
//   base #0B0C0E → screen      cards #14161A → surface    elevated #1C1F24 → surfaceLight/screenLight
//   text #F2F4F5 → text        secondary ≈ #8E9092 (text @ 56%)
//   success #19E68C            danger #FF4D5E             key actions → primary (neutral #F2F4F5)

const TAB_INACTIVE = "#737A84"; // tertiary-leaning gray that still meets 4.5:1 on the base
const HAIRLINE = "rgba(255,255,255,0.06)";
const TRACK = "rgba(255,255,255,0.12)"; // visible but quiet
const RING = "#6B717A"; // empty completion circle — mid-gray, clearly tappable

export const foundation = extendTheme(softBase, {
  name: "Foundation",
  description: "Dark, data-forward",
  icon: Activity,

  colors: {
    surface:      "#14161A", // cards
    surfaceDark:  "#363B43", // missed-day dots, faint dividers (visible on cards)
    surfaceLight: "#1C1F24", // elevated: inputs, pressed, unchecked controls
    screen:       "#0B0C0E", // base (near-black)
    screenDark:   "#08090A",
    screenLight:  "#1C1F24", // elevated
    primary:      "#F2F4F5", // key actions + active states stay neutral
    success:      "#19E68C", // completed habits, streaks
    text:         "#F2F4F5", // never pure white
    btnText:      "#0B0C0E", // dark text on light/green fills
    danger:       "#FF4D5E", // delete, sign out
  },
  opacity: {
    primaryDim: 0.08,
    primaryGlow: 0.14,
    successDim: 0.14,
    textSecondary: 0.56, // ≈ #8E9092 — 5.7:1 on cards
  },
  fonts: { body: "sans", display: "sans" }, // Roboto, tabular numerals via css()
  background: { color: "#0B0C0E", image: "none" },
  shadows: {
    raised: "none",
    inset:  "none",
    neuOut: "none",
    neuIn:  `inset 0 0 0 1px ${HAIRLINE}`, // hairline instead of depth
  },
  radius: { lg: "12px", xl: "16px", "2xl": "20px", "3xl": "24px" },
  // One consistent line set: house / activity / gear; active state changes color only
  navIcons: { main: Home, diag: Activity, cfg: Settings },
  // No per-habit emoji / color pickers or emoji display — keeps the UI data-first
  habitDecor: false,

  toast: {
    background: "#1C1F24",
    color: "rgb(var(--th-text))",
    border: `1px solid ${HAIRLINE}`,
    borderRadius: "16px",
    boxShadow: "none",
    fontFamily: "var(--font-theme)",
  },
  toastIcons: {
    success: { primary: "#19E68C", secondary: "#0B0C0E" },
    error: { primary: "#FF4D5E", secondary: "#0B0C0E" },
  },
  metaColor: "#0B0C0E",

  copy: {
    dateLabelCurrent: "{date}",     // e.g. "Monday, Oct 5" (uppercased by the label style)
    pendingSuffix: "of {total} left", // e.g. "11.5 of 12 left"
  },

  // Component styling the theme controls, via semantic `th-*` hooks
  // (unstyled in every other theme)
  css: (sel) => `
    ${sel} body { font-variant-numeric: tabular-nums; }

    /* Two weights: regular + medium */
    ${sel} .font-600, ${sel} .font-700, ${sel} .font-800 { font-weight: 500; }

    /* Spacing: 20px screen gutters */
    ${sel} .app-screen > div { padding-left: 20px; padding-right: 20px; }

    /* Cards: solid surface, 20px radius, no shadow / border */
    ${sel} .th-card { background-color: rgb(var(--th-surface)); border-color: transparent; border-radius: 20px; box-shadow: none; padding: 20px; }

    /* Type scale (the dashboard date uses the section-label style) */
    ${sel} .th-label, ${sel} .th-date { font-size: 12px; line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: rgb(var(--th-text) / 0.56); }
    ${sel} .th-hero { font-size: 56px; line-height: 1; font-weight: 500; letter-spacing: -0.02em; }
    ${sel} .th-stat { font-size: 28px; line-height: 1.15; font-weight: 500; letter-spacing: -0.02em; }

    /* Progress: accent fill on a visible track */
    ${sel} .th-track { height: 4px; background-color: ${TRACK}; box-shadow: none; }
    ${sel} .th-track > div { background: rgb(var(--th-success)) !important; transition-duration: 300ms; }

    /* Hero card: number + "x of y left" on top, full-width bar underneath */
    ${sel} .th-progress { flex-direction: column-reverse !important; align-items: stretch !important; gap: 16px; }
    ${sel} .th-progress .th-track { width: 100% !important; height: 6px; }
    ${sel} .th-progress > div:last-child { flex-direction: row !important; align-items: flex-end !important; justify-content: space-between; }

    /* Completion control: 44px circle — mid-gray ring when empty, accent fill + check when done */
    ${sel} .th-marker { width: 44px; height: 44px; box-shadow: none; }
    ${sel} .th-marker[aria-pressed="false"] { border: 1.5px solid ${RING}; background-color: transparent; }
    ${sel} .th-habit-body { padding-left: 0; } /* 16px gap from the circle */
    ${sel} .th-dot[data-done="false"] { opacity: 1 !important; } /* missed days visible; completed ones use the accent */
    ${sel} .th-marker[data-skipped] { border-style: dashed; } /* rest day */

    /* Native pickers (dates, times) render in dark mode */
    ${sel} input[type="date"], ${sel} input[type="time"] { color-scheme: dark; }

    /* Primary actions: pills, 48px+ tall */
    ${sel} .th-btn-primary { border-radius: 9999px; min-height: 48px; box-shadow: none; }

    /* Day picker: no strip border; selected = primary text + accent underline, others secondary */
    ${sel} .th-daystrip { box-shadow: none; }
    ${sel} .th-day[aria-pressed="true"] { background-color: transparent; box-shadow: none; color: rgb(var(--th-text)); }
    ${sel} .th-day[aria-pressed="true"]::after { content: ""; position: absolute; left: 50%; bottom: 5px; width: 16px; height: 2px; border-radius: 2px; background: rgb(var(--th-success)); transform: translateX(-50%); }
    ${sel} .th-day[aria-pressed="false"] { color: rgb(var(--th-text) / 0.56); }

    /* Secondary actions (Plan / Add to plan): quiet 40px text buttons */
    ${sel} .th-ghost, ${sel} .th-ghost:hover { background: transparent; box-shadow: none; }
    ${sel} .th-ghost { min-height: 40px; padding-top: 0; padding-bottom: 0; justify-content: flex-start; color: rgb(var(--th-text) / 0.56); }
    ${sel} .th-ghost:hover { color: rgb(var(--th-text)); }
    ${sel} .th-ghost.mb-6 { margin-bottom: 8px; }

    /* FAB: calm 56px elevated circle with a light plus, no glow */
    ${sel} .th-fab { width: 56px; height: 56px; background-color: rgb(var(--th-screen-light)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }
    ${sel} .th-fab svg { width: 24px; height: 24px; color: rgb(var(--th-text)); }

    /* Tab bar: base color, top hairline; active = primary text, inactive = muted gray */
    ${sel} nav { background-color: rgb(var(--th-screen)); border-top: 1px solid rgba(255,255,255,0.08); box-shadow: none; border-radius: 0; }
    ${sel} nav svg { stroke-width: 1.75px; } /* same weight active or not */
    ${sel} nav a > div { background-color: transparent; box-shadow: none; border-color: transparent; }
    ${sel} nav a[aria-current] > div { color: rgb(var(--th-text)); }
    ${sel} nav a:not([aria-current]) > div { color: ${TAB_INACTIVE}; }

    /* Scrollbars: thin and quiet */
    ${sel} * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
    ${sel} ::-webkit-scrollbar { width: 4px; height: 4px; }
    ${sel} ::-webkit-scrollbar-track { background: transparent; }
    ${sel} ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

    /* Destructive hover tint (replaces the light-theme red-50 wash) */
    ${sel} .hover\\:bg-red-50:hover { background-color: rgb(var(--th-danger) / 0.12); }

    /* Motion: 250ms ease-out, pressed = slight scale-down + elevated color */
    @media (prefers-reduced-motion: no-preference) {
      ${sel} button, ${sel} a > div, ${sel} .th-card { transition-duration: 250ms; transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
      ${sel} button:not(:disabled):active, ${sel} .th-card:active { transform: scale(0.98); }
      ${sel} .th-card:active { background-color: rgb(var(--th-screen-light)); }
    }
  `,
});
