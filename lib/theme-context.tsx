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
import { ThemeMode } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "synapse-theme";
const DEFAULT_THEME: ThemeMode = "retro";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  isRetro: boolean;
  isSoft: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth();

  // Hydrate from localStorage synchronously to avoid FOUC
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "soft" ? "soft" : "retro";
  });

  // Sync from Firebase profile on first load (profile wins over localStorage)
  useEffect(() => {
    if (userProfile?.theme) {
      setThemeState(userProfile.theme);
      localStorage.setItem(STORAGE_KEY, userProfile.theme);
    }
  }, [userProfile]);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-retro", "theme-soft");
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  // Setter: writes to localStorage + Firebase
  const setTheme = useCallback(
    async (next: ThemeMode) => {
      setThemeState(next);
      localStorage.setItem(STORAGE_KEY, next);

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
        setTheme,
        isRetro: theme === "retro",
        isSoft: theme === "soft",
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
