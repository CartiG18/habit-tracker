import type { ThemeDefinition, ThemeOverrides } from "@/lib/themes/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a theme by inheriting everything from `parent` (usually `retro` or
 * `soft`) and overriding only what differs. Nested token groups (colors,
 * fonts, copy, …) are merged key-by-key.
 */
export function extendTheme(parent: ThemeDefinition, overrides: ThemeOverrides): ThemeDefinition {
  return {
    ...parent,
    ...overrides,
    colors: { ...parent.colors, ...overrides.colors },
    opacity: { ...parent.opacity, ...overrides.opacity },
    fonts: { ...parent.fonts, ...overrides.fonts },
    background: { ...parent.background, ...overrides.background },
    shadows: { ...parent.shadows, ...overrides.shadows },
    radius: { ...parent.radius, ...overrides.radius },
    effects: { ...parent.effects, ...overrides.effects },
    navIcons: { ...parent.navIcons, ...overrides.navIcons },
    icons: { ...parent.icons, ...overrides.icons },
    copy: { ...parent.copy, ...overrides.copy },
    toast: { ...parent.toast, ...overrides.toast },
  };
}
