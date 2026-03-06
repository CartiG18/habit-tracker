"use client";

import { useState, useEffect } from "react";
import {
  format, subDays, parseISO, eachDayOfInterval,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  getDate, isSameMonth,
} from "date-fns";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/lib/auth-context";
import { HABIT_COLORS } from "@/lib/utils";
import { getHabitLogs, isScheduledDay } from "@/lib/habits";
import { HabitWithStats, HabitLog } from "@/types";

// Full month calendar grid for a single habit
function MonthGrid({ habit, logs }: { habit: HabitWithStats; logs: HabitLog[] }) {
  const color = HABIT_COLORS[habit.color];
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  // Pad to full weeks
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const logMap = new Map(logs.map((l) => [l.date, l.completed]));
  const todayStr = format(today, "yyyy-MM-dd");

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-white/20 py-1">{d}</div>
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
              className="aspect-square rounded-md flex items-center justify-center text-[10px] font-display font-600 transition-all"
              style={
                !inMonth
                  ? { background: "transparent" }
                  : isFuture
                  ? { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.15)" }
                  : completed
                  ? { background: color.hex, color: "#000" }
                  : scheduled
                  ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", border: isToday ? `1px solid ${color.border}` : undefined }
                  : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.15)" }
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
    <div className="px-4 pt-14 safe-top max-w-lg mx-auto pb-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-800 text-white">Progress</h1>
        <p className="text-white/40 text-sm mt-0.5">Your consistency over time</p>
      </div>

      {/* View toggle */}
      <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-2 rounded-lg text-sm font-display font-600 transition-all"
            style={view === v
              ? { background: "#fff", color: "#000" }
              : { color: "rgba(255,255,255,0.4)" }
            }
          >
            {v === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {/* Streaks */}
      <div className="mb-6">
        <h2 className="font-display text-xs font-600 text-white/40 uppercase tracking-wider mb-3">
          🔥 Current Streaks
        </h2>
        <div className="space-y-2">
          {[...habits]
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .slice(0, 5)
            .map((habit) => {
              const color = HABIT_COLORS[habit.color];
              const pct = Math.min(habit.currentStreak / 30, 1);
              return (
                <div key={habit.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.emoji}</span>
                      <span className="font-display font-600 text-white text-sm">{habit.name}</span>
                    </div>
                    <span className="font-display font-700 text-sm" style={{ color: color.hex }}>
                      {habit.currentStreak}d 🔥
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct * 100}%`, background: color.hex }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Per-habit completion */}
      <div>
        <h2 className="font-display text-xs font-600 text-white/40 uppercase tracking-wider mb-3">
          {view === "week" ? "7-Day Completion" : `${format(new Date(), "MMMM")} Overview`}
        </h2>
        <div className="space-y-4">
          {habits.map((habit) => {
            const color = HABIT_COLORS[habit.color];
            const rate = Math.round(habit.completionRate * 100);

            return (
              <div key={habit.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Habit header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{habit.emoji}</span>
                    <span className="font-display font-600 text-white text-sm">{habit.name}</span>
                  </div>
                  <span className="text-xs font-display font-700" style={{ color: color.hex }}>
                    {rate}%
                  </span>
                </div>

                {view === "week" ? (
                  /* Week: 7 dot squares with day labels */
                  <div className="flex gap-1.5">
                    {habit.weekLogs.map((log) => (
                      <div key={log.date} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full aspect-square rounded-md transition-all"
                          style={
                            !log.scheduled
                              ? { background: "rgba(255,255,255,0.04)", opacity: 0.3 }
                              : log.completed
                              ? { background: color.hex }
                              : { background: "rgba(255,255,255,0.08)" }
                          }
                        />
                        <span className="text-[9px] text-white/20">
                          {format(parseISO(log.date), "E")[0]}
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
