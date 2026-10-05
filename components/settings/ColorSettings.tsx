"use client";

import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy";
import { useTheme, useIcons } from "@/lib/theme-context";
import { EDITABLE_COLORS, EditableColor } from "@/lib/themes/colors";
import type { CopyKey } from "@/lib/copy";

const LABELS: Record<EditableColor, CopyKey> = {
  surface: "colorSurface",
  screen: "colorScreen",
  primary: "colorPrimary",
  success: "colorSuccess",
  text: "colorText",
};

/** Ring marking the active swatch (gold frame in themes that use one). */
const ACTIVE_RING = "ring-2 ring-offset-2 ring-offset-th-surface ring-[color:var(--frame-2,rgb(var(--th-primary)))]";

/**
 * Recolor the active theme. Every row always offers the theme's default value
 * as a swatch, next to a color picker for a custom value. Stored per theme, on-device.
 */
export default function ColorSettings() {
  const copy = useCopy();
  const Icons = useIcons();
  const { def, colorOverrides, setColor, resetColors } = useTheme();
  const hasOverrides = Object.keys(colorOverrides).length > 0;

  return (
    <div className="px-5 pb-5 relative z-10 space-y-3">
      <p className="font-theme text-sm font-500 text-th-text-secondary">{copy.colorsLabel}</p>

      <div className="rounded-xl bg-th-screen/40 divide-y divide-th-surface-dark/30">
        {EDITABLE_COLORS.map((token) => {
          const fallback = def.colors[token];
          const custom = colorOverrides[token];
          return (
            <div key={token} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="font-theme text-base text-th-text">{copy[LABELS[token]]}</span>
              <div className="flex items-center gap-3">
                {/* Theme default — always available */}
                <button
                  onClick={() => setColor(token, null)}
                  aria-label={`${copy[LABELS[token]]}: ${copy.colorDefault}`}
                  className={cn("w-9 h-9 rounded-full border border-black/10 shadow-neu-out transition-transform active:scale-95", !custom && ACTIVE_RING)}
                  style={{ backgroundColor: fallback }}
                />
                {/* Custom — native color picker (opens the system picker on phones) */}
                <label
                  aria-label={`${copy[LABELS[token]]}: ${copy.colorCustom}`}
                  className={cn(
                    "relative w-9 h-9 rounded-full border border-black/10 shadow-neu-out overflow-hidden cursor-pointer transition-transform active:scale-95",
                    custom && ACTIVE_RING
                  )}
                  style={{
                    background: custom ?? "conic-gradient(#F48FB1, #FFD54A, #9EE6DF, #7C83FD, #F48FB1)",
                  }}
                >
                  <input
                    type="color"
                    value={(custom ?? fallback).toLowerCase()}
                    onChange={(e) => setColor(token, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {hasOverrides && (
        <button onClick={resetColors} className="flex items-center gap-1.5 font-theme text-sm text-th-text-secondary active:text-th-text">
          <Icons.reset className="w-3.5 h-3.5" />
          {copy.colorsReset}
        </button>
      )}
    </div>
  );
}
