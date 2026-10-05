"use client";

import { useState } from "react";
import { HabitWithStats } from "@/types";
import { HABIT_COLORS, cn } from "@/lib/utils";
import { useTheme, useIcons } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import HabitDetailModal from "./HabitDetailModal";
import CompletionMarker from "./CompletionMarker";

interface Props {
  habit: HabitWithStats;
  onToggle: () => void;
  selectedDate: string;
}

export default function HabitCard({ habit, onToggle, selectedDate }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { isRetro } = useTheme();
  const copy = useCopy();
  const Icons = useIcons();
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
          "flex items-center gap-4 cursor-pointer transition-all duration-300 relative",
          isRetro
            ? "p-4 bg-th-screen-light border border-th-primary/20 hover:border-th-primary/50 overflow-hidden"
            : "p-4 sm:p-5 bg-th-surface border border-th-surface-dark/10 shadow-neu-out sm:rounded-2xl rounded-xl hover:shadow-neu-in"
        )}
      >
        {/* Retro: Scanline overlay */}
        {isRetro && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        )}

        {/* Toggle Button / Status Indicator */}
        {habit.subtasks && habit.subtasks.length > 0 ? (
          isRetro ? (
            <button
              onClick={handleToggle}
              className={cn(
                "flex-shrink-0 transition-all duration-300 flex items-center justify-center relative z-10",
                "w-12 h-16 rounded-sm border-2",
                habit.todayCompleted ? "bg-th-success/20 text-th-success border-th-success shadow-[inset_0_0_8px_rgb(var(--th-success)/0.4),0_0_5px_rgb(var(--th-success)/0.6)]" : "bg-th-screen-light border-th-primary/30 text-th-primary/60"
              )}
            >
              <span className="font-theme font-800 text-[10px] uppercase">
                {Math.round(((habit.todayCompletedSubtasks?.length || 0) / habit.subtasks.length) * 100)}%
              </span>
            </button>
          ) : (
            <CompletionMarker large completed={habit.todayCompleted} onClick={handleToggle}>
              {habit.todayCompleted ? <Icons.check className="w-5 h-5" strokeWidth={3} /> : `${habit.todayCompletedSubtasks?.length || 0}/${habit.subtasks.length}`}
            </CompletionMarker>
          )
        ) : isRetro ? (
          /* Mechanical Toggle Switch */
          <button
            onClick={handleToggle}
            className={cn(
              "w-12 h-16 rounded-sm flex flex-col justify-between p-1 flex-shrink-0 transition-all duration-300 relative z-10", 
              habit.todayCompleted ? "bg-th-screen shadow-th-inset" : "bg-th-surface shadow-th-raised"
            )}
          >
            <div className={cn(
              "w-full h-3 rounded-sm transition-colors duration-300",
              habit.todayCompleted ? "bg-th-success shadow-[0_0_8px_rgb(var(--th-success)/0.8)]" : "bg-th-screen-light shadow-inner"
            )} />
            <div className={cn(
              "w-full h-8 rounded-sm transition-all duration-300",
              habit.todayCompleted ? "bg-th-surface-dark translate-y-3" : "bg-th-surface-light shadow-md"
            )}>
              <div className="w-full h-[1px] bg-th-surface-dark mt-1 opacity-50" />
              <div className="w-full h-[1px] bg-th-surface-dark mt-1 opacity-50" />
              <div className="w-full h-[1px] bg-th-surface-dark mt-1 opacity-50" />
            </div>
          </button>
        ) : (
          <CompletionMarker completed={habit.todayCompleted} onClick={handleToggle}>
            {habit.todayCompleted && <Icons.check className="w-5 h-5" strokeWidth={3} />}
          </CompletionMarker>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 z-10 pl-2">
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-lg opacity-80",
              habit.todayCompleted && isRetro && "grayscale opacity-40",
              habit.todayCompleted && !isRetro && "opacity-50"
            )}>{habit.emoji}</span>
            <p className={cn(
              "truncate transition-colors",
              isRetro 
                ? ["font-theme font-700 text-sm uppercase tracking-widest", habit.todayCompleted ? "text-th-success text-signal" : "text-th-primary text-glow"]
                : ["font-theme font-500 text-base", habit.todayCompleted ? "text-th-text-secondary line-through" : "text-th-text"]
            )}>
              {habit.name}
            </p>
          </div>

          {/* Progress context */}
          <div className="mt-2 flex items-center gap-3">
            {isFrequency && habit.periodCompletions !== undefined && habit.periodTarget !== undefined ? (
              <span className={cn(
                "transition-colors",
                isRetro 
                  ? "text-[10px] font-theme font-700 uppercase tracking-widest text-th-primary/60"
                  : "text-xs font-theme text-th-text-secondary"
              )}>
                {copy.dataPrefix} {habit.periodCompletions}/{habit.periodTarget}
              </span>
            ) : (
              <div className="flex gap-1.5 items-center">
                {habit.weekLogs.map((log, i) => (
                  <div
                    key={log.date}
                    className={cn(
                      isRetro ? "w-1.5 h-3" : "w-2 h-2 rounded-full",
                      "transition-all"
                    )}
                    style={{
                      background: !log.scheduled
                        ? "transparent"
                        : log.completed
                        ? "rgb(var(--th-success))"
                        : isRetro ? "rgb(var(--th-primary))" : "rgb(var(--th-surface-dark))",
                      opacity: !log.scheduled ? 0 : log.completed ? 1 : (isRetro ? 0.3 : 0.5),
                      boxShadow: (isRetro && log.completed) ? "0 0 5px rgb(var(--th-success) / 0.6)" : "none",
                    }}
                  />
                ))}
              </div>
            )}
            
            {habit.currentStreak > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <span className={cn(
                  "transition-colors",
                  isRetro 
                    ? "font-theme font-700 text-[10px] text-th-primary/80 uppercase"
                    : "font-theme font-500 text-xs text-th-text-secondary bg-th-surface-dark/20 px-2 py-0.5 rounded-full"
                )}>
                  {copy.seqPrefix}
                  {isRetro ? habit.currentStreak.toString().padStart(2, '0') : ` ${habit.currentStreak} day`}
                </span>
              </div>
            )}
          </div>
        </div>

        <Icons.chevron className={cn(
          "w-5 h-5 z-10 transition-colors",
          isRetro ? "text-th-primary/40" : "text-th-surface-dark"
        )} />
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
