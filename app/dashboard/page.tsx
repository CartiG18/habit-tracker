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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  const firstName = user?.displayName?.split(" ")[0]?.toUpperCase() ?? "OPERATOR";

  if (!mounted) {
    return (
      <div className="px-4 pt-8 max-w-lg mx-auto">
        <div className="h-10 w-3/4 bg-amber-dim animate-pulse mb-6" />
        <div className="h-16 bg-amber-dim animate-pulse mb-6 border border-amber/30" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-amber-dim animate-pulse border border-amber/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto pb-32 relative z-20">
      {/* Header */}
      <div className="mb-6 flex flex-col border-b border-amber/30 pb-4">
        <p className="text-amber/60 font-mono text-xs uppercase tracking-widest mb-1">
          SYS.DATE: {isSameDay(selectedDate, today) ? "CURRENT_CYCLE" : format(selectedDate, "yyyy.MM.dd")}
        </p>
        <h1 className="font-mono text-xl font-800 text-amber uppercase text-glow">
          OP: {firstName}
        </h1>
      </div>

      {/* Date Navigator (Terminal style) */}
      <div className="flex justify-between items-center mb-6 bg-basalt-light/50 border border-amber/30 p-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-center w-11 py-2 transition-all duration-150 relative",
                isSelected 
                  ? "bg-amber text-basalt font-800 shadow-[0_0_10px_rgba(255,176,0,0.5)]" 
                  : "text-amber/60 hover:bg-amber/10 hover:text-amber"
              )}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest">
                {format(day, "EEE")}
              </span>
              <span className="text-sm font-mono mt-0.5">
                {format(day, "dd")}
              </span>
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />
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
        <div className="flex justify-between items-center border-b border-amber/30 pb-2 mb-2">
           <span className="text-amber/60 text-xs font-mono uppercase tracking-widest">ACTIVE_PROCESSES</span>
           <span className="text-amber/60 text-xs font-mono">[{filteredHabits.length}]</span>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 border border-amber/30 bg-amber-dim animate-pulse" />
          ))
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-amber/30 bg-basalt-light/20">
            <div className="text-2xl mb-2 text-amber/40 animate-pulse">_</div>
            <p className="font-mono text-amber/60 text-sm uppercase">NO PROCESSES FOUND</p>
            <p className="text-amber/40 text-[10px] font-mono mt-1 uppercase">INITIALIZE NEW SEQUENCE</p>
          </div>
        ) : (
          filteredHabits.map((habit, i) => (
            <div key={`${habit.id}-${dateString}`} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <HabitCard 
                habit={habit} 
                onToggle={() => toggle(habit.id, dateString)} 
                selectedDate={dateString}
              />
            </div>
          ))
        )}
      </div>

      {/* Chunky Mechanical FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-putty border-2 border-putty-dark rounded-md flex items-center justify-center shadow-mech-out active:shadow-mech-in active:translate-y-0.5 transition-all z-40 group"
      >
        <Plus className="w-6 h-6 text-basalt group-hover:scale-110 transition-transform duration-200" strokeWidth={3} />
      </button>

      <AddHabitModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
