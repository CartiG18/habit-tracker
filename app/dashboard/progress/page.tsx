"use client";

import { useState, useEffect } from "react";
import {
  format, subDays, parseISO, eachDayOfInterval,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  getDate, isSameMonth,
} from "date-fns";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/lib/auth-context";
import { HABIT_COLORS, cn } from "@/lib/utils";
import { getHabitLogs, isScheduledDay } from "@/lib/habits";
import { HabitWithStats, HabitLog } from "@/types";
import { Activity, TrendingUp } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

// Full month calendar grid for a single habit
function MonthGrid({ habit, logs, isRetro }: { habit: HabitWithStats; logs: HabitLog[], isRetro: boolean }) {
  const color = HABIT_COLORS[habit.color];
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const logMap = new Map(logs.map((l) => [l.date, l.completed]));
  const todayStr = format(today, "yyyy-MM-dd");

  return (
    <div className="animate-fade-in relative z-10">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className={cn("text-center font-theme uppercase",
            isRetro ? "text-[9px] font-700 text-th-primary/40 tracking-widest" : "text-[10px] font-500 text-th-text-secondary"
          )}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, today);
          const isToday = dateStr === todayStr;
          const scheduled = inMonth && isScheduledDay(habit.schedule, day);
          const completed = logMap.get(dateStr) ?? false;
          const isFuture = dateStr > todayStr;

          return (
            <div
              key={dateStr}
              className={cn(
                "aspect-square flex items-center justify-center font-theme transition-all duration-300",
                isRetro 
                  ? ["text-[10px] font-700 border", isToday && "border-th-primary/80 shadow-[0_0_8px_rgba(var(--th-primary),0.6)]"]
                  : ["text-xs font-500 rounded-full", isToday && "border-2 border-th-text shadow-neu-out"]
              )}
              style={
                !inMonth
                  ? { opacity: 0 }
                  : isFuture
                  ? { background: isRetro ? "rgb(var(--th-screen))" : "transparent", color: isRetro ? "rgba(var(--th-primary),0.2)" : "rgba(var(--th-text), 0.3)", border: isRetro ? "1px solid rgba(var(--th-primary),0.1)" : "none" }
                  : completed
                  ? { background: "rgb(var(--th-success))", color: "rgb(var(--th-btn-text))", border: isRetro ? "1px solid rgb(var(--th-success))" : "none", boxShadow: isRetro ? "0 0 5px rgba(var(--th-success),0.6)" : "none" }
                  : scheduled
                  ? { background: isRetro ? "rgb(var(--th-screen-light))" : "rgb(var(--th-surface-dark))", color: isRetro ? "rgb(var(--th-primary))" : "rgb(var(--th-text))", border: isRetro ? "1px dashed rgba(var(--th-primary),0.3)" : "none", opacity: isRetro ? 1 : 0.3 }
                  : { background: "transparent", color: isRetro ? "rgba(var(--th-primary),0.1)" : "rgba(var(--th-text),0.2)", border: isRetro ? "1px solid transparent" : "none" }
              }
            >
              {inMonth ? getDate(day) : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { habits } = useHabits();
  const { user } = useAuth();
  const { isRetro } = useTheme();
  const copy = useCopy();
  const [view, setView] = useState<"week" | "month">("week");
  const [monthLogs, setMonthLogs] = useState<Map<string, HabitLog[]>>(new Map());

  // Load full month logs when switching to month view
  useEffect(() => {
    if (view !== "month" || !user || habits.length === 0) return;
    const today = new Date();
    const start = format(startOfMonth(today), "yyyy-MM-dd");
    const end = format(endOfMonth(today), "yyyy-MM-dd");

    async function loadLogs() {
      const entries = await Promise.all(
        habits.map(async (h) => {
          const logs = await getHabitLogs(user!.uid, h.id, start, end);
          return [h.id, logs] as [string, HabitLog[]];
        })
      );
      setMonthLogs(new Map(entries));
    }
    loadLogs();
  }, [view, user, habits.length]);

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto pb-32 relative z-20">
      <div className={cn("mb-6 flex flex-col pb-4", isRetro ? "border-b border-th-primary/30" : "")}>
        <p className={cn("font-theme transition-colors mb-1", isRetro ? "text-th-primary/60 text-xs uppercase tracking-widest" : "text-th-text-secondary text-sm")}>
          {copy.progressModule}
        </p>
        <h1 className={cn("font-theme transition-colors", isRetro ? "text-xl font-800 text-th-primary uppercase text-glow" : "text-3xl font-700 text-th-text")}>
          {copy.progressTitle}
        </h1>
      </div>

      {/* View toggle */}
      <div className={cn("flex mb-8 transition-colors", 
        isRetro 
          ? "bg-th-screen-light/50 p-1 border border-th-primary/30"
          : "bg-th-surface p-1 rounded-2xl shadow-neu-in"
      )}>
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 py-2 font-theme transition-all duration-300",
              isRetro 
                ? [
                    "text-[10px] font-800 uppercase tracking-widest",
                    view === v ? "bg-th-primary text-th-btn-text shadow-[0_0_10px_rgba(var(--th-primary),0.5)]" : "text-th-primary/50 hover:text-th-primary hover:bg-th-primary/10"
                  ]
                : [
                    "text-sm font-500 rounded-xl",
                    view === v ? "bg-th-screen shadow-neu-out text-th-text" : "text-th-text-secondary hover:text-th-text hover:bg-th-surface-light"
                  ]
            )}
          >
            {v === "week" ? copy.scopeWeek : copy.scopeMonth}
          </button>
        ))}
      </div>

      {/* Streaks */}
      <div className="mb-8">
        <h2 className={cn("font-theme mb-4 flex items-center gap-2 pb-2 transition-colors",
          isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-[0.2em] border-b border-th-primary/20" : "text-th-text-secondary text-sm font-500"
        )}>
          <Activity className="w-3 h-3" /> {copy.streaksSection}
        </h2>
        <div className="space-y-3">
          {[...habits]
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .slice(0, 5)
            .map((habit, i) => {
              const pct = Math.min(habit.currentStreak / 30, 1);
              return (
                <div 
                  key={habit.id} 
                  className={cn("p-4 animate-slide-up relative overflow-hidden transition-colors",
                    isRetro 
                      ? "bg-th-screen-light/30 border border-th-primary/20"
                      : "bg-th-surface rounded-2xl shadow-neu-out border border-th-surface-dark/10"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {isRetro && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                  )}
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xl opacity-80", isRetro && "grayscale-[0.2]")}>{habit.emoji}</span>
                      <span className={cn("font-theme transition-colors",
                        isRetro ? "font-700 text-sm text-th-primary uppercase tracking-widest" : "font-500 text-base text-th-text"
                      )}>{habit.name}</span>
                    </div>
                    <span className={cn("font-theme font-800 text-th-success", isRetro ? "text-xs" : "text-sm")}>
                      {isRetro ? habit.currentStreak.toString().padStart(2, '0') : `${habit.currentStreak} day`}
                    </span>
                  </div>
                  
                  {/* Digital Bar */}
                  <div className={cn("relative z-10 overflow-hidden",
                    isRetro ? "h-2 bg-th-screen border border-th-primary/30" : "h-2 bg-th-surface-dark/30 rounded-full shadow-neu-in"
                  )}>
                    <div
                      className={cn("h-full transition-all duration-1000 ease-out",
                        isRetro ? "bg-th-success shadow-[0_0_5px_rgba(var(--th-success),0.6)]" : "bg-th-success rounded-full"
                      )}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Per-habit completion */}
      <div>
        <h2 className={cn("font-theme mb-4 flex items-center gap-2 pb-2 transition-colors",
          isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-[0.2em] border-b border-th-primary/20" : "text-th-text-secondary text-sm font-500"
        )}>
          <TrendingUp className="w-3 h-3" /> {copy.overviewSection}
        </h2>
        <div className="space-y-4">
          {habits.map((habit, i) => {
            const rate = Math.round(habit.completionRate * 100);

            return (
              <div 
                key={habit.id} 
                className={cn("p-5 animate-slide-up relative overflow-hidden transition-colors",
                  isRetro ? "bg-th-screen-light/30 border border-th-primary/20" : "bg-th-surface rounded-2xl shadow-neu-out border border-th-surface-dark/10"
                )}
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              >
                {isRetro && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                )}

                {/* Habit header */}
                <div className={cn("flex items-center justify-between mb-5 relative z-10 pb-3",
                  isRetro ? "border-b border-th-primary/10" : ""
                )}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl opacity-80">{habit.emoji}</span>
                    <span className={cn("font-theme transition-colors",
                      isRetro ? "font-800 text-th-primary text-sm uppercase tracking-widest" : "font-700 text-th-text text-base"
                    )}>{habit.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn("font-theme transition-colors mb-0.5",
                      isRetro ? "text-[9px] font-700 uppercase tracking-widest text-th-primary/40" : "text-[10px] font-500 text-th-text-secondary"
                    )}>{copy.yieldLabel}</span>
                    <span className="font-theme font-800 text-th-success text-xs">
                      {rate}%
                    </span>
                  </div>
                </div>

                {view === "week" ? (
                  /* Oscilloscope Week */
                  <div className="flex items-end h-16 gap-1 relative z-10">
                    {habit.weekLogs.map((log) => (
                      <div key={log.date} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <div
                          className={cn("w-full transition-all duration-500 relative", isRetro ? "" : "rounded-t-sm")}
                          style={{
                            height: !log.scheduled ? (isRetro ? '4px' : '0px') : log.completed ? '100%' : '15%',
                            background: !log.scheduled 
                              ? 'transparent' 
                              : log.completed 
                                ? 'rgb(var(--th-success))' 
                                : isRetro ? 'rgb(var(--th-primary))' : 'rgba(var(--th-primary), 0.3)',
                            border: !log.scheduled && isRetro ? '1px dashed rgba(var(--th-primary),0.3)' : 'none',
                            boxShadow: log.completed && isRetro ? '0 0 8px rgba(var(--th-success),0.5)' : 'none'
                          }}
                        />
                        <span className={cn("font-theme transition-colors",
                          isRetro ? "text-[8px] font-700 text-th-primary/40 uppercase" : "text-[9px] font-500 text-th-text-secondary"
                        )}>
                          {format(parseISO(log.date), "EEE")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Month: full calendar grid */
                  <MonthGrid
                    habit={habit}
                    logs={monthLogs.get(habit.id) ?? []}
                    isRetro={isRetro}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
