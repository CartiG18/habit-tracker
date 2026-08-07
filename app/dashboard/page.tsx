"use client";

import { useState, useMemo, useEffect } from "react";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal from "@/components/habits/AddHabitModal";
import DailyProgress from "@/components/habits/DailyProgress";
import { useAuth } from "@/lib/auth-context";
import { isScheduledDay } from "@/lib/habits";
import { formatDateString } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);
  
  const { habits, loading, toggle } = useHabits(dateString);
  const { user } = useAuth();
  const { isRetro } = useTheme();
  const copy = useCopy();
  const [addOpen, setAddOpen] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Generate last 7 days for the navigator
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();
  }, [today]);

  // Show habits that are scheduled for the selected day
  const filteredHabits = habits.filter((h) => isScheduledDay(h.schedule, selectedDate));
  const completedCount = filteredHabits.reduce((acc, h) => {
    if (h.subtasks && h.subtasks.length > 0) {
      return acc + (h.todayCompletedSubtasks?.length || 0) / h.subtasks.length;
    }
    return acc + (h.todayCompleted ? 1 : 0);
  }, 0);
  const allDone = filteredHabits.length > 0 && Math.round(completedCount * 100) === filteredHabits.length * 100;

  const firstName = user?.displayName?.split(" ")[0] ?? (isRetro ? "OPERATOR" : "User");
  const displayName = isRetro ? firstName.toUpperCase() : firstName;

  if (!mounted) {
    return (
      <div className="px-4 pt-8 max-w-lg mx-auto">
        <div className="h-10 w-3/4 bg-th-primary-dim animate-pulse mb-6" />
        <div className="h-16 bg-th-primary-dim animate-pulse mb-6 border border-th-primary/30" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-th-primary-dim animate-pulse border border-th-primary/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto pb-32 relative z-20">
      {/* Header */}
      <div className={cn("mb-6 flex flex-col pb-4", isRetro ? "border-b border-th-primary/30" : "")}>
        <p className={cn("transition-colors", isRetro ? "text-th-primary/60 font-theme text-xs uppercase tracking-widest mb-1" : "text-th-text-secondary font-theme text-sm mb-1")}>
          {copy.dateLabelPrefix} {isSameDay(selectedDate, today) ? copy.dateLabelCurrent : format(selectedDate, isRetro ? "yyyy.MM.dd" : "MMMM d, yyyy")}
        </p>
        <h1 className={cn("font-theme transition-colors", isRetro ? "text-xl font-800 text-th-primary uppercase text-glow" : "text-3xl font-700 text-th-text")}>
          {copy.greetingPrefix} {displayName}
        </h1>
      </div>

      {/* Date Navigator */}
      <div className={cn("flex justify-between items-center mb-6 transition-colors", 
        isRetro 
          ? "bg-th-screen-light/50 border border-th-primary/30 p-1" 
          : "bg-th-surface p-1 rounded-2xl shadow-neu-in"
      )}>
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-150 relative",
                isRetro 
                  ? [
                      "w-11 py-2",
                      isSelected 
                        ? "bg-th-primary text-th-btn-text font-800 shadow-[0_0_10px_rgba(var(--th-primary),0.5)]" 
                        : "text-th-primary/60 hover:bg-th-primary/10 hover:text-th-primary"
                    ]
                  : [
                      "w-12 py-3 rounded-xl",
                      isSelected 
                        ? "bg-th-screen shadow-neu-out text-th-text font-700" 
                        : "text-th-text-secondary hover:text-th-text hover:bg-th-surface-light"
                    ]
              )}
            >
              <span className={cn("transition-colors", isRetro ? "text-[10px] font-theme uppercase tracking-widest" : "text-[10px] font-theme font-500")}>
                {format(day, "EEE")}
              </span>
              <span className={cn("font-theme mt-0.5", isRetro ? "text-sm" : "text-base")}>
                {format(day, "dd")}
              </span>
              {isToday && !isSelected && (
                <div className={cn("absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse", 
                  isRetro ? "bg-th-primary" : "bg-th-success"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress section */}
      {filteredHabits.length > 0 && (
        <div className="mb-6">
          <DailyProgress completed={completedCount} total={filteredHabits.length} allDone={allDone} />
        </div>
      )}

      {/* Habit list */}
      <div className="space-y-3 relative z-30">
        <div className={cn("flex justify-between items-center pb-2 mb-2 transition-colors", isRetro ? "border-b border-th-primary/30" : "")}>
           <span className={cn("transition-colors", isRetro ? "text-th-primary/60 text-xs font-theme uppercase tracking-widest" : "text-th-text-secondary text-sm font-theme font-500")}>{copy.activeHabits}</span>
           <span className={cn("transition-colors", isRetro ? "text-th-primary/60 text-xs font-theme" : "text-th-text-secondary text-sm font-theme")}>[{filteredHabits.length}]</span>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("h-24 animate-pulse", isRetro ? "border border-th-primary/30 bg-th-primary-dim" : "bg-th-surface rounded-2xl")} />
          ))
        ) : filteredHabits.length === 0 ? (
          <div className={cn("text-center py-16 transition-colors flex flex-col items-center justify-center", 
            isRetro ? "border border-dashed border-th-primary/30 bg-th-screen-light/20" : "bg-th-surface rounded-3xl shadow-neu-in"
          )}>
            <div className={cn("text-2xl mb-2 animate-pulse", isRetro ? "text-th-primary/40" : "text-th-text-secondary")}>
              {isRetro ? "_" : "○"}
            </div>
            <p className={cn("font-theme transition-colors", isRetro ? "text-th-primary/60 text-sm uppercase" : "text-th-text-secondary text-base font-500")}>{copy.noHabits}</p>
            <p className={cn("transition-colors mt-1 font-theme", isRetro ? "text-th-primary/40 text-[10px] uppercase" : "text-th-text-secondary/60 text-xs")}>{copy.noHabitsHint}</p>
          </div>
        ) : (
          filteredHabits.map((habit, i) => (
            <div key={`${habit.id}-${dateString}`} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <HabitCard 
                habit={habit} 
                onToggle={() => toggle(habit, dateString)} 
                selectedDate={dateString}
              />
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className={cn(
          "fixed bottom-28 right-6 flex items-center justify-center transition-all z-40 group",
          isRetro 
            ? "w-14 h-14 bg-th-surface border-2 border-th-surface-dark rounded-md shadow-th-raised active:shadow-th-inset active:translate-y-0.5"
            : "w-16 h-16 bg-th-primary rounded-full shadow-[0_8px_20px_rgba(var(--th-primary),0.4)] active:scale-95 active:shadow-[0_4px_10px_rgba(var(--th-primary),0.4)]"
        )}
      >
        <Plus className={cn("group-hover:scale-110 transition-transform duration-200", isRetro ? "w-6 h-6 text-th-btn-text" : "w-8 h-8 text-th-btn-text")} strokeWidth={isRetro ? 3 : 2.5} />
      </button>

      <AddHabitModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
