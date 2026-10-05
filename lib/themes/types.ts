import type { ComponentType, CSSProperties } from "react";
import type { LucideProps } from "lucide-react";
import type { CopyKey } from "@/lib/copy";
import type { FontKey } from "@/lib/themes/fonts";
import type { WallpaperAdjustments } from "@/lib/themes/wallpaper";

// ─── Theme Base ───────────────────────────────────────────────────────────────

/**
 * The component skeleton a theme renders with. Components branch on this
 * (via `isRetro` / `isSoft`) for *structure* — bezels vs rounded cards — while
 * every color, font, background and effect comes from the theme's tokens.
 */
export type ThemeBase = "retro" | "soft";

// ─── Tokens ───────────────────────────────────────────────────────────────────

/** All colors are hex strings (`#RRGGBB`). They become `th-*` Tailwind tokens. */
export interface ThemeColors {
  /** Bezel / card / nav background (`th-surface`) */
  surface: string;
  surfaceDark: string;
  surfaceLight: string;
  /** Main content background — CRT glass or paper (`th-screen`) */
  screen: string;
  screenDark: string;
  screenLight: string;
  /** Accent color — buttons, active states, retro text (`th-primary`) */
  primary: string;
  /** Completed / positive state (`th-success`) */
  success: string;
  /** Body text (`th-text`) */
  text: string;
  /** Text drawn on top of `primary` / `success` fills (`th-btn-text`) */
  btnText: string;
}

/** Alpha values (0–1) used to derive the translucent tokens from the base colors. */
export interface ThemeOpacity {
  primaryDim: number;
  primaryGlow: number;
  successDim: number;
  textSecondary: number;
}

export interface ThemeFonts {
  /** Everything using `font-theme` */
  body: FontKey;
  /** Page titles using `font-display` (defaults to `body`) */
  display?: FontKey;
}

/** Page background behind the shell. Any value is a raw CSS value. */
export interface ThemeBackground {
  /** Hex color; defaults to `colors.surface` */
  color?: string;
  /** e.g. `url("/themes/forest/bg.jpg")`, a gradient, or `none` */
  image?: string;
  size?: string;
  position?: string;
  repeat?: string;
  attachment?: string;
}

/**
 * Default wallpaper shown behind the app (soft base: the main screen turns
 * into a translucent veil over it). Users can replace it with their own photo.
 */
export interface ThemeWallpaper extends Partial<WallpaperAdjustments> {
  /** Path under public/, e.g. "/backgrounds/forest.jpg" */
  image: string;
}

export interface ThemeShadows {
  /** `shadow-th-raised` */
  raised: string;
  /** `shadow-th-inset` */
  inset: string;
  /** `shadow-neu-out` */
  neuOut: string;
  /** `shadow-neu-in` */
  neuIn: string;
}

/** Corner radii behind Tailwind's `rounded-lg/-xl/-2xl/-3xl` (any CSS length). */
export interface ThemeRadius {
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
}

/** Icon component taking lucide-react's props (a lucide icon or a custom SVG). */
export type ThemeIcon = ComponentType<LucideProps>;

/** Bottom-nav icons, keyed by destination. */
export interface ThemeNavIcons {
  main: ThemeIcon;
  diag: ThemeIcon;
  cfg: ThemeIcon;
}

/** Every icon the UI draws, by role. Base themes use lucide; themes override any subset. */
export type IconName =
  | "close" | "check" | "chevron" | "add" | "plan"
  | "streak" | "rate" | "best" | "edit" | "delete"
  | "appearance" | "notifications" | "account" | "logout"
  | "upload" | "reset";

export type ThemeIcons = Record<IconName, ThemeIcon>;

/** Fill for a completed star marker: a 3-stop gradient (light → mid → deep) plus glow color. */
export interface ThemeMarkerFill {
  stops: [string, string, string];
  glow: string;
}

/**
 * How the selected day / nav tab is shown (soft base):
 * "fill" = raised background chip; "frame" = no background, a gradient frame
 * (`frameFill`) around the selection and a slight enlarge on hover/press.
 */
export type ThemeSelection = "fill" | "frame";

/** Shape of the habit-card completion marker (soft base). */
export type ThemeMarker = "circle" | "star";

/** Decorative overlays. Only visible on retro-based themes. */
export interface ThemeEffects {
  /** `.text-glow` / `.text-signal` text-shadow */
  glow: boolean;
  /** Static scanlines + moving scanline bar on CRT screens */
  scanlines: boolean;
  /** CRT flicker animation */
  flicker: boolean;
  /** `.bg-graph-paper` grid */
  grid: boolean;
}

// ─── Definition ───────────────────────────────────────────────────────────────

export interface ThemeDefinition {
  /** Shown in the settings picker */
  name: string;
  description: string;
  icon: ThemeIcon;
  base: ThemeBase;
  colors: ThemeColors;
  opacity: ThemeOpacity;
  fonts: ThemeFonts;
  background: ThemeBackground;
  wallpaper?: ThemeWallpaper;
  shadows: ThemeShadows;
  radius: ThemeRadius;
  effects: ThemeEffects;
  navIcons: ThemeNavIcons;
  /** Icons used throughout the UI (`icons.add` is the floating add-habit button) */
  icons: ThemeIcons;
  marker: ThemeMarker;
  /** Completed star fill (defaults to the flat `success` color) */
  markerFill?: ThemeMarkerFill;
  selection?: ThemeSelection;
  /** Gradient + glow of the selection frame when `selection` is "frame" */
  frameFill?: ThemeMarkerFill;
  /** Every UI string, keyed by `CopyKey` */
  copy: Record<CopyKey, string>;
  /** Lines typed out during the dashboard boot animation (empty = skip animation) */
  bootLines: string[];
  /** react-hot-toast style; may use `var(--th-*)` tokens */
  toast: CSSProperties;
  /** Colors of the toast success / error icons (react-hot-toast `iconTheme`) */
  toastIcons?: {
    success: { primary: string; secondary: string };
    error: { primary: string; secondary: string };
  };
  /** Browser / PWA status bar color (hex) */
  metaColor: string;
  /**
   * Escape hatch for anything tokens can't express. Receives the theme's
   * selector (e.g. `html[data-theme="forest"]`) and returns raw CSS.
   */
  css?: (selector: string) => string;
  /**
   * Client component rendered above the whole app — corner decorations,
   * celebration effects, etc. Use `onHabitComplete()` from
   * `lib/themes/events.ts` to react to completions.
   */
  overlay?: ComponentType;
}

/** Everything a derived theme may override. Nested objects are merged one level deep. */
export interface ThemeOverrides
  extends Partial<Omit<ThemeDefinition, "colors" | "opacity" | "fonts" | "background" | "shadows" | "radius" | "effects" | "navIcons" | "icons" | "copy">> {
  name: string;
  description: string;
  colors?: Partial<ThemeColors>;
  opacity?: Partial<ThemeOpacity>;
  fonts?: Partial<ThemeFonts>;
  background?: Partial<ThemeBackground>;
  shadows?: Partial<ThemeShadows>;
  radius?: Partial<ThemeRadius>;
  effects?: Partial<ThemeEffects>;
  navIcons?: Partial<ThemeNavIcons>;
  icons?: Partial<ThemeIcons>;
  copy?: Partial<Record<CopyKey, string>>;
}
