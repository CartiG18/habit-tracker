"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useTheme } from "@/lib/theme-context";
import {
  WALLPAPER_DEFAULTS,
  WALLPAPER_IMAGE_KEY,
  WALLPAPER_SETTINGS_KEY,
  WallpaperAdjustments,
  wallpaperVars,
} from "@/lib/themes/wallpaper";

// ─── Types ────────────────────────────────────────────────────────────────────

/** theme = the active theme's default wallpaper, custom = the user's photo */
export type WallpaperSource = "theme" | "custom" | "none";

interface StoredSettings {
  source: WallpaperSource;
  /** Only the adjustments the user changed; the rest come from the theme */
  adjust: Partial<WallpaperAdjustments>;
}

interface WallpaperContextType {
  source: WallpaperSource;
  /** The user's uploaded photo (data URL), if any */
  customImage: string | null;
  /** Image currently shown, or null for none */
  activeImage: string | null;
  /** Effective adjustments (theme defaults merged with user changes) */
  adjust: WallpaperAdjustments;
  hasThemeWallpaper: boolean;
  setSource: (s: WallpaperSource) => void;
  setAdjust: (a: Partial<WallpaperAdjustments>) => void;
  resetAdjust: () => void;
  /** Downscale + store a photo on this device and switch to it. Resolves false on failure. */
  uploadImage: (file: File) => Promise<boolean>;
}

const WallpaperContext = createContext<WallpaperContextType | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_EDGE = 1600; // px — plenty for phone screens, keeps the stored image well under 1MB

/** Decode an image file and re-encode it as a downscaled JPEG data URL. */
async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read that image"));
      i.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function readSettings(): StoredSettings | null {
  try {
    const raw = localStorage.getItem(WALLPAPER_SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as StoredSettings) : null;
  } catch {
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const { def } = useTheme();
  const [source, setSourceState] = useState<WallpaperSource>("theme");
  const [userAdjust, setUserAdjust] = useState<Partial<WallpaperAdjustments>>({});
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load on-device settings after mount (the <head> script already painted them)
  useEffect(() => {
    const stored = readSettings();
    if (stored) {
      setSourceState(stored.source);
      setUserAdjust(stored.adjust ?? {});
    }
    try {
      setCustomImage(localStorage.getItem(WALLPAPER_IMAGE_KEY));
    } catch {}
    setLoaded(true);
  }, []);

  const hasThemeWallpaper = !!def.wallpaper;
  const activeImage =
    source === "custom" ? customImage : source === "theme" ? def.wallpaper?.image ?? null : null;

  // Apply to <html>: data-wallpaper toggles the layer; inline vars override theme defaults
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    if (activeImage) root.setAttribute("data-wallpaper", source);
    else root.removeAttribute("data-wallpaper");

    if (source === "custom" && customImage) root.style.setProperty("--wallpaper-image", `url("${customImage}")`);
    else root.style.removeProperty("--wallpaper-image");

    for (const k of ["--wallpaper-size", "--wallpaper-repeat", "--wallpaper-position", "--wallpaper-zoom", "--wallpaper-dim"]) {
      root.style.removeProperty(k);
    }
    for (const [k, v] of Object.entries(wallpaperVars(userAdjust))) root.style.setProperty(k, v);
  }, [loaded, source, customImage, activeImage, userAdjust]);

  // Persist settings (not the image — that's written once on upload)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(WALLPAPER_SETTINGS_KEY, JSON.stringify({ source, adjust: userAdjust } satisfies StoredSettings));
    } catch {}
  }, [loaded, source, userAdjust]);

  const setAdjust = useCallback((a: Partial<WallpaperAdjustments>) => {
    setUserAdjust((prev) => ({ ...prev, ...a }));
  }, []);

  const resetAdjust = useCallback(() => setUserAdjust({}), []);

  const uploadImage = useCallback(async (file: File) => {
    try {
      const dataUrl = await downscale(file);
      localStorage.setItem(WALLPAPER_IMAGE_KEY, dataUrl); // may throw if storage is full
      setCustomImage(dataUrl);
      setSourceState("custom");
      setUserAdjust({});
      return true;
    } catch (err: any) {
      console.error("Wallpaper upload failed:", err);
      return false;
    }
  }, []);

  // Matches what's on screen: the theme stylesheet always sets its wallpaper
  // defaults, and the user's changes override them inline.
  const { image: _themeImage, ...themeAdjust } = def.wallpaper ?? { image: "" };
  const adjust: WallpaperAdjustments = { ...WALLPAPER_DEFAULTS, ...themeAdjust, ...userAdjust };

  return (
    <WallpaperContext.Provider
      value={{
        source,
        customImage,
        activeImage,
        adjust,
        hasThemeWallpaper,
        setSource: setSourceState,
        setAdjust,
        resetAdjust,
        uploadImage,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallpaper() {
  const ctx = useContext(WallpaperContext);
  if (!ctx) throw new Error("useWallpaper must be used within WallpaperProvider");
  return ctx;
}
