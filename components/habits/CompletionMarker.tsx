"use client";

import { ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

interface Props {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  /** Slightly larger variant (used when the marker shows a subtask count) */
  large?: boolean;
  children?: ReactNode;
}

// ─── Rounded Star Geometry ────────────────────────────────────────────────────

/** 5-point star on a 40×40 grid with every corner softened by a quadratic curve. */
function roundedStarPath(): string {
  const cx = 20, cy = 21.5, outer = 19, inner = 9.5;
  const outerCut = 4.2, innerCut = 2;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), cut: i % 2 === 0 ? outerCut : innerCut };
  });
  const toward = (from: { x: number; y: number }, to: { x: number; y: number }, d: number) => {
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    return { x: from.x + ((to.x - from.x) / len) * d, y: from.y + ((to.y - from.y) / len) * d };
  };
  const f = (n: number) => n.toFixed(2);
  let d = "";
  pts.forEach((p, i) => {
    const prev = pts[(i + 9) % 10];
    const next = pts[(i + 1) % 10];
    const start = toward(p, prev, p.cut);
    const end = toward(p, next, p.cut);
    d += `${i === 0 ? "M" : "L"}${f(start.x)} ${f(start.y)}Q${f(p.x)} ${f(p.y)} ${f(end.x)} ${f(end.y)}`;
  });
  return d + "Z";
}

const STAR_PATH = roundedStarPath();

// ─── Component ────────────────────────────────────────────────────────────────

/** The tappable completion marker on a habit card. Shape comes from the theme (`marker`). */
export default function CompletionMarker({ completed, onClick, large, children }: Props) {
  const { def } = useTheme();
  const gradId = `mk${useId().replace(/:/g, "")}`;

  if (def.marker === "star") {
    const fill = def.markerFill;
    const doneFill = fill ? `url(#${gradId})` : "rgb(var(--th-success))";
    const doneStroke = fill ? fill.stops[2] : "rgb(var(--th-success))";
    const doneGlow = fill ? fill.glow : "rgb(var(--th-success) / 0.4)";
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative z-10 flex-shrink-0 flex items-center justify-center transition-transform duration-300 active:scale-90",
          large ? "w-12 h-12" : "w-11 h-11",
          completed ? "scale-105 text-th-btn-text" : "text-th-text-secondary hover:scale-105"
        )}
      >
        <svg
          viewBox="0 0 40 40"
          className="absolute inset-0 w-full h-full overflow-visible transition-[filter] duration-300"
          style={{ filter: completed ? `drop-shadow(0 3px 6px ${doneGlow})` : "drop-shadow(0 1px 2px rgb(var(--th-surface-dark) / 0.5))" }}
          aria-hidden
        >
          {fill && (
            <defs>
              <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="6" y1="3" x2="34" y2="38">
                <stop offset="0%" stopColor={fill.stops[0]} />
                <stop offset="45%" stopColor={fill.stops[1]} />
                <stop offset="100%" stopColor={fill.stops[2]} />
              </linearGradient>
            </defs>
          )}
          <path
            d={STAR_PATH}
            strokeWidth={1.5}
            strokeLinejoin="round"
            className="transition-[fill,stroke] duration-300"
            style={{
              fill: completed ? doneFill : "rgb(var(--th-surface-light))",
              stroke: completed ? doneStroke : "rgb(var(--th-surface-dark))",
            }}
          />
          {/* Shine: a soft highlight on the upper-left of a completed metallic star */}
          {completed && fill && (
            <ellipse cx="15.5" cy="16" rx="3.6" ry="2" transform="rotate(-35 15.5 16)" fill="#FFFFFF" opacity={0.55} />
          )}
        </svg>
        <span className="relative mt-1 flex items-center justify-center font-theme font-700 text-[10px]">
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative z-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
        large ? "w-10 h-10" : "w-8 h-8",
        completed
          ? "bg-th-success text-th-btn-text shadow-th-raised"
          : "bg-th-surface-light border border-th-surface-dark/30 shadow-neu-in text-th-text-secondary"
      )}
    >
      {children}
    </button>
  );
}
