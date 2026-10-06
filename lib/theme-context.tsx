"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  THEMES,
  THEME_STORAGE_KEY,
  getTheme,
  isThemeId,
  resolveThemeId,
  writeThemeCookie,
  ThemeId,
} from "@/lib/themes";
import type { ThemeBase, ThemeDefinition } from "@/lib/themes/types";
import {
  COLOR_OVERRIDES_KEY,
  COLOR_VARS_KEY,
  OVERRIDE_VARS,
  ColorOverrides,
  EditableColor,
  overrideVars,
} from "@/lib/themes/colors";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextType {
  /** Active theme id */
  theme: ThemeId;
  /** Full definition of the active theme (tokens, copy, boot lines, …) */
  def: ThemeDefinition;
  /** Component skeleton the active theme uses */
  base: ThemeBase;
  setTheme: (t: ThemeId) => void;
  isRetro: boolean;
  isSoft: boolean;
  /** The user's color overrides for the active theme (Preferences → Colors) */
  colorOverrides: ColorOverrides;
  /** Set one color for the active theme; `null` restores the theme default */
  setColor: (token: EditableColor, hex: string | null) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/** Stable empty value so effects keyed on overrides don't re-run every render */
const NO_OVERRIDES: ColorOverrides = {};

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ProviderProps {
  children: ReactNode;
  /** Theme the server rendered with (from the theme cookie) — keeps hydration consistent */
  initialTheme: ThemeId;
}

export function ThemeProvider({ children, initialTheme }: ProviderProps) {
  const { user, userProfile } = useAuth();

  // Start from what the server rendered so the first client render matches it
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);

  // Pre-cookie devices: adopt the localStorage theme after hydration (one-time migration)
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const migrated = resolveThemeId(stored);
    if (migrated && migrated !== initialTheme) setThemeState(migrated);
  }, [initialTheme]);

  // Sync from Firebase profile on first load (profile wins over localStorage)
  useEffect(() => {
    const remote = resolveThemeId(userProfile?.theme);
    if (remote) setThemeState(remote);
  }, [userProfile]);

  const def = getTheme(theme);

  // ─── Color overrides (per theme, on-device) ──────────────────────────────
  const [allOverrides, setAllOverrides] = useState<Record<string, ColorOverrides>>({});
  const [overridesLoaded, setOverridesLoaded] = useState(false);

  useEffect(() => {
    try {
      setAllOverrides(JSON.parse(localStorage.getItem(COLOR_OVERRIDES_KEY) || "{}"));
    } catch {}
    setOverridesLoaded(true);
  }, []);

  const colorOverrides = allOverrides[theme] ?? NO_OVERRIDES;

  // Apply as inline vars on <html> (beats the theme stylesheet) and persist,
  // including precomputed vars so the <head> script can paint them pre-hydration
  useEffect(() => {
    if (!overridesLoaded) return;
    const root = document.documentElement;
    OVERRIDE_VARS.forEach((k) => root.style.removeProperty(k));
    for (const [k, v] of Object.entries(overrideVars(def, colorOverrides))) root.style.setProperty(k, v);
    try {
      localStorage.setItem(COLOR_OVERRIDES_KEY, JSON.stringify(allOverrides));
      const vars = Object.fromEntries(
        Object.entries(allOverrides).filter(([id]) => isThemeId(id)).map(([id, o]) => [id, overrideVars(getTheme(id as ThemeId), o)])
      );
      localStorage.setItem(COLOR_VARS_KEY, JSON.stringify(vars));
    } catch {}
  }, [overridesLoaded, def, colorOverrides, allOverrides]);

  const setColor = useCallback(
    (token: EditableColor, hex: string | null) => {
      setAllOverrides((prev) => {
        const next = { ...(prev[theme] ?? {}) };
        if (hex) next[token] = hex;
        else delete next[token];
        return { ...prev, [theme]: next };
      });
    },
    [theme]
  );

  const resetColors = useCallback(() => {
    setAllOverrides((prev) => ({ ...prev, [theme]: {} }));
  }, [theme]);

  // Apply theme to <html>: data-theme selects the tokens, theme-<base> the skeleton CSS
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.remove(...Array.from(root.classList).filter((c) => c.startsWith("theme-")));
    root.classList.add(`theme-${def.base}`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", def.metaColor);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    writeThemeCookie(theme);
  }, [theme, def]);

  // Setter: writes to localStorage + Firebase
  const setTheme = useCallback(
    async (next: ThemeId) => {
      if (!(next in THEMES)) return;
      setThemeState(next);

      if (user) {
        try {
          await updateDoc(doc(db, "users", user.uid), { theme: next });
        } catch (err: any) {
          console.error("Failed to persist theme to Firebase:", err);
        }
      }
    },
    [user]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        def,
        base: def.base,
        setTheme,
        isRetro: def.base === "retro",
        isSoft: def.base === "soft",
        colorOverrides,
        setColor,
        resetColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** The active theme's icon set: `const Icon = useIcons(); <Icon.close className="w-5 h-5" />` */
export function useIcons() {
  return useTheme().def.icons;
}
