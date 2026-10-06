"use client";

import { useState, useEffect, useRef } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { HabitWithStats } from "@/types";
import { cn, getTodayString } from "@/lib/utils";
import { useHabitsContext } from "@/hooks/useHabits";
import { useHabitHistory } from "@/hooks/useHabitHistory";
import { useTheme, useIcons } from "@/lib/theme-context";
import ModalPortal from "@/components/layout/ModalPortal";
import { useCopy } from "@/lib/copy";
import { isHabitDue, isPausedOn } from "@/lib/schedule";
import EditHabitModal from "./EditHabitModal";
import HabitHistory from "./HabitHistory";

interface Props {
  open: boolean;
  onClose: () => void;
  habit: HabitWithStats;
  onToggle: () => void;
  selectedDate: string;
}

export default function HabitDetailModal({ open, onClose, habit, selectedDate }: Props) {
  const { addNote, toggle, toggleSubtask, skip, logValue, removeHabit, pause, resume, deleteForever, dateLogs } = useHabitsContext();
  const { logs: history } = useHabitHistory(open ? habit.id : null);
  const { isRetro, def } = useTheme();
  // Themes can turn off per-habit emoji + color (e.g. Foundation). Data is untouched.
  const showDecor = def.habitDecor !== false;
  const copy = useCopy();
  const Icons = useIcons();
  const today = getTodayString();

  // ─── Focus day: the day every action below applies to ─────────────────────
  // Starts on the dashboard's selected day; tapping the history heatmap moves it
  // (that's how past days are backfilled, skipped or annotated).
  const [focusDate, setFocusDate] = useState(selectedDate);
  const focusLog = history.get(focusDate) ?? (focusDate === selectedDate ? dateLogs.get(habit.id) : undefined);
  const focusCompleted = !!focusLog?.completed;
  const focusSkipped = !!focusLog?.skipped && !focusCompleted;
  const focusValue = focusLog?.value ?? 0;
  const completedSubtasks = focusLog?.completedSubtasks || [];
  const focusDue = isHabitDue(habit, parseISO(focusDate));

  const savedNote = focusLog?.note ?? "";
  const [note, setNote] = useState(savedNote);
  const [noteDirty, setNoteDirty] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [resumeOn, setResumeOn] = useState("");
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show the focus day's saved note (and remote updates) unless the user is mid-edit
  useEffect(() => {
    if (!noteDirty) setNote(savedNote);
  }, [savedNote, noteDirty]);

  // Moving the focus discards an unsaved draft for the previous day
  useEffect(() => {
    setNoteDirty(false);
  }, [focusDate]);

  useEffect(() => () => clearTimeout(confirmTimer.current), []);

  if (!open) return null;

  const pausedNow = isPausedOn(habit, today);
  const challenge = habit.startDate && habit.endDate
    ? { n: Math.min(Math.max(differenceInCalendarDays(parseISO(today), parseISO(habit.startDate)) + 1, 0), differenceInCalendarDays(parseISO(habit.endDate), parseISO(habit.startDate)) + 1), total: differenceInCalendarDays(parseISO(habit.endDate), parseISO(habit.startDate)) + 1 }
    : null;

  const focusLabel = focusDate === today ? copy.dateLabelCurrent.replace("{date}", format(parseISO(focusDate), "EEEE, MMM d")) : format(parseISO(focusDate), isRetro ? "yyyy.MM.dd" : "EEE, MMM d");
  const focusStatus = focusCompleted ? copy.statusDone
    : focusSkipped ? copy.skippedLabel
    : !focusDue ? copy.statusInactive
    : focusDate < today ? copy.statusMissed
    : copy.statusOpen;

  async function handleSaveNote() {
    setSavingNote(true);
    const ok = await addNote(habit.id, note, focusDate);
    setSavingNote(false);
    if (ok) setNoteDirty(false);
  }

  async function handleArchive() {
    const ok = await removeHabit(habit.id);
    if (ok) onClose();
  }

  // Permanent delete is two-tap: first tap arms the button for 3s
  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    clearTimeout(confirmTimer.current);
    const ok = await deleteForever(habit.id);
    if (ok) onClose();
    else setConfirmDelete(false);
  }

  async function handlePause() {
    const ok = await pause(habit.id, today, resumeOn || undefined);
    if (ok) onClose();
  }

  // ─── Shared styles (match the rest of the modal) ───────────────────────────
  const labelCls = cn("font-theme block mb-2", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest border-b border-th-primary/20 pb-1" : "th-label text-sm font-500 text-th-text-secondary");
  const ghostBtn = cn("flex items-center justify-center gap-2 py-2.5 transition-colors font-theme",
    isRetro ? "border border-th-primary/30 text-th-primary/70 hover:text-th-primary hover:bg-th-primary/10 text-[10px] font-700 uppercase tracking-widest"
            : "rounded-xl text-sm font-500 text-th-text-secondary bg-th-surface hover:text-th-text");
  const roundBtn = cn("w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0",
    isRetro ? "border border-th-primary text-th-primary hover:bg-th-primary/20" : "bg-th-screen text-th-text rounded-full shadow-neu-out hover:shadow-neu-in");

  return (
    <ModalPortal>
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
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
            "relative overflow-hidden flex flex-col max-h-modal",
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

            <div className={cn("flex-1 overflow-y-auto overscroll-contain z-20 relative", isRetro ? "p-6" : "p-8")}>

              {/* Header */}
              <div className={cn("pb-4 mb-6", isRetro ? "border-b-2 border-th-primary/30" : "")}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4 min-w-0">
                    {showDecor && (
                      <div className={cn("flex items-center justify-center text-3xl flex-shrink-0",
                        isRetro
                          ? "w-14 h-14 bg-th-screen-light border-2 border-th-primary/50 shadow-[inset_0_0_10px_rgb(var(--th-primary)/0.2)]"
                          : "w-16 h-16 rounded-2xl bg-th-surface shadow-neu-in text-4xl"
                      )}>
                        <span className={cn(focusCompleted && isRetro && "grayscale opacity-50")}>{habit.emoji}</span>
                      </div>
                    )}
                    <div className="pt-1 min-w-0">
                      <h2 className={cn("font-theme text-xl transition-colors",
                        isRetro ? "font-800 text-th-primary text-glow uppercase tracking-wide" : "font-700 text-th-text text-2xl"
                      )}>
                        {habit.name}
                      </h2>
                      <p className={cn("font-theme transition-colors mt-1",
                        isRetro ? "text-th-primary/60 text-[10px] uppercase tracking-[0.2em]" : "text-th-text-secondary text-sm"
                      )}>
                        {pausedNow
                          ? `${copy.pausedSection} · ${habit.pausedUntil ? copy.pausedUntil.replace("{date}", format(parseISO(habit.pausedUntil), "MMM d")) : copy.pausedIndefinitely}`
                          : challenge
                          ? copy.challengeProgress.replace("{n}", String(challenge.n)).replace("{total}", String(challenge.total))
                          : copy.detailSubtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditOpen(true)}
                      aria-label={copy.editHabitTitle}
                      className={cn("p-2 transition-colors",
                        isRetro
                          ? "border border-th-primary/30 text-th-primary/60 hover:text-th-primary hover:bg-th-primary/10"
                          : "bg-th-surface-light text-th-text-secondary hover:text-th-text rounded-full hover:bg-th-surface-dark/20"
                      )}
                    >
                      <Icons.edit className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} aria-label="Close" className={cn("p-2 transition-colors",
                      isRetro
                        ? "border border-th-primary/30 text-th-primary/60 hover:text-th-primary hover:bg-th-primary/10"
                        : "bg-th-surface-light text-th-text-secondary hover:text-th-text rounded-full hover:bg-th-surface-dark/20"
                    )}>
                      <Icons.close className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Focus day + its status */}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("th-date font-theme", isRetro ? "text-th-primary/70 text-[10px] uppercase tracking-widest" : "text-th-text text-sm font-500")}>
                    {focusLabel}
                  </span>
                  <span className={cn("font-theme", isRetro ? "text-th-primary/50 text-[10px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>
                    {focusStatus}
                  </span>
                </div>

                {/* Measurable: log an amount */}
                {habit.measure && (
                  <div className={cn("flex items-center justify-between gap-4 mb-3", isRetro ? "bg-th-screen-light/30 p-3 border border-th-primary/30" : "bg-th-surface p-3 rounded-xl")}>
                    <button onClick={() => logValue(habit, focusValue - (habit.measure!.step || 1), focusDate, focusValue)} disabled={focusValue <= 0} className={cn(roundBtn, "disabled:opacity-30")} aria-label="−">
                      <Icons.decrement className="w-4 h-4" />
                    </button>
                    <div className="text-center min-w-0">
                      <span className={cn("th-stat font-theme leading-none tabular-nums", isRetro ? "font-800 text-2xl text-th-primary text-glow" : "font-700 text-2xl text-th-text")}>
                        {focusValue}<span className={cn(isRetro ? "text-th-primary/50" : "text-th-text-secondary")}> / {habit.measure.target}</span>
                      </span>
                      <p className={cn("font-theme mt-1 truncate", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>
                        {habit.measure.unit || copy.logValueLabel}
                      </p>
                    </div>
                    <button onClick={() => logValue(habit, focusValue + (habit.measure!.step || 1), focusDate, focusValue)} className={roundBtn} aria-label="+">
                      <Icons.increment className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Complete / undo for the focus day */}
                <button
                  onClick={() => toggle(habit, focusDate)}
                  className={cn(
                    "th-btn-primary w-full py-3 font-theme transition-all duration-200 mt-2",
                    isRetro
                      ? [
                          "border-2 font-800 text-xs uppercase tracking-widest",
                          focusCompleted
                            ? "bg-th-success/20 text-th-success border-th-success shadow-[0_0_10px_rgb(var(--th-success)/0.4)]"
                            : "bg-th-screen-light text-th-primary border-th-primary/50 hover:bg-th-primary/10"
                        ]
                      : [
                          "rounded-xl font-700 text-sm",
                          focusCompleted
                            ? "bg-th-success text-th-btn-text shadow-th-raised"
                            : "bg-th-surface-light text-th-text-secondary hover:bg-th-surface border border-th-surface-dark/20"
                        ]
                  )}
                >
                  {focusCompleted ? copy.completedButton : copy.executeButton}
                </button>

                {/* Rest day */}
                {!focusCompleted && (
                  <button onClick={() => skip(habit, !focusSkipped, focusDate)} className={cn(ghostBtn, "th-ghost w-full mt-2")}>
                    <Icons.skip className="w-4 h-4" />
                    {focusSkipped ? copy.unskipButton : copy.skipButton}
                  </button>
                )}
              </div>

              {/* Data Rows */}
              <div className="space-y-6">

                {/* Subtasks */}
                {habit.subtasks && habit.subtasks.length > 0 && (
                  <div>
                    <p className={labelCls}>{copy.subtasksLabel}</p>
                    <div className={cn("flex flex-col gap-2 mt-2",
                      isRetro ? "bg-th-screen-light/30 p-2 border border-th-primary/20" : "bg-th-surface p-2 rounded-xl"
                    )}>
                      {habit.subtasks.map(st => {
                        const isDone = completedSubtasks.includes(st.id);
                        return (
                          <div
                            key={st.id}
                            onClick={() => toggleSubtask(habit, st.id, focusDate)}
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
                                ? ["border-2 rounded-sm", isDone ? "bg-th-primary border-th-primary shadow-[0_0_5px_rgb(var(--th-primary)/0.6)]" : "border-th-primary/50"]
                                : ["border-2 rounded-full", isDone ? "bg-th-success border-th-success" : "border-th-surface-dark/30"]
                            )}>
                              {isDone && <Icons.check className={cn("w-3 h-3", isRetro ? "text-th-btn-text" : "text-white")} strokeWidth={4} />}
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
                  {[
                    { Icon: Icons.streak, value: habit.currentStreak, label: copy.streakLabel },
                    { Icon: Icons.rate, value: `${Math.round(habit.completionRate * 100)}%`, label: copy.successLabel },
                    { Icon: Icons.best, value: habit.longestStreak, label: copy.maxStreakLabel },
                  ].map(({ Icon, value, label }) => (
                    <div key={label} className={cn("flex flex-col items-center justify-center p-3 transition-colors",
                      isRetro ? "bg-th-screen-light/50 border border-th-primary/20" : "bg-th-surface rounded-2xl shadow-neu-in"
                    )}>
                      <Icon className={cn("w-4 h-4 mb-1", isRetro ? "text-th-primary/40" : "text-th-primary")} />
                      <span className={cn("th-stat font-theme font-800 text-lg", isRetro ? "text-th-primary" : "text-th-text")}>{value}</span>
                      <p className={cn("font-theme mt-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* History */}
                <div>
                  <p className={cn(labelCls, "flex items-center gap-2")}>
                    <Icons.history className="w-4 h-4" /> {copy.historyLabel}
                  </p>
                  <HabitHistory habit={habit} logs={history} focusDate={focusDate} onSelect={setFocusDate} />
                </div>

                {/* Note for the focus day */}
                <div>
                  <p className={labelCls}>
                    {copy.noteLabel}
                    <span className={cn("ml-2 normal-case tracking-normal", isRetro ? "text-th-primary/40" : "text-th-text-secondary/80")}>· {focusLabel}</span>
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => { setNote(e.target.value); setNoteDirty(true); }}
                    placeholder={copy.notePlaceholder}
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
                          : "th-btn-primary px-5 py-2 bg-th-primary text-th-btn-text rounded-lg text-sm font-500 shadow-th-raised"
                      )}
                    >
                      {savingNote ? copy.savingNoteText : copy.saveNoteButton}
                    </button>
                  </div>
                </div>

                {/* Habit actions: pause / archive / delete */}
                <div className={cn("pt-4 space-y-2", isRetro ? "border-t border-th-primary/20" : "")}>
                  {pausedNow ? (
                    <button onClick={async () => { if (await resume(habit.id)) onClose(); }} className={cn(ghostBtn, "w-full")}>
                      <Icons.resume className="w-4 h-4" /> {copy.resumeButton}
                    </button>
                  ) : pauseOpen ? (
                    <div className={cn("p-3 space-y-3", isRetro ? "border border-th-primary/30 bg-th-screen-light/30" : "bg-th-surface rounded-xl")}>
                      <label className="block">
                        <span className={cn("font-theme block mb-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{copy.pauseUntilLabel}</span>
                        <div className={cn("flex items-center", isRetro ? "border-b-2 border-th-primary/50 bg-th-screen-light/30" : "bg-th-screen rounded-xl border border-th-surface-dark/20 shadow-neu-in px-3")}>
                          <input type="date" value={resumeOn} min={today} onChange={(e) => setResumeOn(e.target.value)}
                            className={cn("w-full py-2.5 font-theme text-base outline-none bg-transparent", isRetro ? "text-th-primary px-2" : "text-th-text")} />
                        </div>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setPauseOpen(false)} className={ghostBtn}>{copy.cancelButton}</button>
                        <button onClick={handlePause} className={cn(ghostBtn, isRetro ? "border-th-primary text-th-primary" : "bg-th-primary text-th-btn-text hover:text-th-btn-text")}>
                          <Icons.pause className="w-4 h-4" /> {copy.pauseConfirm}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setPauseOpen(true)} className={cn(ghostBtn, "w-full")}>
                      <Icons.pause className="w-4 h-4" /> {copy.pauseButton}
                    </button>
                  )}

                  <button onClick={handleArchive} className={cn(ghostBtn, "w-full")}>
                    <Icons.archive className="w-4 h-4" /> {copy.archiveButton}
                  </button>

                  <button
                    onClick={handleDelete}
                    className={cn("w-full flex items-center justify-center gap-2 py-3 transition-colors font-theme",
                      isRetro
                        ? ["border text-[10px] font-700 uppercase tracking-widest", confirmDelete ? "border-th-danger bg-th-danger/20 text-th-danger" : "border-th-danger/50 text-th-danger/60 hover:text-th-danger hover:bg-th-danger/10"]
                        : ["text-sm font-500 rounded-xl", confirmDelete ? "bg-th-danger text-white" : "text-th-danger hover:bg-red-50"]
                    )}
                  >
                    <Icons.delete className="w-4 h-4" />
                    {confirmDelete ? copy.deleteConfirm : copy.deleteButton}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mounted only while open so the form always starts from the latest habit */}
      {editOpen && (
        <EditHabitModal
          open
          onClose={() => setEditOpen(false)}
          habit={habit}
        />
      )}
    </>
    </ModalPortal>
  );
}
