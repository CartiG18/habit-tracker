"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { HABIT_COLORS, DAYS, EMOJI_OPTIONS, cn } from "@/lib/utils";
import { HabitColor, DayOfWeek, HabitSchedule, Subtask } from "@/types";
import { useTheme } from "@/lib/theme-context";
import { useCopy, CopyKey } from "@/lib/copy";

interface Props {
  open: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS: HabitColor[] = ["green","blue","purple","orange","pink","red","yellow","teal"];
type ScheduleType = "weekly" | "monthly_dates" | "frequency_week" | "frequency_month";

export default function AddHabitModal({ open, onClose }: Props) {
  const { addHabit } = useHabits();
  const { isRetro } = useTheme();
  const copy = useCopy();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("⚡");
  const [color, setColor] = useState<HabitColor>("green");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("weekly");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  // weekly
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([0,1,2,3,4,5,6]);
  // monthly_dates
  const [selectedDates, setSelectedDates] = useState<number[]>([1]);
  // frequency
  const [freqCount, setFreqCount] = useState(3);

  const [saving, setSaving] = useState(false);

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
    const finalSubtasks = subtasks.filter(st => st.title.trim() !== "");
    await addHabit({ name: name.trim(), description, emoji, color, schedule: buildSchedule(), subtasks: finalSubtasks });
    setSaving(false);
    resetAndClose();
  }

  function resetAndClose() {
    setName(""); setDescription(""); setEmoji("⚡"); setColor("green");
    setScheduleType("weekly"); setSelectedDays([0,1,2,3,4,5,6]);
    setSelectedDates([1]); setFreqCount(3); setSubtasks([]);
    onClose();
  }

  if (!open) return null;

