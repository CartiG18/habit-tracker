"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getHabitWithStats,
  toggleHabitLog,
  createHabit,
  updateHabit,
  archiveHabit,
  restoreHabit,
  pauseHabit,
  resumeHabit,
  deleteHabit,
  reorderHabits,
  setHabitSkipped,
  logHabitValue,
  updateHabitNote,
  toggleSubtaskLog,
} from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitWithStats, HabitLog } from "@/types";
import { getTodayString } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCopy } from "@/lib/copy";
import { emitHabitComplete } from "@/lib/themes/events";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Completion state of `habit` on the selected date, ignoring ids of deleted subtasks. */
function statusFor(habit: Habit, log: HabitLog | undefined) {
  const valid = new Set(habit.subtasks?.map((s) => s.id) ?? []);
  return {
    todayCompleted: log?.completed ?? false,
    todaySkipped: !!log?.skipped,
    todayValue: log?.value ?? 0,
    todayCompletedSubtasks: (log?.completedSubtasks ?? []).filter((id) => valid.has(id)),
  };
}

/** The fields of HabitWithStats derived from history (not from the selected day). */
function statsOf(h: HabitWithStats) {
  return {
    currentStreak: h.currentStreak,
    longestStreak: h.longestStreak,
    completionRate: h.completionRate,
    weekLogs: h.weekLogs,
    periodCompletions: h.periodCompletions,
    periodTarget: h.periodTarget,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHabits(selectedDate: string = getTodayString()) {
  const { user } = useAuth();
  const copy = useCopy();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [archived, setArchived] = useState<Habit[]>([]);
  const [dateLogs, setDateLogs] = useState<Map<string, HabitLog>>(new Map());
  const [loading, setLoading] = useState(true);

  // Latest logs for the selected date (null until the first snapshot arrives)
  const logsRef = useRef<Map<string, HabitLog> | null>(null);

  // Real-time habits listener (enriched with stats)
  useEffect(() => {
    if (!user) { setHabits([]); setLoading(false); return; }
    let latest = 0;
    const q = query(collection(db, "habits"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const run = ++latest;
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Habit));
        setArchived(all.filter((h) => h.archivedAt).sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? "")));
        const rawHabits = all.filter((h) => !h.archivedAt).sort((a, b) => a.order - b.order);
        try {
          const enriched = await Promise.all(rawHabits.map((h) => getHabitWithStats(user.uid, h)));
          if (run !== latest) return; // a newer snapshot superseded this one

          setHabits((prev) => {
            const prevById = new Map(prev.map((h) => [h.id, h]));
            return enriched.map((h) => {
              // Selected-day status comes from the logs listener once it has data;
              // before that, keep what we showed (or getHabitWithStats' today status).
              if (logsRef.current) return { ...h, ...statusFor(h, logsRef.current.get(h.id)) };
              const existing = prevById.get(h.id);
              if (existing) return { ...h, todayCompleted: existing.todayCompleted, todaySkipped: existing.todaySkipped, todayValue: existing.todayValue, todayCompletedSubtasks: existing.todayCompletedSubtasks };
              return selectedDate === getTodayString() ? h : { ...h, ...statusFor(h, undefined) };
            });
          });
        } catch (err: any) {
          console.error("Habit stats error:", err);
          toast.error(err.message ?? copy.toastSaveFailed);
        } finally {
          if (run === latest) setLoading(false);
        }
      },
      (err) => {
        console.error("Habits listener error:", err);
        toast.error(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
    // copy/selectedDate are only read for fallbacks; resubscribing on them would refetch every habit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Real-time logs listener for the SELECTED date
  useEffect(() => {
    if (!user) return;
    logsRef.current = null;
    const q = query(
      collection(db, "habitLogs"),
      where("userId", "==", user.uid),
      where("date", "==", selectedDate)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logMap = new Map<string, HabitLog>();
        snapshot.docs.forEach((d) => {
          const log = { id: d.id, ...d.data() } as HabitLog;
          logMap.set(log.habitId, log);
        });
        logsRef.current = logMap;
        setDateLogs(logMap);
        setHabits((prev) => prev.map((h) => ({ ...h, ...statusFor(h, logMap.get(h.id)) })));
      },
      (err) => {
        console.error("Logs listener error:", err);
        toast.error(err.message);
      }
    );
    return unsubscribe;
  }, [user, selectedDate]);

  /** Recompute streaks / week dots / rates for one habit after its logs change. */
  const refreshStats = useCallback(async (habit: Habit) => {
    if (!user) return;
    try {
      const fresh = await getHabitWithStats(user.uid, habit);
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, ...statsOf(fresh) } : h)));
    } catch (err: any) {
      console.error("Refresh stats error:", err);
    }
  }, [user]);

  const toggle = useCallback(async (habit: Habit, date: string = selectedDate) => {
    if (!user) return;
    try {
      const log = await toggleHabitLog(user.uid, habit, date);
      if (log.completed) emitHabitComplete();
      refreshStats(habit);
    } catch (err: any) {
      console.error("Toggle error:", err);
      toast.error(err.message ?? copy.toastSaveFailed);
    }
  }, [user, selectedDate, refreshStats, copy]);

  const toggleSubtask = useCallback(async (habit: Habit, subtaskId: string, date: string = selectedDate) => {
    if (!user) return;
    try {
      const log = await toggleSubtaskLog(user.uid, habit, date, subtaskId);
      if (log.completed) emitHabitComplete();
      refreshStats(habit);
    } catch (err: any) {
      console.error("Toggle subtask error:", err);
      toast.error(err.message ?? copy.toastSaveFailed);
    }
  }, [user, selectedDate, refreshStats, copy]);

  /** Mark / unmark a rest day. */
  const skip = useCallback(async (habit: Habit, skipped: boolean, date: string = selectedDate) => {
    if (!user) return;
    try {
      await setHabitSkipped(user.uid, habit, date, skipped);
      refreshStats(habit);
    } catch (err: any) {
      console.error("Skip error:", err);
      toast.error(copy.toastSaveFailed);
    }
  }, [user, selectedDate, refreshStats, copy]);

  /** Set a measurable habit's logged amount (celebrates when it reaches the target). */
  const logValue = useCallback(async (habit: Habit, value: number, date: string = selectedDate, previous = 0) => {
    if (!user) return;
    try {
      const log = await logHabitValue(user.uid, habit, date, value);
      // Celebrate only when this change crosses the target
      if (log.completed && habit.measure && previous < habit.measure.target) emitHabitComplete();
      refreshStats(habit);
    } catch (err: any) {
      console.error("Log value error:", err);
      toast.error(copy.toastSaveFailed);
    }
  }, [user, selectedDate, refreshStats, copy]);

  // The actions below resolve to `true` on success so callers know whether to close.

  const addNote = useCallback(async (habitId: string, note: string, date: string = selectedDate) => {
    if (!user) return false;
    try {
      await updateHabitNote(user.uid, habitId, date, note);
      return true;
    } catch (err: any) {
      console.error("Save note error:", err);
      toast.error(copy.toastSaveFailed);
      return false;
    }
  }, [user, selectedDate, copy]);

  const addHabit = useCallback(async (data: Omit<Habit, "id" | "userId" | "createdAt" | "order">) => {
    if (!user) return false;
    try {
      await createHabit(user.uid, data);
      toast.success(copy.toastCreated);
      return true;
    } catch (err: any) {
      console.error("Create habit error:", err);
      toast.error(copy.toastSaveFailed);
      return false;
    }
  }, [user, copy]);

  const editHabit = useCallback(async (habitId: string, data: Partial<Habit>) => {
    try {
      await updateHabit(habitId, data);
      toast.success(copy.toastUpdated);
      return true;
    } catch (err: any) {
      console.error("Update habit error:", err);
      toast.error(copy.toastSaveFailed);
      return false;
    }
  }, [copy]);

  /** Run a habit-level action with the standard toast + boolean result. */
  const run = useCallback(async (action: () => Promise<void>, successMsg: string | null, label: string) => {
    try {
      await action();
      if (successMsg) toast.success(successMsg);
      return true;
    } catch (err: any) {
      console.error(`${label} error:`, err);
      toast.error(copy.toastSaveFailed);
      return false;
    }
  }, [copy]);

  /** Archive: hidden from the app, history kept, restorable from Settings. */
  const removeHabit = useCallback((habitId: string) => run(() => archiveHabit(habitId), copy.toastArchived, "Archive habit"), [run, copy]);
  const restore = useCallback((habitId: string) => run(() => restoreHabit(habitId), copy.toastRestored, "Restore habit"), [run, copy]);
  const pause = useCallback((habitId: string, from: string, until?: string) => run(() => pauseHabit(habitId, from, until), copy.toastPaused, "Pause habit"), [run, copy]);
  const resume = useCallback((habitId: string) => run(() => resumeHabit(habitId), copy.toastResumed, "Resume habit"), [run, copy]);
  /** Permanent: deletes the habit and every log. */
  const deleteForever = useCallback((habitId: string) => {
    if (!user) return Promise.resolve(false);
    return run(() => deleteHabit(user.uid, habitId), copy.toastDeleted, "Delete habit");
  }, [run, user, copy]);

  /** Persist a manual order (optimistic: the list reorders immediately). */
  const reorder = useCallback(async (ids: string[]) => {
    setHabits((prev) => {
      const byId = new Map(prev.map((h) => [h.id, h]));
      const moved = ids.map((id, i) => ({ ...byId.get(id)!, order: i })).filter((h) => h.id);
      const rest = prev.filter((h) => !ids.includes(h.id));
      return [...moved, ...rest];
    });
    return run(() => reorderHabits(ids), null, "Reorder habits");
  }, [run]);

  return {
    habits, archived, dateLogs, loading,
    toggle, toggleSubtask, skip, logValue, addNote,
    addHabit, editHabit, removeHabit, restore, pause, resume, deleteForever, reorder,
  };
}

// ─── Shared Instance ──────────────────────────────────────────────────────────
// The dashboard runs ONE useHabits() and shares it with its cards and modals,
// instead of each modal opening its own Firestore listeners and stats queries.

export type HabitsState = ReturnType<typeof useHabits>;

export const HabitsContext = createContext<HabitsState | null>(null);

export function useHabitsContext(): HabitsState {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabitsContext must be used inside <HabitsContext.Provider>");
  return ctx;
}
