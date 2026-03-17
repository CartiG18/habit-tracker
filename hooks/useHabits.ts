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
} from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitWithStats, HabitLog } from "@/types";
import { getTodayString } from "@/lib/utils";
import toast from "react-hot-toast";

export function useHabits(selectedDate: string = getTodayString()) {
  const { user } = useAuth();
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
        const logMap = new Map(prev.map(h => [h.id, h.todayCompleted]));
        
        return enriched.map(h => ({
          ...h,
          todayCompleted: logMap.has(h.id) ? logMap.get(h.id)! : h.todayCompleted
        }));
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
        prev.map((h) => ({
          ...h,
          todayCompleted: logMap.get(h.id)?.completed ?? false,
        }))
      );
    });
    return unsubscribe;
  }, [user, selectedDate]);

  const toggle = useCallback(async (habitId: string, date: string = selectedDate) => {
    if (!user) return;
    try {
      await toggleHabitLog(user.uid, habitId, date);
    } catch (err: any) {
      console.error("Toggle error:", err);
      toast.error(err.message ?? "Failed to update habit");
    }
  }, [user, selectedDate]);

  const addNote = useCallback(async (habitId: string, note: string, date: string = selectedDate) => {
    if (!user) return;
    await updateHabitNote(user.uid, habitId, date, note);
  }, [user, selectedDate]);

  const addHabit = useCallback(async (data: Omit<Habit, "id" | "userId" | "createdAt" | "order">) => {
    if (!user) return;
    await createHabit(user.uid, data);
    toast.success("Habit created!");
  }, [user]);

  const editHabit = useCallback(async (habitId: string, data: Partial<Habit>) => {
    await updateHabit(habitId, data);
    toast.success("Habit updated!");
  }, []);

  const removeHabit = useCallback(async (habitId: string) => {
    await archiveHabit(habitId);
    toast.success("Habit archived");
  }, []);

  return { habits, dateLogs, loading, toggle, addNote, addHabit, editHabit, removeHabit };
}