  const SCHEDULE_TABS: { value: ScheduleType; label: string }[] = [
    { value: "weekly", label: copy.scheduleDays },
    { value: "monthly_dates", label: copy.scheduleDates },
    { value: "frequency_week", label: copy.scheduleFreqWeek },
    { value: "frequency_month", label: copy.scheduleFreqMonth },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={resetAndClose} />
      
      <div className={cn(
        "relative w-full max-w-lg transition-all animate-slide-up",
        isRetro 
          ? "bg-th-surface border-4 border-th-surface-dark rounded-xl shadow-mech-out p-3"
          : "bg-th-screen border border-th-surface-dark/20 rounded-3xl shadow-neu-out p-1"
      )}>
        <div className={cn(
          "relative overflow-hidden flex flex-col max-h-[85vh]",
          isRetro 
            ? "bg-th-screen crt-screen rounded-lg border-[6px] border-th-surface-dark shadow-bezel-inner"
            : "bg-th-screen rounded-3xl"
        )}>
          {isRetro && (
            <>
              <div className="scanline-overlay"></div>
              <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
            </>
          )}

          <div className={cn("flex-1 overflow-y-auto z-20 relative", isRetro ? "p-6" : "p-8")}>
            {/* Header */}
            <div className={cn("flex items-center justify-between mb-6 pb-4", isRetro ? "border-b border-th-primary/30" : "")}>
              <h2 className={cn(
                "font-theme text-xl transition-colors",
                isRetro ? "font-800 text-th-primary text-glow uppercase tracking-wide" : "font-700 text-th-text"
              )}>
                {copy.addHabitTitle}
              </h2>
              <button onClick={resetAndClose} className={cn(
                "p-2 transition-colors rounded-full",
                isRetro 
                  ? "border border-th-primary/30 text-th-primary/60 hover:text-th-primary hover:bg-th-primary/10 rounded-none"
                  : "bg-th-surface-light text-th-text-secondary hover:bg-th-surface-dark/20"
              )}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Emoji */}
              <div>
                <label className={cn("font-theme transition-colors block", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest" : "text-sm font-500 text-th-text-secondary")}>
                  {copy.labelIcon}
                </label>
                <div className="mt-2">
                  <div className={cn("inline-flex items-center justify-center w-16 h-16 text-3xl transition-all duration-200",
                        isRetro 
                          ? "bg-th-screen-light/30 border-2 border-th-primary shadow-[inset_0_0_10px_rgba(var(--th-primary),0.2)]"
                          : "bg-th-surface rounded-2xl shadow-neu-in border border-th-surface-dark/20"
                      )}>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Keep only the last typed character/emoji if multiple are typed
                        if (val.length > 0) {
                          setEmoji(Array.from(val).pop() || "");
                        } else {
                          setEmoji("");
                        }
                      }}
                      className={cn("w-full h-full bg-transparent text-center outline-none", isRetro ? "text-th-primary text-glow" : "text-th-text")}
                      placeholder="✨"
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={cn("font-theme transition-colors block", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest" : "text-sm font-500 text-th-text-secondary")}>
                  {copy.labelName}
                </label>
                <div className={cn("flex items-center mt-2", 
                  isRetro 
                    ? "border-b-2 border-th-primary/50 bg-th-screen-light/30"
                    : "bg-th-surface rounded-xl border border-th-surface-dark/20 shadow-neu-in px-3"
                )}>
                  {isRetro && <span className="text-th-primary/40 font-theme px-2">{`>`}</span>}
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.inputPlaceholder}
                    className={cn("w-full py-3 font-theme text-lg outline-none bg-transparent transition-colors placeholder-opacity-50",
                      isRetro ? "text-th-primary placeholder-th-primary/20 uppercase focus:bg-th-primary/5" : "text-th-text placeholder-th-text-secondary"
                    )} />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className={cn("font-theme transition-colors block", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest" : "text-sm font-500 text-th-text-secondary")}>
                  {copy.labelColor}
                </label>
                <div className="flex gap-2.5 mt-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn("w-8 h-8 transition-all duration-300",
                        isRetro 
                          ? ["rounded-sm border-2", color === c ? "border-th-primary shadow-[0_0_8px_currentColor]" : "border-th-screen opacity-50 hover:opacity-100"]
                          : ["rounded-full", color === c ? "shadow-[0_0_0_2px_rgb(var(--th-screen)),0_0_0_4px_currentColor]" : "opacity-50 hover:opacity-100 hover:scale-110"]
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
              <div className={cn("pt-4", isRetro ? "border-t border-th-primary/20" : "")}>
                <label className={cn("font-theme transition-colors block", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest" : "text-sm font-500 text-th-text-secondary")}>
                  {copy.labelSchedule}
                </label>
                <div className={cn("grid grid-cols-4 gap-1 mt-3", 
                  isRetro ? "bg-th-screen-light/50 border border-th-primary/30 p-1" : "bg-th-surface p-1 rounded-xl shadow-neu-in"
                )}>
                  {SCHEDULE_TABS.map((tab) => (
                    <button key={tab.value} onClick={() => setScheduleType(tab.value)}
                      className={cn("py-2 px-1 font-theme transition-all",
                        isRetro 
                          ? ["text-[10px] font-700", scheduleType === tab.value ? "bg-th-primary text-th-btn-text shadow-[0_0_5px_rgba(var(--th-primary),0.5)]" : "text-th-primary/50 hover:bg-th-primary/10"]
                          : ["text-xs font-500 rounded-lg", scheduleType === tab.value ? "bg-th-screen shadow-neu-out text-th-text" : "text-th-text-secondary hover:text-th-text"]
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
                        className={cn("flex-1 py-3 transition-all duration-200 font-theme font-700",
                          isRetro 
                            ? ["text-[9px] border", selectedDays.includes(value) ? "bg-th-primary/20 text-th-primary border-th-primary shadow-[inset_0_0_8px_rgba(var(--th-primary),0.4)]" : "bg-th-screen-light border-th-primary/30 text-th-primary/40 hover:text-th-primary/80"]
                            : ["text-xs rounded-xl", selectedDays.includes(value) ? "bg-th-primary text-th-btn-text shadow-th-raised" : "bg-th-surface text-th-text-secondary hover:bg-th-surface-dark/20"]
                        )}>
                        {short}
                      </button>
                    ))}
                  </div>
                )}

                {/* Frequency */}
                {(scheduleType === "frequency_week" || scheduleType === "frequency_month") && (
                  <div className={cn("mt-4 flex items-center justify-center gap-6",
                    isRetro ? "bg-th-screen-light/30 p-4 border border-th-primary/30" : "bg-th-surface p-4 rounded-xl"
                  )}>
                    <button onClick={() => setFreqCount((n) => Math.max(1, n - 1))}
                      className={cn("w-10 h-10 transition-colors flex items-center justify-center font-theme text-xl",
                        isRetro ? "border border-th-primary text-th-primary hover:bg-th-primary/20 font-800" : "bg-th-screen text-th-text rounded-full shadow-neu-out hover:shadow-neu-in font-500"
                      )}>
                      −
                    </button>
                    <div className="text-center min-w-[80px]">
                      <span className={cn("font-theme leading-none", 
                        isRetro ? "font-800 text-3xl text-th-primary text-glow" : "font-700 text-3xl text-th-text"
                      )}>{freqCount}</span>
                      <p className={cn("font-theme mt-1",
                        isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs"
                      )}>
                        {copy.targetLabel}
                      </p>
                    </div>
                    <button onClick={() => setFreqCount((n) => Math.min(scheduleType === "frequency_week" ? 7 : 31, n + 1))}
                      className={cn("w-10 h-10 transition-colors flex items-center justify-center font-theme text-xl",
                        isRetro ? "border border-th-primary text-th-primary hover:bg-th-primary/20 font-800" : "bg-th-screen text-th-text rounded-full shadow-neu-out hover:shadow-neu-in font-500"
                      )}>
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div className={cn("pt-4", isRetro ? "border-t border-th-primary/20" : "")}>
                <div className="flex justify-between items-center mb-2">
                  <label className={cn("font-theme transition-colors", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest" : "text-sm font-500 text-th-text-secondary")}>
                    {copy.dataPrefix || "SUBTASKS"}
                  </label>
                  <button onClick={() => setSubtasks(s => [...s, { id: crypto.randomUUID(), title: '' }])}
                    className={cn("transition-colors font-theme", 
                      isRetro ? "text-[10px] font-700 text-th-primary hover:text-th-primary/80 uppercase tracking-widest" : "text-sm text-th-primary font-500 hover:text-th-primary-dim"
                    )}>
                    + ADD SUBTASK
                  </button>
                </div>
                
                {subtasks.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {subtasks.map((st, i) => (
                      <div key={st.id} className={cn("flex items-center gap-2", 
                        isRetro ? "border-b border-th-primary/30 bg-th-screen-light/20 p-2" : "bg-th-surface rounded-xl border border-th-surface-dark/10 shadow-neu-in p-1 pr-2"
                      )}>
                        {isRetro && <span className="text-th-primary/40 font-theme text-xs ml-1">{i+1}.</span>}
                        <input 
                          value={st.title}
                          onChange={e => setSubtasks(s => s.map(x => x.id === st.id ? { ...x, title: e.target.value } : x))}
                          placeholder="Subtask description..."
                          className={cn("flex-1 bg-transparent outline-none font-theme py-1 px-2 transition-colors",
                            isRetro ? "text-th-primary text-sm placeholder-th-primary/20 uppercase" : "text-th-text text-sm placeholder-th-text-secondary"
                          )}
                        />
                        <button onClick={() => setSubtasks(s => s.filter(x => x.id !== st.id))}
                          className={cn("p-1.5 transition-colors", 
                            isRetro ? "text-red-500/60 hover:text-red-500 hover:bg-red-500/10" : "text-th-text-secondary hover:text-red-500 hover:bg-red-50 rounded-full"
                          )}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={!isValid() || saving}
              className={cn("w-full mt-8 py-4 transition-all duration-300 font-theme disabled:opacity-40",
                isRetro 
                  ? "bg-th-primary text-th-btn-text hover:bg-th-primary/90 disabled:bg-th-primary/20 disabled:text-th-primary font-800 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--th-primary),0.4)]"
                  : "bg-th-primary text-th-btn-text rounded-xl font-700 shadow-th-raised disabled:bg-th-surface-dark"
              )}>
              {saving ? copy.savingText : copy.saveButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
