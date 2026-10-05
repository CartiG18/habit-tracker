"use client";

import { useTheme } from "@/lib/theme-context";

/** Renders the active theme's `overlay` (decorations, celebration effects), if any. */
export function ThemeOverlay() {
  const { def } = useTheme();
  const Overlay = def.overlay;
  return Overlay ? <Overlay /> : null;
}
