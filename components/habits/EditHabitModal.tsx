"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { HABIT_COLORS, DAYS, EMOJI_OPTIONS, cn } from "@/lib/utils";
import { HabitColor, DayOfWeek, HabitSchedule, Habit } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  habit: Habit;
}

const COLOR_OPTIONS: HabitColor[] = ["green","blue","purple","orange","pink","red","yellow","teal"];
type ScheduleType = "weekly" | "monthly_dates" | "frequency_week" | "frequency_month";

export default function EditHabitModal({ open, onClose, habit }: Props) {
  const { editHabit } = useHabits();

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description ?? "");
  const [emoji, setEmoji] = useState(habit.emoji);
  const [color, setColor] = useState<HabitColor>(habit.color);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(habit.schedule.type);

  // weekly
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    habit.schedule.type === "weekly" ? habit.schedule.days : [0,1,2,3,4,5,6]
  );
  // monthly_dates
  const [selectedDates, setSelectedDates] = useState<number[]>(
    habit.schedule.type === "monthly_dates" ? habit.schedule.dates : [1]
  );
  // frequency
  const [freqCount, setFreqCount] = useState(
    habit.schedule.type === "frequency_week" 
      ? habit.schedule.timesPerWeek 
      : habit.schedule.type === "frequency_month" 
      ? habit.schedule.timesPerMonth 
      : 3
  );

  const [saving, setSaving] = useState(false);

  // Sync with habit prop if it changes
  useEffect(() => {
    setName(habit.name);
    setDescription(habit.description ?? "");
    setEmoji(habit.emoji);
    setColor(habit.color);
    setScheduleType(habit.schedule.type);
    
    if (habit.schedule.type === "weekly") {
      setSelectedDays(habit.schedule.days);
    }
    if (habit.schedule.type === "monthly_dates") {
      setSelectedDates(habit.schedule.dates);
    }
    if (habit.schedule.type === "frequency_week") {
      setFreqCount(habit.schedule.timesPerWeek);
    }
    if (habit.schedule.type === "frequency_month") {
      setFreqCount(habit.schedule.timesPerMonth);
    }
  }, [habit]);

  function toggleDay(day: DayOfWeek) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function toggleDate(date: number) {
    setSelectedDates((prev) => prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]);
  }

  function buildSchedule(): HabitSchedule {
    switch (scheduleType) {
      case "weekly":
        return { type: "weekly", days: selectedDays };
      case "monthly_dates":
        return { type: "monthly_dates", dates: selectedDates };
      case "frequency_week":
        return { type: "frequency_week", timesPerWeek: freqCount };
      case "frequency_month":
        return { type: "frequency_month", timesPerMonth: freqCount };
    }
  }

  function isValid() {
    if (!name.trim()) return false;
    if (scheduleType === "weekly" && selectedDays.length === 0) return false;
    if (scheduleType === "monthly_dates" && selectedDates.length === 0) return false;
    return true;
  }

  async function handleSave() {
    if (!isValid()) return;
    setSaving(true);
    await editHabit(habit.id, { 
      name: name.trim(), 
      description, 
      emoji, 
      color, 
      schedule: buildSchedule() 
    });
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  const SCHEDULE_TABS: { value: ScheduleType; label: string }[] = [
    { value: "weekly", label: "Days of week" },
    { value: "monthly_dates", label: "Days of month" },
    { value: "frequency_week", label: "Times/week" },
    { value: "frequency_month", label: "Times/month" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-1 rounded-t-3xl p-6 pb-10 animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 text-white">Edit Habit</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Emoji */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">Icon</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={cn("w-10 h-10 rounded-xl text-lg transition-all",
                    emoji === e ? "bg-emerald-500/20 border-2 border-emerald-500" : "bg-surface-3 hover:bg-surface-4"
                  )}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">Habit name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning run"
              className="w-full mt-2 bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-emerald-500/50" />
          </div>

          {/* Description */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Any notes..."
              className="w-full mt-2 bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-emerald-500/50" />
          </div>

          {/* Color */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">Color</label>
            <div className="flex gap-2 mt-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: HABIT_COLORS[c].hex,
                    opacity: color === c ? 1 : 0.4,
                    outline: color === c ? `3px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Schedule type tabs */}
          <div>
            <label className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">Schedule</label>
            <div className="grid grid-cols-2 gap-1.5 mt-2 bg-surface-2 rounded-xl p-1">
              {SCHEDULE_TABS.map((tab) => (
                <button key={tab.value} onClick={() => setScheduleType(tab.value)}
                  className={cn("py-2 px-2 rounded-lg text-xs font-display font-600 transition-all",
                    scheduleType === tab.value ? "bg-white text-black" : "text-white/40 hover:text-white/60"
                  )}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Weekly: day picker */}
            {scheduleType === "weekly" && (
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  <button onClick={() => setSelectedDays([0,1,2,3,4,5,6])} className="text-xs text-emerald-400 hover:text-emerald-300 mr-2">Every day</button>
                  <button onClick={() => setSelectedDays([1,2,3,4,5])} className="text-xs text-emerald-400 hover:text-emerald-300">Weekdays</button>
                </div>
                <div className="flex gap-1.5">
                  {DAYS.map(({ short, value }) => (
                    <button key={value} onClick={() => toggleDay(value)}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-display font-600 transition-all",
                        selectedDays.includes(value) ? "bg-emerald-500 text-black" : "bg-surface-3 text-white/40 hover:text-white/60"
                      )}>
                      {short[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly dates: date grid */}
            {scheduleType === "monthly_dates" && (
              <div className="mt-3">
                <p className="text-white/40 text-xs mb-2">Select which days of the month</p>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <button key={date} onClick={() => toggleDate(date)}
                      className={cn("aspect-square rounded-lg text-xs font-display font-600 transition-all",
                        selectedDates.includes(date) ? "bg-emerald-500 text-black" : "bg-surface-3 text-white/40 hover:text-white/60"
                      )}>
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Frequency: times per week or month */}
            {(scheduleType === "frequency_week" || scheduleType === "frequency_month") && (
              <div className="mt-3">
                <p className="text-white/40 text-xs mb-3">
                  How many times {scheduleType === "frequency_week" ? "per week" : "per month"}?
                </p>
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setFreqCount((n) => Math.max(1, n - 1))}
                    className="w-10 h-10 rounded-full bg-surface-3 text-white text-xl hover:bg-surface-4 transition-colors flex items-center justify-center">
                    −
                  </button>
                  <div className="text-center">
                    <span className="font-display font-800 text-4xl text-white">{freqCount}</span>
                    <p className="text-white/40 text-xs mt-1">
                      {scheduleType === "frequency_week" ? "days / week" : "days / month"}
                    </p>
                  </div>
                  <button onClick={() => setFreqCount((n) => Math.min(scheduleType === "frequency_week" ? 7 : 31, n + 1))}
                    className="w-10 h-10 rounded-full bg-surface-3 text-white text-xl hover:bg-surface-4 transition-colors flex items-center justify-center">
                    +
                  </button>
                </div>
                <p className="text-white/30 text-xs text-center mt-3">
                  Complete on any days you choose — we'll track your progress toward the target.
                </p>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSave} disabled={!isValid() || saving}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-display font-700 py-3.5 rounded-xl transition-colors">
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
