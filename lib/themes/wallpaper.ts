// ─── Wallpaper ────────────────────────────────────────────────────────────────
// Shared by the theme stylesheet generator (theme defaults) and the wallpaper
// provider (user adjustments). Everything resolves to `--wallpaper-*` CSS vars
// consumed by `.wallpaper-layer` in globals.css.

export type WallpaperFit = "cover" | "contain" | "tile";

export interface WallpaperAdjustments {
  fit: WallpaperFit;
  /** Focus point, 0–100 (%) */
  x: number;
  y: number;
  /** 1 = no zoom */
  zoom: number;
  /** Opacity of the screen-colored veil over the wallpaper, 0–0.9 */
  dim: number;
}

export const WALLPAPER_DEFAULTS: WallpaperAdjustments = { fit: "cover", x: 50, y: 50, zoom: 1, dim: 0.35 };

export const WALLPAPER_IMAGE_KEY = "synapse-wallpaper-image";
export const WALLPAPER_SETTINGS_KEY = "synapse-wallpaper";

/** CSS custom properties for a (partial) set of adjustments. */
export function wallpaperVars(a: Partial<WallpaperAdjustments>): Record<string, string> {
  const vars: Record<string, string> = {};
  if (a.fit) {
    vars["--wallpaper-size"] = a.fit === "tile" ? "auto" : a.fit;
    vars["--wallpaper-repeat"] = a.fit === "tile" ? "repeat" : "no-repeat";
  }
  if (a.x !== undefined || a.y !== undefined) {
    vars["--wallpaper-position"] = `${a.x ?? WALLPAPER_DEFAULTS.x}% ${a.y ?? WALLPAPER_DEFAULTS.y}%`;
  }
  if (a.zoom !== undefined) vars["--wallpaper-zoom"] = String(a.zoom);
  if (a.dim !== undefined) vars["--wallpaper-dim"] = String(a.dim);
  return vars;
}
