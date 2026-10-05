import type { ThemeDefinition } from "@/lib/themes/types";

// ─── Color Overrides ──────────────────────────────────────────────────────────
// Users can recolor a theme's main tokens (Preferences → Colors). Overrides are
// stored per theme on-device; this module turns them into `--th-*` CSS vars,
// deriving the companion shades/alphas the way the theme stylesheet does.

export type EditableColor = "surface" | "screen" | "primary" | "success" | "text";

export const EDITABLE_COLORS: EditableColor[] = ["surface", "screen", "primary", "success", "text"];

export type ColorOverrides = Partial<Record<EditableColor, string>>;

/** { [themeId]: ColorOverrides } — the user's picks */
export const COLOR_OVERRIDES_KEY = "synapse-colors";
/** { [themeId]: { [cssVar]: value } } — precomputed vars for the pre-paint <head> script */
export const COLOR_VARS_KEY = "synapse-color-vars";

/** Every CSS var an override can set (so stale ones can be cleared). */
export const OVERRIDE_VARS = [
  "--th-surface", "--th-surface-dark",
  "--th-screen", "--th-screen-dark",
  "--th-primary", "--th-primary-dim", "--th-primary-glow",
  "--th-success", "--th-success-dim",
  "--th-text", "--th-text-secondary",
];

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `#FFB000` → `255 176 0` (the channel format Tailwind's `<alpha-value>` expects) */
export function hexToChannels(hex: string): string {
  return parseHex(hex).join(" ");
}

/** Mix toward black by `amount` (0–1), returned as channels. */
function darkenChannels(hex: string, amount: number): string {
  return parseHex(hex).map((c) => Math.round(c * (1 - amount))).join(" ");
}

/** CSS vars for a theme's color overrides (companion shades derived automatically). */
export function overrideVars(t: ThemeDefinition, o: ColorOverrides): Record<string, string> {
  const v: Record<string, string> = {};
  const a = (hex: string, alpha: number) => `rgb(${hexToChannels(hex)} / ${alpha})`;
  if (o.surface) {
    v["--th-surface"] = hexToChannels(o.surface);
    v["--th-surface-dark"] = darkenChannels(o.surface, 0.14);
  }
  if (o.screen) {
    v["--th-screen"] = hexToChannels(o.screen);
    v["--th-screen-dark"] = darkenChannels(o.screen, 0.07);
  }
  if (o.primary) {
    v["--th-primary"] = hexToChannels(o.primary);
    v["--th-primary-dim"] = a(o.primary, t.opacity.primaryDim);
    v["--th-primary-glow"] = a(o.primary, t.opacity.primaryGlow);
  }
  if (o.success) {
    v["--th-success"] = hexToChannels(o.success);
    v["--th-success-dim"] = a(o.success, t.opacity.successDim);
  }
  if (o.text) {
    v["--th-text"] = hexToChannels(o.text);
    v["--th-text-secondary"] = a(o.text, t.opacity.textSecondary);
  }
  return v;
}
