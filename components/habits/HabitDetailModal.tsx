"use client";

import { useState } from "react";
import { X, Activity, TrendingUp, Archive, Edit2, Target, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { HabitWithStats } from "@/types";
import { HABIT_COLORS, cn } from "@/lib/utils";
import { useHabits } from "@/hooks/useHabits";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import EditHabitModal from "./EditHabitModal";

interface Props {
  open: boolean;
  onClose: () => void;
  habit: HabitWithStats;
  onToggle: () => void;
  selectedDate: string;
}

export default function HabitDetailModal({ open, onClose, habit, onToggle, selectedDate }: Props) {
  const { addNote, removeHabit, dateLogs, toggleSubtask } = useHabits(selectedDate);
  const currentLog = dateLogs.get(habit.id);
  const completedSubtasks = currentLog?.completedSubtasks || [];
  const { isRetro } = useTheme();
  const copy = useCopy();
  
  const [note, setNote] = useState(dateLogs.get(habit.id)?.note ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modal Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

        {/* Modal Shell */}
        <div className={cn(
          "relative w-full max-w-lg transition-all animate-slide-up",
          isRetro 
            ? "bg-th-surface border-4 border-th-surface-dark rounded-xl shadow-mech-out p-3"
            : "bg-th-screen border border-th-surface-dark/20 rounded-3xl shadow-neu-out p-1"
        )}>
          {/* Inner Content Area */}
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
              <div className={cn("pb-4 mb-6", isRetro ? "border-b-2 border-th-primary/30" : "")}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className={cn("flex items-center justify-center text-3xl",
                      isRetro 
                        ? "w-14 h-14 bg-th-screen-light border-2 border-th-primary/50 shadow-[inset_0_0_10px_rgba(var(--th-primary),0.2)]"
                        : "w-16 h-16 rounded-2xl bg-th-surface shadow-neu-in text-4xl"
                    )}>
                      <span className={cn(habit.todayCompleted && isRetro && "grayscale opacity-50")}>{habit.emoji}</span>
                    </div>
                    <div className="pt-1">
                      <h2 className={cn("font-theme text-xl transition-colors",
                        isRetro ? "font-800 text-th-primary text-glow uppercase tracking-wide" : "font-700 text-th-text text-2xl"
                      )}>
                        {habit.name}
                      </h2>
                      <p className={cn("font-theme transition-colors mt-1",
                        isRetro ? "text-th-primary/60 text-[10px] uppercase tracking-[0.2em]" : "text-th-text-secondary text-sm"
                      )}>
                        {copy.detailSubtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditOpen(true)}
                      className={cn("p-2 transition-colors",
                        isRetro 
                          ? "border border-th-primary/30 text-th-primary/60 hover:text-th-primary hover:bg-th-primary/10"
                          : "bg-th-surface-light text-th-text-secondary hover:text-th-text rounded-full hover:bg-th-surface-dark/20"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className={cn("p-2 transition-colors",
                      isRetro 
                        ? "border border-th-primary/30 text-th-primary/60 hover:text-th-primary hover:bg-th-primary/10"
                        : "bg-th-surface-light text-th-text-secondary hover:text-th-text rounded-full hover:bg-th-surface-dark/20"
                    )}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Complete Button */}
                <button
                  onClick={onToggle}
                  className={cn(
                    "w-full py-3 font-theme transition-all duration-200 mt-2",
                    isRetro
                      ? [
                          "border-2 font-800 text-xs uppercase tracking-widest",
                          habit.todayCompleted
                            ? "bg-th-success/20 text-th-success border-th-success shadow-[0_0_10px_rgba(var(--th-success),0.4)]"
                            : "bg-th-screen-light text-th-primary border-th-primary/50 hover:bg-th-primary/10"
                        ]
                      : [
                          "rounded-xl font-700 text-sm",
                          habit.todayCompleted
                            ? "bg-th-success text-th-btn-text shadow-th-raised"
                            : "bg-th-surface-light text-th-text-secondary hover:bg-th-surface border border-th-surface-dark/20"
                        ]
                  )}
                >
                  {habit.todayCompleted ? copy.completedButton : copy.executeButton}
                </button>
              </div>

              {/* Data Rows */}
              <div className="space-y-6">
                
                {/* Subtasks */}
                {habit.subtasks && habit.subtasks.length > 0 && (
                  <div>
                    <p className={cn("font-theme block mb-2", 
                      isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest border-b border-th-primary/20 pb-1" : "text-sm font-500 text-th-text-secondary"
                    )}>
                      {copy.dataPrefix || "SUBTASKS"}
                    </p>
                    <div className={cn("flex flex-col gap-2 mt-2", 
                      isRetro ? "bg-th-screen-light/30 p-2 border border-th-primary/20" : "bg-th-surface p-2 rounded-xl"
                    )}>
                      {habit.subtasks.map(st => {
                        const isDone = completedSubtasks.includes(st.id);
                        return (
                          <div 
                            key={st.id}
                            onClick={() => toggleSubtask(habit, st.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                              isRetro 
                                ? "border border-th-primary/30 hover:border-th-primary/60 hover:bg-th-primary/5"
                                : "rounded-lg hover:bg-th-surface-dark/10"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors",
                              isRetro
                                ? ["border-2 rounded-sm", isDone ? "bg-th-primary border-th-primary shadow-[0_0_5px_rgba(var(--th-primary),0.6)]" : "border-th-primary/50"]
                                : ["border-2 rounded-full", isDone ? "bg-th-success border-th-success" : "border-th-surface-dark/30"]
                            )}>
                              {isDone && <Check className={cn("w-3 h-3", isRetro ? "text-th-btn-text" : "text-white")} strokeWidth={4} />}
                            </div>
                            <span className={cn(
                              "font-theme text-sm",
                              isRetro 
                                ? ["uppercase tracking-wider", isDone ? "text-th-primary/50 line-through" : "text-th-primary text-glow"]
                                : [isDone ? "text-th-text-secondary line-through" : "text-th-text"]
                            )}>
                              {st.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={cn("flex flex-col items-center justify-center p-3 transition-colors",
                    isRetro ? "bg-th-screen-light/50 border border-th-primary/20" : "bg-th-surface rounded-2xl shadow-neu-in"
                  )}>
                    <Activity className={cn("w-4 h-4 mb-1", isRetro ? "text-th-primary/40" : "text-th-primary")} />
                    <span className={cn("font-theme font-800 text-lg", isRetro ? "text-th-primary" : "text-th-text")}>{habit.currentStreak}</span>
                    <p className={cn("font-theme mt-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{copy.streakLabel}</p>
                  </div>
                  <div className={cn("flex flex-col items-center justify-center p-3 transition-colors",
                    isRetro ? "bg-th-screen-light/50 border border-th-primary/20" : "bg-th-surface rounded-2xl shadow-neu-in"
                  )}>
                    <TrendingUp className={cn("w-4 h-4 mb-1", isRetro ? "text-th-primary/40" : "text-th-primary")} />
                    <span className={cn("font-theme font-800 text-lg", isRetro ? "text-th-primary" : "text-th-text")}>{rate}%</span>
                    <p className={cn("font-theme mt-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{copy.successLabel}</p>
                  </div>
                  <div className={cn("flex flex-col items-center justify-center p-3 transition-colors",
                    isRetro ? "bg-th-screen-light/50 border border-th-primary/20" : "bg-th-surface rounded-2xl shadow-neu-in"
                  )}>
                    <Target className={cn("w-4 h-4 mb-1", isRetro ? "text-th-primary/40" : "text-th-primary")} />
                    <span className={cn("font-theme font-800 text-lg", isRetro ? "text-th-primary" : "text-th-text")}>{habit.longestStreak}</span>
                    <p className={cn("font-theme mt-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{copy.maxStreakLabel}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className={cn("font-theme block mb-2", 
                    isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest border-b border-th-primary/20 pb-1" : "text-sm font-500 text-th-text-secondary"
                  )}>
                    {copy.timelineLabel}
                  </p>
                  <div className={cn("flex items-end h-16 gap-1 pb-1", isRetro ? "border-b border-th-primary/30" : "")}>
                    {habit.weekLogs.map((log) => (
                      <div key={log.date} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <div
                          className={cn("w-full transition-all duration-300 relative", isRetro ? "" : "rounded-t-sm")}
                          style={{
                            height: !log.scheduled ? (isRetro ? '4px' : '0px') : log.completed ? '100%' : '15%',
                            background: !log.scheduled 
                              ? 'transparent' 
                              : log.completed 
                                ? 'rgb(var(--th-success))' 
                                : isRetro ? 'rgb(var(--th-primary))' : 'rgba(var(--th-primary), 0.3)',
                            border: !log.scheduled && isRetro ? '1px dashed rgba(var(--th-primary),0.3)' : 'none',
                            boxShadow: log.completed && isRetro ? '0 0 8px rgba(var(--th-success),0.5)' : 'none'
                          }}
                        />
                        <span className={cn("font-theme font-700 uppercase text-[8px]",
                          isRetro ? "text-th-primary/40" : "text-th-text-secondary"
                        )}>
                          {format(parseISO(log.date), "EEE")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Log Note */}
                <div>
                  <p className={cn("font-theme block mb-2", 
                    isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest border-b border-th-primary/20 pb-1" : "text-sm font-500 text-th-text-secondary"
                  )}>
                    {copy.noteLabel}
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={isRetro ? "> ENTER LOG DATA..." : "Write a note..."}
                    rows={3}
                    className={cn("w-full p-3 font-theme text-sm outline-none transition-colors resize-none",
                      isRetro 
                        ? "bg-th-screen-light/30 border border-th-primary/30 text-th-primary focus:border-th-primary focus:bg-th-primary/5 placeholder-th-primary/20"
                        : "bg-th-surface rounded-xl border border-th-surface-dark/20 text-th-text shadow-neu-in placeholder-th-text-secondary"
                    )}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className={cn("transition-colors disabled:opacity-50 font-theme",
                        isRetro 
                          ? "px-4 py-2 border border-th-primary/50 text-[10px] font-700 uppercase tracking-widest text-th-primary hover:bg-th-primary/20"
                          : "px-5 py-2 bg-th-primary text-th-btn-text rounded-lg text-sm font-500 shadow-th-raised"
                      )}
                    >
                      {savingNote ? copy.savingNoteText : copy.saveNoteButton}
                    </button>
                  </div>
                </div>

                {/* Archive */}
                <div className={cn("pt-4", isRetro ? "border-t border-th-primary/20" : "")}>
                  <button
                    onClick={handleArchive}
                    className={cn("w-full flex items-center justify-center gap-2 py-3 transition-colors font-theme",
                      isRetro 
                        ? "border border-red-500/50 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 text-[10px] font-700 uppercase tracking-widest"
                        : "text-red-500 hover:bg-red-50 text-sm font-500 rounded-xl"
                    )}
                  >
                    <Archive className="w-4 h-4" />
                    {copy.deleteButton}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <EditHabitModal 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        habit={habit} 
      />
    </>
  );
}
