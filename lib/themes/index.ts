import type { ThemeDefinition } from "@/lib/themes/types";
import { retro } from "@/lib/themes/retro";
import { foundation } from "@/lib/themes/foundation";
import { princess } from "@/lib/themes/princess";
import { FONT_FILES } from "@/lib/themes/fonts";
import { COLOR_VARS_KEY, hexToChannels } from "@/lib/themes/colors";
import { WALLPAPER_DEFAULTS, WALLPAPER_IMAGE_KEY, WALLPAPER_SETTINGS_KEY, wallpaperVars } from "@/lib/themes/wallpaper";

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add a theme by creating `lib/themes/<id>.ts` and listing it here.
// The key is the theme id persisted to localStorage and Firestore.
// Theme files import `extendTheme` from "@/lib/themes/extend" (not this file)
// to avoid a circular import.
// Order here is the order in the settings picker.

export const THEMES = {
  retro,
  foundation,
  princess,
} satisfies Record<string, ThemeDefinition>;

export type ThemeId = keyof typeof THEMES;

export const DEFAULT_THEME_ID: ThemeId = "retro";
export const THEME_STORAGE_KEY = "synapse-theme";

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEMES;
}

/** Renamed themes: old ids still stored in localStorage / cookies / Firestore. */
const LEGACY_THEME_IDS: Record<string, ThemeId> = { soft: "foundation" };

/** Validate a stored theme id, upgrading legacy ids. Null if unknown. */
export function resolveThemeId(value: unknown): ThemeId | null {
  if (isThemeId(value)) return value;
  return typeof value === "string" && value in LEGACY_THEME_IDS ? LEGACY_THEME_IDS[value] : null;
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES[id] ?? THEMES[DEFAULT_THEME_ID];
}

// ─── CSS Generation ───────────────────────────────────────────────────────────

function themeSelector(id: string): string {
  return `html[data-theme="${id}"]`;
}

function buildOne(id: string, t: ThemeDefinition): string {
  const sel = themeSelector(id);
  const c = (hex: string) => hexToChannels(hex);
  const a = (hex: string, alpha: number) => `rgb(${c(hex)} / ${alpha})`;
  const bg = t.background;

  const vars: Record<string, string> = {
    "--th-surface": c(t.colors.surface),
    "--th-surface-dark": c(t.colors.surfaceDark),
    "--th-surface-light": c(t.colors.surfaceLight),
    "--th-screen": c(t.colors.screen),
    "--th-screen-dark": c(t.colors.screenDark),
    "--th-screen-light": c(t.colors.screenLight),
    "--th-primary": c(t.colors.primary),
    "--th-primary-dim": a(t.colors.primary, t.opacity.primaryDim),
    "--th-primary-glow": a(t.colors.primary, t.opacity.primaryGlow),
    "--th-success": c(t.colors.success),
    "--th-success-dim": a(t.colors.success, t.opacity.successDim),
    "--th-text": c(t.colors.text),
    "--th-text-secondary": a(t.colors.text, t.opacity.textSecondary),
    "--th-btn-text": c(t.colors.btnText),
    "--th-danger": c(t.colors.danger),

    // Generic fallbacks keep text styled even if a font variable is ever missing
    // (an undefined var() would otherwise invalidate the whole stack)
    "--font-theme": `var(--font-${t.fonts.body}, sans-serif)`,
    "--font-display": `var(--font-${t.fonts.display ?? t.fonts.body}, sans-serif)`,

    "--shadow-raised": t.shadows.raised,
    "--shadow-inset": t.shadows.inset,
    "--shadow-neu-out": t.shadows.neuOut,
    "--shadow-neu-in": t.shadows.neuIn,

    "--radius-lg": t.radius.lg,
    "--radius-xl": t.radius.xl,
    "--radius-2xl": t.radius["2xl"],
    "--radius-3xl": t.radius["3xl"],

    "--th-bg-color": c(bg.color ?? t.colors.surface),
    "--th-bg-image": bg.image ?? "none",
    "--th-bg-size": bg.size ?? "auto",
    "--th-bg-position": bg.position ?? "0 0",
    "--th-bg-repeat": bg.repeat ?? "repeat",
    "--th-bg-attachment": bg.attachment ?? "scroll",

    ...(t.frameFill && {
      "--frame-1": t.frameFill.stops[0],
      "--frame-2": t.frameFill.stops[1],
      "--frame-3": t.frameFill.stops[2],
      "--frame-glow": t.frameFill.glow,
    }),

    "--wallpaper-image": t.wallpaper ? `url("${t.wallpaper.image}")` : "none",
    ...wallpaperVars({ ...WALLPAPER_DEFAULTS, ...t.wallpaper }),
  };

  const rules = [
    `${sel}{${Object.entries(vars).map(([k, v]) => `${k}:${v};`).join("")}}`,
  ];

  if (!t.effects.glow) rules.push(`${sel} .text-glow,${sel} .text-signal{text-shadow:none;}`);
  if (!t.effects.scanlines) rules.push(`${sel} .scanline-overlay,${sel} .crt-screen::before{display:none;}`);
  if (!t.effects.flicker) rules.push(`${sel} .crt-screen::after{display:none;}`);
  if (!t.effects.grid) rules.push(`${sel} .bg-graph-paper{background-image:none;}`);
  if (t.css) rules.push(t.css(sel));

  return rules.join("\n");
}

