"use client";

import { useState, useEffect } from "react";
import { format, subDays, eachDayOfInterval, parseISO, startOfMonth, endOfMonth, eachDayOfInterval as eachDay } from "date-fns";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/lib/auth-context";
import { HABIT_COLORS } from "@/lib/utils";
import { HabitColor, DayOfWeek } from "@/types";
import { getHabitLogs } from "@/lib/habits";

export default function ProgressPage() {
  const { habits } = useHabits();
  const { user } = useAuth();
  const [view, setView] = useState<"week" | "month">("week");

  return (
    <div className="px-4 pt-14 safe-top max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-800 text-white">Progress</h1>
        <p className="text-white/40 text-sm mt-0.5">Your consistency over time</p>
      </div>

      {/* View toggle */}
      <div className="flex rounded-xl bg-surface-2 p-1 mb-6">
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-600 transition-all ${
              view === v ? "bg-white text-black" : "text-white/40 hover:text-white/60"
            }`}
          >
            {v === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {/* Overall streak leaders */}
      <div className="mb-6">
        <h2 className="font-display text-sm font-600 text-white/40 uppercase tracking-wider mb-3">
          🔥 Current Streaks
        </h2>
        <div className="space-y-2">
          {habits
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .slice(0, 5)
            .map((habit) => {
              const colors = HABIT_COLORS[habit.color];
              const pct = Math.min(habit.currentStreak / 30, 1);
              return (
                <div key={habit.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.emoji}</span>
                      <span className="font-display font-600 text-white text-sm">
                        {habit.name}
                      </span>
                    </div>
                    <span className={`font-display font-700 text-sm ${colors.text}`}>
                      {habit.currentStreak}d 🔥
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.dot} rounded-full transition-all duration-700`}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Per-habit completion grid */}
      <div>
        <h2 className="font-display text-sm font-600 text-white/40 uppercase tracking-wider mb-3">
          {view === "week" ? "7-Day" : "30-Day"} Completion
        </h2>
        <div className="space-y-3">
          {habits.map((habit) => {
            const colors = HABIT_COLORS[habit.color];
            const rate = Math.round(habit.completionRate * 100);
            return (
              <div key={habit.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{habit.emoji}</span>
                    <span className="font-display font-600 text-white text-sm">
                      {habit.name}
                    </span>
                  </div>
                  <span className={`text-xs font-display font-700 ${colors.text}`}>
                    {rate}%
                  </span>
                </div>

                {/* Week dots */}
                <div className="flex gap-1.5">
                  {habit.weekLogs.map((log) => (
                    <div key={log.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full aspect-square rounded-md transition-all ${
                          !log.scheduled
                            ? "bg-surface-3 opacity-30"
                            : log.completed
                            ? colors.dot
                            : "bg-surface-3"
                        }`}
                      />
                      <span className="text-[9px] text-white/20">
                        {format(parseISO(log.date), "E")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
