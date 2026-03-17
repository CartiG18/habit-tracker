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
    { value: "weekly", label: "DAYS" },
    { value: "monthly_dates", label: "DATES" },
    { value: "frequency_week", label: "FRQ/W" },
    { value: "frequency_month", label: "FRQ/M" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-putty border-4 border-putty-dark rounded-xl shadow-mech-out p-3 animate-slide-up">
        <div className="bg-basalt crt-screen rounded-lg border-[6px] border-putty-dark shadow-bezel-inner relative overflow-hidden flex flex-col max-h-[85vh]">
          <div className="scanline-overlay"></div>
          <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>

          <div className="flex-1 overflow-y-auto z-20 relative p-6">
            <div className="flex items-center justify-between mb-6 border-b border-amber/30 pb-4">
              <h2 className="font-mono text-xl font-800 text-amber text-glow uppercase tracking-wide">RECONFIGURE_PROCESS</h2>
              <button onClick={onClose} className="p-2 border border-amber/30 text-amber/60 hover:text-amber hover:bg-amber/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Emoji */}
              <div>
                <label className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-widest">SYS.ICON</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={cn("w-10 h-10 border text-lg transition-all duration-200 flex items-center justify-center",
                        emoji === e ? "bg-amber/20 border-amber shadow-[inset_0_0_10px_rgba(255,176,0,0.5)]" : "bg-basalt-light border-amber/30 hover:border-amber/60"
                      )}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-widest">PROCESS_ID</label>
                <div className="flex items-center mt-2 border-b-2 border-amber/50 bg-basalt-light/30">
                  <span className="text-amber/40 font-mono px-2">{`>`}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ENTER IDENTIFIER..."
                    className="w-full py-3 text-amber placeholder-amber/20 font-mono text-lg outline-none bg-transparent uppercase focus:bg-amber/5 transition-colors" />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-widest">LED_COLOR</label>
                <div className="flex gap-2.5 mt-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn("w-8 h-8 rounded-sm transition-all duration-300 border-2",
                        color === c ? "border-amber shadow-[0_0_8px_currentColor]" : "border-basalt opacity-50 hover:opacity-100"
                      )}
                      style={{
                        background: HABIT_COLORS[c].hex,
                        color: HABIT_COLORS[c].hex,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="pt-4 border-t border-amber/20">
                <label className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-widest">EXECUTION_PARAMS</label>
                <div className="grid grid-cols-4 gap-1 mt-3 bg-basalt-light/50 border border-amber/30 p-1">
                  {SCHEDULE_TABS.map((tab) => (
                    <button key={tab.value} onClick={() => setScheduleType(tab.value)}
                      className={cn("py-2 px-1 text-[10px] font-mono font-700 transition-all",
                        scheduleType === tab.value ? "bg-amber text-basalt shadow-[0_0_5px_rgba(255,176,0,0.5)]" : "text-amber/50 hover:bg-amber/10"
                      )}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Weekly */}
                {scheduleType === "weekly" && (
                  <div className="mt-4 flex gap-1">
                    {DAYS.map(({ short, value }) => (
                      <button key={value} onClick={() => toggleDay(value)}
                        className={cn("flex-1 py-3 transition-all duration-200 font-mono text-[9px] font-700 border",
                          selectedDays.includes(value) ? "bg-amber/20 text-amber border-amber shadow-[inset_0_0_8px_rgba(255,176,0,0.4)]" : "bg-basalt-light border-amber/30 text-amber/40 hover:text-amber/80"
                        )}>
                        {short}
                      </button>
                    ))}
                  </div>
                )}

                {/* Frequency */}
                {(scheduleType === "frequency_week" || scheduleType === "frequency_month") && (
                  <div className="mt-4 flex items-center justify-center gap-6 bg-basalt-light/30 p-4 border border-amber/30">
                    <button onClick={() => setFreqCount((n) => Math.max(1, n - 1))}
                      className="w-10 h-10 border border-amber text-amber hover:bg-amber/20 transition-colors flex items-center justify-center font-mono font-800 text-xl">
                      −
                    </button>
                    <div className="text-center min-w-[80px]">
                      <span className="font-mono font-800 text-3xl text-amber text-glow leading-none">{freqCount}</span>
                      <p className="text-amber/50 text-[9px] font-mono uppercase tracking-widest mt-1">
                        TARGET
                      </p>
                    </div>
                    <button onClick={() => setFreqCount((n) => Math.min(scheduleType === "frequency_week" ? 7 : 31, n + 1))}
                      className="w-10 h-10 border border-amber text-amber hover:bg-amber/20 transition-colors flex items-center justify-center font-mono font-800 text-xl">
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={!isValid() || saving}
              className="w-full mt-8 bg-amber text-basalt hover:bg-amber/90 disabled:opacity-40 disabled:bg-amber/20 disabled:text-amber font-mono font-800 uppercase tracking-[0.2em] py-4 transition-all duration-300 shadow-[0_0_15px_rgba(255,176,0,0.4)]">
              {saving ? "UPLOADING..." : "UPDATE_SEQUENCE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
