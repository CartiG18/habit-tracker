"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import {
  HABIT_COLORS,
  DAYS,
  WEEKDAYS,
  EVERYDAY,
  EMOJI_OPTIONS,
  cn,
} from "@/lib/utils";
import { HabitColor, DayOfWeek } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editHabit?: any; // for edit mode
}

const COLOR_OPTIONS: HabitColor[] = [
  "green","blue","purple","orange","pink","red","yellow","teal",
];

export default function AddHabitModal({ open, onClose, editHabit }: Props) {
  const { addHabit } = useHabits();

  const [name, setName] = useState(editHabit?.name ?? "");
  const [description, setDescription] = useState(editHabit?.description ?? "");
  const [emoji, setEmoji] = useState(editHabit?.emoji ?? "🎯");
  const [color, setColor] = useState<HabitColor>(editHabit?.color ?? "green");
  const [targetDays, setTargetDays] = useState<DayOfWeek[]>(
    editHabit?.targetDays ?? EVERYDAY
  );
  const [saving, setSaving] = useState(false);

  function toggleDay(day: DayOfWeek) {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await addHabit({ name: name.trim(), description, emoji, color, targetDays });
    setSaving(false);
    resetAndClose();
  }

  function resetAndClose() {
    setName("");
    setDescription("");
    setEmoji("🎯");
    setColor("green");
    setTargetDays(EVERYDAY);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-surface-1 rounded-t-3xl p-6 pb-10 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 text-white">
            {editHabit ? "Edit Habit" : "New Habit"}
          </h2>
          <button onClick={resetAndClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
              Icon
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-lg transition-all",
                    emoji === e
                      ? "bg-emerald-500/20 border-2 border-emerald-500"
                      : "bg-surface-3 hover:bg-surface-4"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
              Habit name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning run"
              className="w-full mt-2 bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
              Description (optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any notes..."
              className="w-full mt-2 bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
              Color
            </label>
            <div className="flex gap-2 mt-2">
              {COLOR_OPTIONS.map((c) => {
                const col = HABIT_COLORS[c];
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      col.dot,
                      color === c ? "ring-2 ring-white ring-offset-2 ring-offset-surface-1" : "opacity-60"
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* Target days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
                Target days
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTargetDays(EVERYDAY)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Every day
                </button>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => setTargetDays(WEEKDAYS)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Weekdays
                </button>
              </div>
            </div>
            <div className="flex gap-1.5">
              {DAYS.map(({ short, value }) => (
                <button
                  key={value}
                  onClick={() => toggleDay(value)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-display font-600 transition-all",
                    targetDays.includes(value)
                      ? "bg-emerald-500 text-black"
                      : "bg-surface-3 text-white/40 hover:text-white/60"
                  )}
                >
                  {short[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving || targetDays.length === 0}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-display font-700 py-3.5 rounded-xl transition-colors"
        >
          {saving ? "Saving..." : "Save Habit"}
        </button>
      </div>
    </div>
  );
}
