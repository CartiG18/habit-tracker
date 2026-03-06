"use client";

import { useState } from "react";
import { X, Check, Flame, TrendingUp, Archive } from "lucide-react";
import { format, parseISO } from "date-fns";
import { HabitWithStats } from "@/types";
import { HABIT_COLORS, cn, formatStreakText } from "@/lib/utils";
import { useHabits } from "@/hooks/useHabits";

interface Props {
  open: boolean;
  onClose: () => void;
  habit: HabitWithStats;
  onToggle: () => void;
}

export default function HabitDetailModal({ open, onClose, habit, onToggle }: Props) {
  const { addNote, removeHabit, todayLogs } = useHabits();
  const [note, setNote] = useState(todayLogs.get(habit.id)?.note ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const colors = HABIT_COLORS[habit.color];

  if (!open) return null;

  async function handleSaveNote() {
    setSavingNote(true);
    await addNote(habit.id, note);
    setSavingNote(false);
  }

  async function handleArchive() {
    await removeHabit(habit.id);
    onClose();
  }

  const rate = Math.round(habit.completionRate * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-1 rounded-t-3xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={cn("p-6 pb-4", colors.bg)}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-4xl">{habit.emoji}</span>
              <h2 className="font-display text-xl font-700 text-white mt-2">
                {habit.name}
              </h2>
              {habit.description && (
                <p className="text-white/40 text-sm mt-1">{habit.description}</p>
              )}
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complete button */}
          <button
            onClick={onToggle}
            className={cn(
              "w-full py-3 rounded-xl font-display font-600 text-sm transition-all",
              habit.todayCompleted
                ? "bg-white/10 text-white/60 border border-white/10"
                : `${colors.bg} border ${colors.border} ${colors.text}`
            )}
          >
            {habit.todayCompleted ? "✓ Completed today" : "Mark complete"}
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-2 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-display font-800 text-orange-400 text-lg">
                  {habit.currentStreak}
                </span>
              </div>
              <p className="text-white/40 text-[10px]">Current streak</p>
            </div>
            <div className="bg-surface-2 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-yellow-400" />
                <span className="font-display font-800 text-yellow-400 text-lg">
                  {habit.longestStreak}
                </span>
              </div>
              <p className="text-white/40 text-[10px]">Best streak</p>
            </div>
            <div className="bg-surface-2 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-display font-800 text-emerald-400 text-lg">
                  {rate}%
                </span>
              </div>
              <p className="text-white/40 text-[10px]">30-day rate</p>
            </div>
          </div>

          {/* Week view */}
          <div>
            <p className="text-white/40 text-xs font-display font-600 uppercase tracking-wider mb-3">
              Last 7 days
            </p>
            <div className="flex gap-2">
              {habit.weekLogs.map((log) => (
                <div key={log.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-full aspect-square rounded-lg flex items-center justify-center",
                      !log.scheduled
                        ? "bg-surface-3 opacity-20"
                        : log.completed
                        ? colors.bg + " border " + colors.border
                        : "bg-surface-3"
                    )}
                  >
                    {log.completed && (
                      <Check className={cn("w-3 h-3", colors.text)} strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-[10px] text-white/30">
                    {format(parseISO(log.date), "EEE")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's note */}
          <div>
            <p className="text-white/40 text-xs font-display font-600 uppercase tracking-wider mb-2">
              Today's note
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it go? Any reflections..."
              rows={3}
              className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-emerald-500/40 resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="mt-2 text-emerald-400 text-xs font-display font-600 hover:text-emerald-300 transition-colors"
            >
              {savingNote ? "Saving..." : "Save note"}
            </button>
          </div>

          {/* Archive */}
          <button
            onClick={handleArchive}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all text-sm"
          >
            <Archive className="w-4 h-4" />
            Archive habit
          </button>
        </div>
      </div>
    </div>
  );
}
