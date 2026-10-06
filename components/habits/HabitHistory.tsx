"use client";

import { useEffect, useMemo, useRef } from "react";
import { addDays, format, parseISO, startOfWeek, subDays } from "date-fns";
import { Habit, HabitLog } from "@/types";
import { cn, getTodayString } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import { isHabitDue, isFrequencySchedule } from "@/lib/schedule";
import { HISTORY_DAYS } from "@/hooks/useHabitHistory";

interface Props {
  habit: Habit;
  logs: Map<string, HabitLog>;
  focusDate: string;
  onSelect: (date: string) => void;
}

type CellState = "done" | "skipped" | "missed" | "open" | "inactive" | "future";

const ROW_LABELS = ["M", "", "W", "", "F", "", "S"];

/**
 * Per-habit heatmap: one column per week (Mon→Sun rows), oldest left, scrolled
 * to the current week. Tapping a day makes it the modal's focus day — which is
 * how past days are backfilled, skipped, or annotated.
 */
export default function HabitHistory({ habit, logs, focusDate, onSelect }: Props) {
  const { isRetro, def } = useTheme();
  const copy = useCopy();
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = getTodayString();
  const frequency = isFrequencySchedule(habit.schedule);

  // Columns of 7 days, Monday-first, covering the history window
  const weeks = useMemo(() => {
    const first = startOfWeek(subDays(new Date(), HISTORY_DAYS - 1), { weekStartsOn: 1 });
    const cols: string[][] = [];
    for (let d = first; format(d, "yyyy-MM-dd") <= today || cols[cols.length - 1]?.length !== 7; d = addDays(d, 1)) {
      if (!cols.length || cols[cols.length - 1].length === 7) cols.push([]);
      cols[cols.length - 1].push(format(d, "yyyy-MM-dd"));
      if (cols.length > 60) break;
    }
    return cols;
  }, [today]);

  // Start scrolled to the most recent weeks
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks.length]);

  function stateOf(ds: string): CellState {
    if (ds > today) return "future";
    const log = logs.get(ds);
    if (log?.completed) return "done";
    if (log?.skipped) return "skipped";
    if (!isHabitDue(habit, parseISO(ds))) return "inactive";
    if (ds === today) return "open";
    // "N per week/month" habits have no fixed days — an empty day isn't a miss
    return frequency ? "inactive" : "missed";
  }

  // Theme accents: metallic themes (Princess) paint done days with their marker gradient
  const doneFill = def.markerFill
    ? `linear-gradient(135deg, ${def.markerFill.stops[0]}, ${def.markerFill.stops[1]} 55%, ${def.markerFill.stops[2]})`
    : "rgb(var(--th-success))";
  const focusRing = def.frameFill ? def.frameFill.stops[2] : isRetro ? "rgb(var(--th-primary))" : "rgb(var(--th-text))";

  const cellStyle = (state: CellState): React.CSSProperties => {
    switch (state) {
      case "done":
        return { background: doneFill, boxShadow: isRetro ? "0 0 4px rgb(var(--th-success) / 0.6)" : undefined };
      case "skipped":
        return { background: "transparent", boxShadow: `inset 0 0 0 1px ${isRetro ? "rgb(var(--th-primary) / 0.5)" : "rgb(var(--th-surface-dark))"}` };
      case "missed":
        return { background: isRetro ? "rgb(var(--th-primary) / 0.25)" : "rgb(var(--th-surface-dark) / 0.55)" };
      case "open":
        return { background: "transparent", boxShadow: `inset 0 0 0 1.5px ${isRetro ? "rgb(var(--th-primary) / 0.6)" : "rgb(var(--th-surface-dark))"}` };
      case "inactive":
        return { background: isRetro ? "rgb(var(--th-primary) / 0.06)" : "rgb(var(--th-surface-dark) / 0.18)" };
      case "future":
        return { background: "transparent" };
    }
  };

  // Month initial above the first column of each month
  const monthLabels = weeks.map((col, i) => {
    const month = format(parseISO(col[0]), "MMM");
    const prev = i > 0 ? format(parseISO(weeks[i - 1][0]), "MMM") : null;
    return month !== prev ? month : "";
  });

  return (
    <div>
      <div className="flex gap-2">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[3px] pt-[18px]">
          {ROW_LABELS.map((l, i) => (
            <span key={i} className={cn("h-[14px] w-3 leading-[14px] font-theme text-[9px]", isRetro ? "text-th-primary/40" : "text-th-text-secondary")}>{l}</span>
          ))}
        </div>

        <div ref={scrollRef} className="overflow-x-auto overscroll-x-contain flex-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex flex-col pr-1 pl-0.5 pb-0.5">
            <div className="flex gap-[3px] h-[15px] mb-[3px]">
              {monthLabels.map((m, i) => (
                <span key={i} className={cn("w-[14px] overflow-visible whitespace-nowrap font-theme text-[9px] leading-[15px]", isRetro ? "text-th-primary/40 uppercase" : "text-th-text-secondary")}>{m}</span>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((col) => (
                <div key={col[0]} className="flex flex-col gap-[3px]">
                  {col.map((ds) => {
                    const state = stateOf(ds);
                    const focused = ds === focusDate;
                    return (
                      <button
                        key={ds}
                        disabled={state === "future"}
                        onClick={() => onSelect(ds)}
                        aria-label={`${format(parseISO(ds), "EEE, MMM d")}: ${state}`}
                        aria-pressed={focused}
                        data-state={state}
                        className={cn(
                          "th-heat-cell w-[14px] h-[14px] transition-transform duration-150",
                          isRetro ? "rounded-none" : "rounded-[4px]",
                          state !== "future" && "active:scale-90 hover:scale-110"
                        )}
                        style={{
                          ...cellStyle(state),
                          outline: focused ? `2px solid ${focusRing}` : undefined,
                          outlineOffset: focused ? "1px" : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className={cn("font-theme mt-2", isRetro ? "text-th-primary/40 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>
        {copy.historyHint}
      </p>
    </div>
  );
}
