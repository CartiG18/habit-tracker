"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { HabitWithStats } from "@/types";
import { HABIT_COLORS, cn } from "@/lib/utils";
import HabitDetailModal from "./HabitDetailModal";

interface Props {
  habit: HabitWithStats;
  onToggle: () => void;
  selectedDate: string;
}

export default function HabitCard({ habit, onToggle, selectedDate }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const color = HABIT_COLORS[habit.color];
  const isFrequency = habit.schedule.type === "frequency_week" || habit.schedule.type === "frequency_month";

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    onToggle();
  }

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className={cn(
          "p-4 flex items-center gap-4 cursor-pointer transition-all duration-300",
          "bg-basalt-light border border-amber/20 hover:border-amber/50 relative overflow-hidden"
        )}
      >
        {/* Scanline subtle overlay for the card */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

        {/* Mechanical Toggle Switch */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-12 h-16 rounded-sm flex flex-col justify-between p-1 flex-shrink-0 transition-all duration-300 relative z-10", 
            habit.todayCompleted ? "bg-basalt shadow-mech-in" : "bg-putty shadow-mech-out"
          )}
        >
          {/* Top light indicator */}
          <div className={cn(
            "w-full h-3 rounded-sm transition-colors duration-300",
            habit.todayCompleted ? "bg-signal shadow-[0_0_8px_rgba(50,205,50,0.8)]" : "bg-basalt-light shadow-inner"
          )} />
          {/* Switch grip */}
          <div className={cn(
            "w-full h-8 rounded-sm transition-all duration-300",
            habit.todayCompleted ? "bg-putty-dark translate-y-3" : "bg-putty-light shadow-md"
          )}>
            <div className="w-full h-[1px] bg-putty-dark mt-1 opacity-50" />
            <div className="w-full h-[1px] bg-putty-dark mt-1 opacity-50" />
            <div className="w-full h-[1px] bg-putty-dark mt-1 opacity-50" />
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 z-10 pl-2">
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-lg opacity-80",
              habit.todayCompleted && "grayscale opacity-40"
            )}>{habit.emoji}</span>
            <p className={cn("font-mono font-700 text-sm truncate uppercase tracking-widest transition-colors",
              habit.todayCompleted ? "text-signal text-signal" : "text-amber text-glow"
            )}>
              {habit.name}
            </p>
          </div>

          {/* Progress context as terminal data */}
          <div className="mt-2 flex items-center gap-3">
            {isFrequency && habit.periodCompletions !== undefined && habit.periodTarget !== undefined ? (
              <span className="text-[10px] font-mono font-700 uppercase tracking-widest text-amber/60">
                DATA: {habit.periodCompletions}/{habit.periodTarget}
              </span>
            ) : (
              <div className="flex gap-1.5 items-center">
                {habit.weekLogs.map((log, i) => (
                  <div
                    key={log.date}
                    className="w-1.5 h-3 transition-all"
                    style={{
                      background: !log.scheduled
                        ? "transparent"
                        : log.completed
                        ? "var(--signal)"
                        : "var(--amber)",
                      opacity: !log.scheduled ? 0 : log.completed ? 1 : 0.3,
                      boxShadow: log.completed ? "0 0 5px rgba(50,205,50,0.6)" : "none",
                    }}
                  />
                ))}
              </div>
            )}
            
            {habit.currentStreak > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="font-mono font-700 text-[10px] text-amber/80 uppercase">SEQ:{habit.currentStreak.toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-amber/40 z-10" />
      </div>

      {detailOpen && (
        <HabitDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          habit={habit}
          onToggle={onToggle}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
}
