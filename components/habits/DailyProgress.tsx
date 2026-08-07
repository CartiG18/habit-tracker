"use client";

import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

interface Props {
  completed: number;
  total: number;
  allDone: boolean;
}

export default function DailyProgress({ completed, total, allDone }: Props) {
  const { isRetro } = useTheme();
  const copy = useCopy();
  const pct = total > 0 ? completed / total : 0;
  const bars = 20;
  const activeBars = Math.round(pct * bars);

  return (
    <div className={cn(
      "p-4 flex items-center relative overflow-hidden transition-colors",
      isRetro 
        ? "bg-th-screen-light border border-th-primary/30 gap-6"
        : "bg-th-screen border border-th-surface-dark/10 shadow-neu-out sm:rounded-2xl rounded-xl flex-col sm:flex-row gap-4"
    )}>
      {isRetro && (
        <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
      )}

      {/* Progress Visualization */}
      {isRetro ? (
        /* Retro Oscilloscope */
        <div className="flex gap-1 items-end h-16 w-32 flex-shrink-0 z-10 border-b border-th-primary/50 pb-1">
          {Array.from({ length: bars }).map((_, i) => {
            const isActive = i < activeBars;
            return (
              <div
                key={i}
                className="flex-1 w-full rounded-sm transition-all duration-300"
                style={{
                  height: isActive ? `${Math.max(10, Math.random() * 80 + 20)}%` : '4px',
                  background: isActive ? (allDone ? "rgb(var(--th-success))" : "rgb(var(--th-primary))") : "rgb(var(--th-screen))",
                  border: isActive ? "none" : "1px solid rgba(var(--th-primary), 0.3)",
                  boxShadow: isActive ? `0 0 5px ${allDone ? "rgba(var(--th-success), 0.6)" : "rgba(var(--th-primary), 0.6)"}` : "none",
                }}
              />
            );
          })}
        </div>
      ) : (
        /* Soft Progress Bar */
        <div className="w-full sm:w-48 h-3 bg-th-surface-dark/30 rounded-full overflow-hidden shadow-neu-in flex-shrink-0">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${pct * 100}%`,
              background: allDone ? "rgb(var(--th-success))" : "rgb(var(--th-primary))"
            }}
          />
        </div>
      )}

      {/* Text */}
      <div className={cn(
        "flex-1 z-10 w-full",
        !isRetro && "flex flex-row sm:flex-col justify-between items-center sm:items-start"
      )}>
        {allDone ? (
          <>
            <p className={cn(
              "transition-colors",
              isRetro 
                ? "font-theme font-800 text-th-success text-lg uppercase tracking-widest text-signal"
                : "font-theme font-700 text-th-success text-lg"
            )}>
              {copy.allDone}
            </p>
            <p className={cn(
              "transition-colors",
              isRetro 
                ? "text-th-success/60 text-[10px] font-theme uppercase tracking-widest mt-1"
                : "text-th-text-secondary text-sm font-theme mt-0.5"
            )}>
              {copy.allDoneHint}
            </p>
          </>
        ) : (
          <>
            <p className={cn(
              "transition-colors",
              isRetro 
                ? "font-theme font-700 text-th-primary text-lg uppercase text-glow"
                : "font-theme font-700 text-th-text text-lg"
            )}>
              {copy.loadPrefix} {isRetro ? "" : `${Math.round(pct * 100)}%`}
              {isRetro && `${Math.round(pct * 100)}%`}
            </p>
            <p className={cn(
              "transition-colors",
              isRetro 
                ? "text-th-primary/60 text-[10px] font-theme uppercase tracking-widest mt-1"
                : "text-th-text-secondary text-sm font-theme mt-0.5"
            )}>
              {Number((total - completed).toFixed(1))} {copy.pendingSuffix}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
