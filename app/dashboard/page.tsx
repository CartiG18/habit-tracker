"use client";

import { useState, useMemo } from "react";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import DailyProgress from "@/components/habits/DailyProgress";
import { useAuth } from "@/lib/auth-context";
import { isScheduledDay } from "@/lib/habits";
import { formatDateString } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);
  
  const { habits, loading, toggle } = useHabits(dateString);
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Generate last 7 days for the navigator
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();
  }, [today]);

  // Show habits that are scheduled for the selected day
  const filteredHabits = habits.filter((h) => isScheduledDay(h.schedule, selectedDate));
  const completedCount = filteredHabits.filter((h) => h.todayCompleted).length;
  const allDone = filteredHabits.length > 0 && completedCount === filteredHabits.length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="px-4 pt-14 safe-top max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <p className="text-white/40 font-body text-sm">
          {isSameDay(selectedDate, today) ? "Today" : format(selectedDate, "EEEE, MMMM d")}
        </p>
        <h1 className="font-display text-2xl font-800 text-white mt-0.5">
          {greeting()}, {firstName}
        </h1>
      </div>

      {/* Date Navigator */}
      <div className="flex justify-between items-center mb-6 bg-surface-2/50 p-2 rounded-2xl border border-white/5">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-center w-10 py-2 rounded-xl transition-all",
                isSelected ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white/60"
              )}
            >
              <span className="text-[10px] font-display font-700 uppercase tracking-wider">
                {format(day, "EEE")}
              </span>
              <span className="text-sm font-display font-800 mt-0.5">
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress ring */}
      {filteredHabits.length > 0 && (
        <DailyProgress completed={completedCount} total={filteredHabits.length} allDone={allDone} />
      )}

      {/* Habit list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-surface-2 animate-pulse" />
          ))
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">✨</div>
            <p className="font-display text-white/60 font-600">No habits for this day</p>
            <p className="text-white/30 text-sm mt-1">Check another day or add a new habit</p>
          </div>
        ) : (
          filteredHabits.map((habit, i) => (
            <div key={habit.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <HabitCard 
                habit={habit} 
                onToggle={() => toggle(habit.id, dateString)} 
              />
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