/** @font-face rules + `--font-<key>` variables for the file-based fonts. */
function buildFontFaces(): string {
  return Object.entries(FONT_FILES)
    .map(([key, f]) => {
      const format = f.src.endsWith(".woff2") ? "woff2" : f.src.endsWith(".woff") ? "woff" : f.src.endsWith(".otf") ? "opentype" : "truetype";
      return `@font-face{font-family:"${f.family}";src:local("${f.family}"),url("${f.src}") format("${format}");font-display:swap;}\n:root{--font-${key}:"${f.family}", ${f.fallback};}`;
    })
    .join("\n");
}

/** Stylesheet with the tokens for every registered theme. Rendered once in the root layout. */
export function buildThemeStylesheet(): string {
  return [buildFontFaces(), ...Object.entries(THEMES).map(([id, t]) => buildOne(id, t))].join("\n");
}

/**
 * Persist the theme in a cookie so the server renders the right theme on the
 * next request (no hydration mismatch, no flash of the default theme).
 */
export function writeThemeCookie(id: ThemeId) {
  document.cookie = `${THEME_STORAGE_KEY}=${id}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Blocking script for <head>, run before first paint:
 *  1. Theme — the server already rendered the cookie's theme; this only covers
 *     devices with a localStorage theme but no cookie yet (pre-cookie installs).
 *  2. Colors — the user's color overrides for the active theme (precomputed vars).
 *  3. Wallpaper — applies the user's on-device wallpaper choice/adjustments so
 *     the theme default never flashes first. Mirrors `wallpaperVars()`.
 */
export function buildThemeInitScript(): string {
  const bases = Object.fromEntries(Object.entries(THEMES).map(([id, t]) => [id, t.base]));
  const key = JSON.stringify(THEME_STORAGE_KEY);
  const d = WALLPAPER_DEFAULTS;
  return `(function(){var d=document.documentElement;
try{var b=${JSON.stringify(bases)};if(document.cookie.indexOf(${key}+"=")===-1){var t=localStorage.getItem(${key});t=${JSON.stringify(LEGACY_THEME_IDS)}[t]||t;if(b[t]){d.setAttribute("data-theme",t);d.className=d.className.replace(/\\btheme-\\S+/g,"").trim()+" theme-"+b[t];document.cookie=${key}+"="+t+"; path=/; max-age=31536000; samesite=lax";}}}catch(e){}
try{var cv=JSON.parse(localStorage.getItem(${JSON.stringify(COLOR_VARS_KEY)})||"null");var mine=cv&&cv[d.getAttribute("data-theme")];if(mine)for(var k in mine)d.style.setProperty(k,mine[k]);}catch(e){}
try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(WALLPAPER_SETTINGS_KEY)})||"null");if(s){var p=function(k,v){d.style.setProperty(k,String(v))};
if(s.source==="none"){d.removeAttribute("data-wallpaper")}else if(s.source==="custom"){var im=localStorage.getItem(${JSON.stringify(WALLPAPER_IMAGE_KEY)});if(im){d.setAttribute("data-wallpaper","custom");p("--wallpaper-image",'url("'+im+'")')}}
var a=s.adjust||{};if(a.fit){p("--wallpaper-size",a.fit==="tile"?"auto":a.fit);p("--wallpaper-repeat",a.fit==="tile"?"repeat":"no-repeat")}
if(a.x!=null||a.y!=null)p("--wallpaper-position",(a.x==null?${d.x}:a.x)+"% "+(a.y==null?${d.y}:a.y)+"%");if(a.zoom!=null)p("--wallpaper-zoom",a.zoom);if(a.dim!=null)p("--wallpaper-dim",a.dim)}}catch(e){}
})();`;
}
