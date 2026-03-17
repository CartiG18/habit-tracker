"use client";

import { useState } from "react";
import { X, Check, Activity, TrendingUp, Archive, Edit2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { HabitWithStats } from "@/types";
import { HABIT_COLORS, cn } from "@/lib/utils";
import { useHabits } from "@/hooks/useHabits";
import EditHabitModal from "./EditHabitModal";

interface Props {
  open: boolean;
  onClose: () => void;
  habit: HabitWithStats;
  onToggle: () => void;
  selectedDate: string;
}

export default function HabitDetailModal({ open, onClose, habit, onToggle, selectedDate }: Props) {
  const { addNote, removeHabit, dateLogs } = useHabits(selectedDate);
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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        {/* Modal Bezel */}
        <div className="relative w-full max-w-lg bg-putty border-4 border-putty-dark rounded-xl shadow-mech-out p-3 animate-slide-up">
          {/* Inner CRT Screen */}
          <div className="bg-basalt crt-screen rounded-lg border-[6px] border-putty-dark shadow-bezel-inner relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="scanline-overlay"></div>
            <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
            
            <div className="flex-1 overflow-y-auto z-20 relative p-6">
              
              {/* Header */}
              <div className="border-b-2 border-amber/30 pb-4 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-basalt-light border-2 border-amber/50 flex items-center justify-center text-3xl shadow-[inset_0_0_10px_rgba(255,176,0,0.2)]">
                      <span className={habit.todayCompleted ? "grayscale opacity-50" : ""}>{habit.emoji}</span>
                    </div>
                    <div>
                      <h2 className="font-mono text-xl font-800 text-amber text-glow uppercase tracking-wide">{habit.name}</h2>
                      <p className="text-amber/60 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">SYS.DIAGNOSTIC</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditOpen(true)}
                      className="p-2 border border-amber/30 text-amber/60 hover:text-amber hover:bg-amber/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="p-2 border border-amber/30 text-amber/60 hover:text-amber hover:bg-amber/10 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Complete Button as physical-ish switch action within the screen */}
                <button
                  onClick={onToggle}
                  className={cn(
                    "w-full py-3 border-2 font-mono font-800 text-xs uppercase tracking-widest transition-all duration-200",
                    habit.todayCompleted
                      ? "bg-signal/20 text-signal border-signal shadow-[0_0_10px_rgba(50,205,50,0.4)]"
                      : "bg-basalt-light text-amber border-amber/50 hover:bg-amber/10"
                  )}
                >
                  {habit.todayCompleted ? "[ PROCESS COMPLETED ]" : "> EXECUTE_PROCESS"}
                </button>
              </div>

              {/* Data Rows */}
              <div className="space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-basalt-light/50 border border-amber/20 p-3 flex flex-col items-center">
                    <Activity className="w-4 h-4 text-amber/40 mb-1" />
                    <span className="font-mono font-800 text-amber text-lg">{habit.currentStreak}</span>
                    <p className="text-amber/50 text-[9px] font-mono uppercase tracking-widest mt-1">CUR.SEQ</p>
                  </div>
                  <div className="bg-basalt-light/50 border border-amber/20 p-3 flex flex-col items-center">
                    <TrendingUp className="w-4 h-4 text-amber/40 mb-1" />
                    <span className="font-mono font-800 text-amber text-lg">{rate}%</span>
                    <p className="text-amber/50 text-[9px] font-mono uppercase tracking-widest mt-1">SUCCESS</p>
                  </div>
                  <div className="bg-basalt-light/50 border border-amber/20 p-3 flex flex-col items-center">
                    <div className="h-4 flex items-end justify-center mb-1 text-amber/40"><span className="text-xs">MAX</span></div>
                    <span className="font-mono font-800 text-amber text-lg">{habit.longestStreak}</span>
                    <p className="text-amber/50 text-[9px] font-mono uppercase tracking-widest mt-1">MAX.SEQ</p>
                  </div>
                </div>

                {/* Oscilloscope Week */}
                <div>
                  <p className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-widest mb-2 border-b border-amber/20 pb-1">TIMELINE [7D]</p>
                  <div className="flex items-end h-16 gap-1 border-b border-amber/30 pb-1">
                    {habit.weekLogs.map((log) => (
                      <div key={log.date} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <div
                          className="w-full transition-all duration-300 relative"
                          style={{
                            height: !log.scheduled ? '4px' : log.completed ? '100%' : '15%',
                            background: !log.scheduled ? 'transparent' : log.completed ? 'var(--signal)' : 'var(--amber)',
                            border: !log.scheduled ? '1px dashed rgba(255,176,0,0.3)' : 'none',
                            boxShadow: log.completed ? '0 0 8px rgba(50,205,50,0.5)' : 'none'
                          }}
                        />
                        <span className="text-[8px] font-mono font-700 text-amber/40 uppercase">
                          {format(parseISO(log.date), "EEE")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Log Note */}
                <div>
                  <p className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-widest mb-2 border-b border-amber/20 pb-1">OPERATOR_LOG</p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="> Enter log data..."
                    rows={3}
                    className="w-full bg-basalt-light/30 border border-amber/30 p-3 text-amber font-mono text-sm outline-none focus:border-amber focus:bg-amber/5 transition-colors resize-none placeholder-amber/20"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="px-4 py-2 border border-amber/50 text-[10px] font-mono font-700 uppercase tracking-widest text-amber hover:bg-amber/20 transition-colors disabled:opacity-50"
                    >
                      {savingNote ? "TRANSMITTING..." : "SAVE_LOG"}
                    </button>
                  </div>
                </div>

                {/* Archive */}
                <div className="pt-4 border-t border-amber/20">
                  <button
                    onClick={handleArchive}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/50 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors text-[10px] font-mono font-700 uppercase tracking-widest"
                  >
                    <Archive className="w-3 h-3" />
                    DECOMMISSION_PROCESS
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
