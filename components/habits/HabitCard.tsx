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
  const color = HABIT_COLORS[habit.color];
  const isFrequency = habit.schedule.type === "frequency_week" || habit.schedule.type === "frequency_month";

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
          "rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-150 active:scale-[0.98]",
          "hover:brightness-110"
        )}
        style={{
          background: "rgba(255,255,255,0.03)",
          border: habit.todayCompleted
            ? `1px solid ${color.border}`
            : "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Check button */}
        <button
          onClick={handleToggle}
          className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200", popping && "habit-check-pop")}
          style={habit.todayCompleted
            ? { background: color.bgAlpha, border: `1.5px solid ${color.border}` }
            : { background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)" }
          }
        >
          {habit.todayCompleted
            ? <Check className="w-5 h-5" strokeWidth={2.5} style={{ color: color.hex }} />
            : <span className="text-xl">{habit.emoji}</span>
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {!habit.todayCompleted && <span className="text-base">{habit.emoji}</span>}
            <p className={cn("font-display font-600 text-base truncate transition-colors",
              habit.todayCompleted ? "text-white/50 line-through" : "text-white"
            )}>
              {habit.name}
            </p>
          </div>

          {/* Frequency progress bar OR week dots */}
          {isFrequency && habit.periodCompletions !== undefined && habit.periodTarget !== undefined ? (
            <div className="mt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((habit.periodCompletions / habit.periodTarget) * 100, 100)}%`,
                      background: color.hex,
                    }}
                  />
                </div>
                <span className="text-xs font-display font-600" style={{ color: color.hex }}>
                  {habit.periodCompletions}/{habit.periodTarget}
                </span>
              </div>
              <p className="text-white/30 text-[10px] mt-0.5">{scheduleLabel(habit.schedule)}</p>
            </div>
          ) : (
            <div className="flex gap-1 mt-2">
              {habit.weekLogs.map((log) => (
                <div
                  key={log.date}
                  className="w-4 h-1.5 rounded-full transition-all"
                  style={{
                    background: !log.scheduled
                      ? "rgba(255,255,255,0.06)"
                      : log.completed
                      ? color.hex
                      : "rgba(255,255,255,0.1)",
                    opacity: !log.scheduled ? 0.3 : 1,
                  }}
                />
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
