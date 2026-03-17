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

// Full month calendar grid for a single habit
function MonthGrid({ habit, logs }: { habit: HabitWithStats; logs: HabitLog[] }) {
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
          <div key={i} className="text-center text-[9px] font-mono font-700 text-amber/40 py-1 uppercase tracking-widest">{d}</div>
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
                "aspect-square flex items-center justify-center text-[10px] font-mono font-700 transition-all duration-300 border",
                isToday && "border-amber/80 shadow-[0_0_8px_rgba(255,176,0,0.6)]"
              )}
              style={
                !inMonth
                  ? { opacity: 0 }
                  : isFuture
                  ? { background: "var(--basalt)", color: "rgba(255,176,0,0.2)", border: "1px solid rgba(255,176,0,0.1)" }
                  : completed
                  ? { background: "var(--signal)", color: "var(--basalt)", border: "1px solid var(--signal)", boxShadow: "0 0 5px rgba(50,205,50,0.6)" }
                  : scheduled
                  ? { background: "var(--basalt-light)", color: "var(--amber)", border: "1px dashed rgba(255,176,0,0.3)" }
                  : { background: "transparent", color: "rgba(255,176,0,0.1)", border: "1px solid transparent" }
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
      <div className="mb-6 flex flex-col border-b border-amber/30 pb-4">
        <p className="text-amber/60 font-mono text-xs uppercase tracking-widest mb-1">
          SYS.MODULE: DIAGNOSTICS
        </p>
        <h1 className="font-mono text-xl font-800 text-amber uppercase text-glow">
          OP_CONSISTENCY_RPT
        </h1>
      </div>

      {/* View toggle */}
      <div className="flex bg-basalt-light/50 p-1 mb-8 border border-amber/30">
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 py-2 font-mono text-[10px] font-800 uppercase tracking-widest transition-all duration-300",
              view === v
                ? "bg-amber text-basalt shadow-[0_0_10px_rgba(255,176,0,0.5)]"
                : "text-amber/50 hover:text-amber hover:bg-amber/10"
            )}
          >
            {v === "week" ? "SCOPE: 7_DAYS" : "SCOPE: 30_DAYS"}
          </button>
        ))}
      </div>

      {/* Streaks */}
      <div className="mb-8">
        <h2 className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-amber/20 pb-2">
          <Activity className="w-3 h-3" /> ACTIVE_SEQS
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
                  className="p-4 bg-basalt-light/30 border border-amber/20 animate-slide-up relative overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-xl grayscale-[0.2] opacity-80">{habit.emoji}</span>
                      <span className="font-mono font-700 text-sm text-amber uppercase tracking-widest">{habit.name}</span>
                    </div>
                    <span className="font-mono font-800 text-xs text-signal text-signal">
                      {habit.currentStreak.toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Digital Bar */}
                  <div className="h-2 bg-basalt border border-amber/30 relative z-10 overflow-hidden">
                    <div
                      className="h-full bg-signal transition-all duration-1000 ease-out shadow-[0_0_5px_rgba(50,205,50,0.6)]"
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
        <h2 className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-amber/20 pb-2">
          <TrendingUp className="w-3 h-3" /> PROCESS_OVERVIEW
        </h2>
        <div className="space-y-4">
          {habits.map((habit, i) => {
            const rate = Math.round(habit.completionRate * 100);

            return (
              <div 
                key={habit.id} 
                className="p-5 bg-basalt-light/30 border border-amber/20 animate-slide-up relative overflow-hidden"
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

                {/* Habit header */}
                <div className="flex items-center justify-between mb-5 relative z-10 border-b border-amber/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl opacity-80">{habit.emoji}</span>
                    <span className="font-mono font-800 text-amber text-sm uppercase tracking-widest">{habit.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono font-700 uppercase tracking-widest text-amber/40 mb-0.5">YIELD</span>
                    <span className="font-mono font-800 text-signal text-xs">
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
                          className="w-full transition-all duration-500 relative"
                          style={{
                            height: !log.scheduled ? '4px' : log.completed ? '100%' : '15%',
                            background: !log.scheduled ? 'transparent' : log.completed ? 'var(--signal)' : 'var(--amber)',
                            border: !log.scheduled ? '1px dashed rgba(255,176,0,0.3)' : 'none',
                            boxShadow: log.completed ? '0 0 8px rgba(50,205,50,0.5)' : 'none'
                          }}
                        />
                        <span className="text-[8px] font-mono font-700 text-amber/40 uppercase">
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
