"use client";

import { useEffect, useState } from "react";
import { onHabitComplete } from "@/lib/themes/events";

// ─── Palette ──────────────────────────────────────────────────────────────────

/** Bright golds only — pale champagne through warm gold, like Tinker Bell's pixie dust. */
const DUST_COLORS = ["#FFF6CC", "#FFE680", "#FFD54A", "#FFC933", "#FFE9A8"];

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
@keyframes princess-dust-fall {
  0%   { transform: translate3d(0, -4vh, 0); opacity: 0 }
  10%  { opacity: 1 }
  35%  { transform: translate3d(var(--sway), 28vh, 0) }
  65%  { transform: translate3d(calc(var(--sway) * -0.6), 55vh, 0) }
  100% { transform: translate3d(calc(var(--sway) * 0.3), 85vh, 0); opacity: 0 }
}
@keyframes princess-twinkle { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: 0.25; transform: scale(0.6) } }
.princess-dust { animation: princess-dust-fall var(--dur) cubic-bezier(.3,.55,.4,1) var(--delay) forwards; opacity: 0; will-change: transform, opacity }
.princess-dust > span { display: block; border-radius: 9999px; animation: princess-twinkle var(--twinkle) ease-in-out var(--delay) infinite }
@media (prefers-reduced-motion: reduce) {
  .princess-dust > span { animation: none }
}
`;

// ─── Fairy Dust ───────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  twinkle: number;
  sway: number;
  color: string;
}

const BURST_SIZE = 90;
const BURST_LIFETIME_MS = 8000;

/** A shower of tiny gold specks, denser toward the middle of the screen. */
function makeBurst(seed: number, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: seed * 1000 + i,
    left: 50 + ((Math.random() + Math.random()) / 2 - 0.5) * 110,
    size: 1.5 + Math.random() ** 2 * 2.5,
    delay: Math.random() * 1.8,
    duration: 3.5 + Math.random() * 2.5,
    twinkle: 0.35 + Math.random() * 0.7,
    sway: (Math.random() - 0.5) * 60,
    color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
  }));
}

function Speck({ p }: { p: Particle }) {
  return (
    <div
      className="princess-dust absolute top-0"
      style={{
        left: `${p.left}%`,
        ["--sway" as string]: `${p.sway}px`,
        ["--dur" as string]: `${p.duration}s`,
        ["--delay" as string]: `${p.delay}s`,
        ["--twinkle" as string]: `${p.twinkle}s`,
      }}
    >
      <span
        style={{
          width: p.size,
          height: p.size,
          background: p.color,
          boxShadow: `0 0 ${p.size * 1.5}px ${p.size * 0.4}px ${p.color}, 0 0 ${p.size * 4}px rgba(255, 200, 60, 0.55)`,
        }}
      />
    </div>
  );
}

function FairyDust() {
  const [bursts, setBursts] = useState<{ id: number; particles: Particle[] }[]>([]);

  useEffect(() => {
    let seed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const unsubscribe = onHabitComplete(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const id = ++seed;
      setBursts((b) => [...b, { id, particles: makeBurst(id, reduced ? 20 : BURST_SIZE) }]);
      timers.push(setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), BURST_LIFETIME_MS));
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {bursts.flatMap((b) => b.particles.map((p) => <Speck key={p.id} p={p} />))}
    </div>
  );
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

export default function PrincessOverlay() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <FairyDust />
    </>
  );
}
