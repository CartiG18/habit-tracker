"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme, useIcons } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import { useHabitsContext } from "@/hooks/useHabits";

/** Collapsible "Paused" section under the habit list, with one-tap resume. */
export default function PausedHabits({ habits }: { habits: Habit[] }) {
  const { isRetro, def } = useTheme();
  const copy = useCopy();
  const Icons = useIcons();
  const { resume } = useHabitsContext();
  const [open, setOpen] = useState(false);
  const showDecor = def.habitDecor !== false;

  if (habits.length === 0) return null;

  return (
    <div className="pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn("th-ghost w-full flex items-center gap-2 py-2 font-theme transition-colors",
          isRetro ? "text-th-primary/60 hover:text-th-primary text-xs font-700 uppercase tracking-widest" : "text-th-text-secondary hover:text-th-text text-sm font-500")}
      >
        <Icons.pause className="w-4 h-4" />
        <span>{copy.pausedSection}</span>
        <span className={cn("ml-1", isRetro ? "" : "px-2 py-0.5 rounded-full bg-th-surface-dark/30 text-xs")}>{isRetro ? `[${habits.length}]` : habits.length}</span>
        <Icons.chevron className={cn("w-4 h-4 ml-auto transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="space-y-2 mt-2 animate-fade-in">
          {habits.map((h) => (
            <div key={h.id} className={cn("th-card flex items-center gap-3",
              isRetro ? "p-3 border border-dashed border-th-primary/30 bg-th-screen-light/20" : "p-3 bg-th-surface/70 rounded-xl")}>
              {showDecor && <span className="text-lg opacity-50">{h.emoji}</span>}
              <div className="flex-1 min-w-0">
                <p className={cn("truncate font-theme", isRetro ? "text-sm font-700 uppercase tracking-widest text-th-primary/50" : "text-base font-500 text-th-text-secondary")}>{h.name}</p>
                <p className={cn("font-theme", isRetro ? "text-[9px] uppercase tracking-widest text-th-primary/40" : "text-xs text-th-text-secondary")}>
                  {h.pausedUntil ? copy.pausedUntil.replace("{date}", format(parseISO(h.pausedUntil), "MMM d")) : copy.pausedIndefinitely}
                </p>
              </div>
              <button onClick={() => resume(h.id)}
                className={cn("flex items-center gap-1.5 px-3 py-2 font-theme transition-colors flex-shrink-0",
                  isRetro ? "border border-th-primary/50 text-th-primary text-[10px] font-700 uppercase tracking-widest hover:bg-th-primary/10" : "rounded-lg bg-th-screen text-th-text text-sm font-500 shadow-neu-out")}>
                <Icons.resume className="w-4 h-4" /> {copy.resumeButton}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
