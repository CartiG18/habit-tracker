"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import DailyProgress from "@/components/habits/DailyProgress";
import { useAuth } from "@/lib/auth-context";
import { getTodayString } from "@/lib/utils";
import { DayOfWeek } from "@/types";

export default function DashboardPage() {
  const { habits, loading, toggle } = useHabits();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  const today = new Date();
  const todayDayOfWeek = today.getDay() as DayOfWeek;

  // Only show habits scheduled for today
  const todayHabits = habits.filter((h) =>
    h.targetDays.includes(todayDayOfWeek)
  );
  const completedToday = todayHabits.filter((h) => h.todayCompleted).length;
  const allDone = todayHabits.length > 0 && completedToday === todayHabits.length;

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="px-4 pt-14 safe-top max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-white/40 font-body text-sm">
          {format(today, "EEEE, MMMM d")}
        </p>
        <h1 className="font-display text-2xl font-800 text-white mt-0.5">
          {greeting()}, {firstName}
        </h1>
      </div>

      {/* Progress ring */}
      {todayHabits.length > 0 && (
        <DailyProgress
          completed={completedToday}
          total={todayHabits.length}
          allDone={allDone}
        />
      )}

      {/* Habit list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-surface-2 animate-pulse"
            />
          ))
        ) : todayHabits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">✨</div>
            <p className="font-display text-white/60 font-600">
              No habits for today
            </p>
            <p className="text-white/30 text-sm mt-1">
              Add a habit to get started
            </p>
          </div>
        ) : (
          todayHabits.map((habit, i) => (
            <div
              key={habit.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <HabitCard habit={habit} onToggle={() => toggle(habit.id)} />
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95 z-10"
      >
        <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
      </button>

      <AddHabitModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
