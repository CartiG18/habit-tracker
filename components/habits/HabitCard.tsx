"use client";

import { useState } from "react";
import { Check, Flame, ChevronRight } from "lucide-react";
import { HabitWithStats } from "@/types";
import { HABIT_COLORS, cn } from "@/lib/utils";
import { scheduleLabel } from "@/lib/habits";
import HabitDetailModal from "./HabitDetailModal";

interface Props {
  habit: HabitWithStats;
  onToggle: () => void;
}

export default function HabitCard({ habit, onToggle }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [popping, setPopping] = useState(false);
  const colors = HABIT_COLORS[habit.color];

  const isFrequency =
    habit.schedule.type === "frequency_week" ||
    habit.schedule.type === "frequency_month";

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
    onToggle();
  }

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className={cn(
          "glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer",
          "hover:bg-white/5 active:scale-[0.98] transition-all duration-150",
          habit.todayCompleted && "border border-white/10"
        )}
      >
        {/* Check button */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
            popping && "habit-check-pop",
            habit.todayCompleted
              ? `${colors.bg} border ${colors.border}`
              : "bg-surface-3 border border-white/10 hover:border-white/20"
          )}
        >
          {habit.todayCompleted ? (
            <Check className={cn("w-5 h-5", colors.text)} strokeWidth={2.5} />
          ) : (
            <span className="text-xl">{habit.emoji}</span>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {!habit.todayCompleted && <span className="text-base">{habit.emoji}</span>}
            <p className={cn(
              "font-display font-600 text-base truncate transition-colors",
              habit.todayCompleted ? "text-white/50 line-through" : "text-white"
            )}>
              {habit.name}
            </p>
          </div>

          {/* Frequency progress OR week dots */}
          {isFrequency && habit.periodCompletions !== undefined && habit.periodTarget !== undefined ? (
            <div className="mt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", colors.dot)}
                    style={{ width: `${Math.min((habit.periodCompletions / habit.periodTarget) * 100, 100)}%` }}
                  />
                </div>
                <span className={cn("text-xs font-display font-600", colors.text)}>
                  {habit.periodCompletions}/{habit.periodTarget}
                </span>
              </div>
              <p className="text-white/30 text-[10px] mt-0.5">{scheduleLabel(habit.schedule)}</p>
            </div>
          ) : (
            <div className="flex gap-1 mt-2">
              {habit.weekLogs.map((log) => (
                <div key={log.date} className={cn(
                  "w-4 h-1.5 rounded-full transition-all",
                  !log.scheduled ? "bg-surface-3 opacity-30" : log.completed ? colors.dot : "bg-surface-3"
                )} />
              ))}
            </div>
          )}
        </div>

        {/* Streak */}
        {habit.currentStreak > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-display font-700 text-sm text-orange-400">{habit.currentStreak}</span>
          </div>
        )}

        <ChevronRight className="w-4 h-4 text-white/20" />
      </div>

      <HabitDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        habit={habit}
        onToggle={onToggle}
      />
    </>
  );
}
