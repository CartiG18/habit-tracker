"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getHabitWithStats,
  toggleHabitLog,
  createHabit,
  updateHabit,
  archiveHabit,
  updateHabitNote,
  toggleSubtaskLog,
} from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitWithStats, HabitLog } from "@/types";
import { getTodayString } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCopy } from "@/lib/copy";

export function useHabits(selectedDate: string = getTodayString()) {
  const { user } = useAuth();
  const copy = useCopy();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [dateLogs, setDateLogs] = useState<Map<string, HabitLog>>(new Map());
  const [loading, setLoading] = useState(true);

  // Real-time habits listener (Enriched with stats)
  useEffect(() => {
    if (!user) { setHabits([]); setLoading(false); return; }
    const q = query(collection(db, "habits"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawHabits = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Habit))
        .filter((h) => !h.archivedAt)
        .sort((a, b) => a.order - b.order);
      const enriched = await Promise.all(rawHabits.map((h) => getHabitWithStats(user.uid, h)));

      setHabits((prev) => {
        // Create a map of existing completion statuses from the previous state
        // to avoid "jumping" when habits list refreshes but logs haven't yet
        const logMap = new Map(prev.map(h => [h.id, { todayCompleted: h.todayCompleted, todayCompletedSubtasks: h.todayCompletedSubtasks }]));
        
        return enriched.map(h => {
          const existing = logMap.get(h.id);
          return {
            ...h,
            todayCompleted: existing ? existing.todayCompleted : h.todayCompleted,
            todayCompletedSubtasks: existing ? existing.todayCompletedSubtasks : h.todayCompletedSubtasks
          };
        });
      });
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  // Real-time logs listener for the SELECTED date
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "habitLogs"),
      where("userId", "==", user.uid),
      where("date", "==", selectedDate)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logMap = new Map<string, HabitLog>();
      snapshot.docs.forEach((d) => {
        const log = { id: d.id, ...d.data() } as HabitLog;
        logMap.set(log.habitId, log);
      });
      setDateLogs(logMap);
      
      // Update the 'todayCompleted' (current view) status in the habits list
      setHabits((prev) =>
        prev.map((h) => {
          const log = logMap.get(h.id);
          return {
            ...h,
            todayCompleted: log?.completed ?? false,
            todayCompletedSubtasks: log?.completedSubtasks || [],
          };
        })
      );
    });
    return unsubscribe;
  }, [user, selectedDate]);

  const toggle = useCallback(async (habit: Habit, date: string = selectedDate) => {
    if (!user) return;
    try {
      await toggleHabitLog(user.uid, habit, date);
    } catch (err: any) {
      console.error("Toggle error:", err);
      toast.error(err.message ?? "Failed to update habit");
    }
  }, [user, selectedDate]);

  const toggleSubtask = useCallback(async (habit: Habit, subtaskId: string, date: string = selectedDate) => {
    if (!user) return;
    try {
      await toggleSubtaskLog(user.uid, habit, date, subtaskId);
    } catch (err: any) {
      console.error("Toggle subtask error:", err);
      toast.error(err.message ?? "Failed to update subtask");
    }
  }, [user, selectedDate]);

  const addNote = useCallback(async (habitId: string, note: string, date: string = selectedDate) => {
    if (!user) return;
    await updateHabitNote(user.uid, habitId, date, note);
  }, [user, selectedDate]);

  const addHabit = useCallback(async (data: Omit<Habit, "id" | "userId" | "createdAt" | "order">) => {
    if (!user) return;
    await createHabit(user.uid, data);
    toast.success(copy.toastCreated);
  }, [user, copy]);

  const editHabit = useCallback(async (habitId: string, data: Partial<Habit>) => {
    await updateHabit(habitId, data);
    toast.success(copy.toastUpdated);
  }, [copy]);

  const removeHabit = useCallback(async (habitId: string) => {
    await archiveHabit(habitId);
    toast.success(copy.toastArchived);
  }, [copy]);

  return { habits, dateLogs, loading, toggle, toggleSubtask, addNote, addHabit, editHabit, removeHabit };
}
