"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getUserHabits,
  getHabitWithStats,
  toggleHabitLog,
  createHabit,
  updateHabit,
  archiveHabit,
  deleteHabit,
  getAllLogsForDate,
  updateHabitNote,
} from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitWithStats, HabitLog } from "@/types";
import { getTodayString } from "@/lib/utils";
import toast from "react-hot-toast";

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [todayLogs, setTodayLogs] = useState<Map<string, HabitLog>>(new Map());
  const [loading, setLoading] = useState(true);

  // Real-time listener on habits collection
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const habitsRef = collection(db, "habits");
    const q = query(habitsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawHabits = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Habit))
        .filter((h) => !h.archivedAt)
        .sort((a, b) => a.order - b.order);

      // Enrich with stats (parallel)
      const enriched = await Promise.all(
        rawHabits.map((h) => getHabitWithStats(user.uid, h))
      );
      setHabits(enriched);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Real-time listener on today's logs
  useEffect(() => {
    if (!user) return;
    const today = getTodayString();
    const logsRef = collection(db, "habitLogs");
    const q = query(
      logsRef,
      where("userId", "==", user.uid),
      where("date", "==", today)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logMap = new Map<string, HabitLog>();
      snapshot.docs.forEach((d) => {
        const log = { id: d.id, ...d.data() } as HabitLog;
        logMap.set(log.habitId, log);
      });
      setTodayLogs(logMap);

      // Update todayCompleted on habits
      setHabits((prev) =>
        prev.map((h) => ({
          ...h,
          todayCompleted: logMap.get(h.id)?.completed ?? false,
        }))
      );
    });

    return unsubscribe;
  }, [user]);

  const toggle = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const today = getTodayString();
      try {
        await toggleHabitLog(user.uid, habitId, today);
      } catch (err) {
        toast.error("Failed to update habit");
        console.error(err);
      }
    },
    [user]
  );

  const addNote = useCallback(
    async (habitId: string, note: string) => {
      if (!user) return;
      const today = getTodayString();
      await updateHabitNote(user.uid, habitId, today, note);
    },
    [user]
  );

  const addHabit = useCallback(
    async (data: Omit<Habit, "id" | "userId" | "createdAt" | "order">) => {
      if (!user) return;
      await createHabit(user.uid, data);
      toast.success("Habit created!");
    },
    [user]
  );

  const editHabit = useCallback(async (habitId: string, data: Partial<Habit>) => {
    await updateHabit(habitId, data);
    toast.success("Habit updated!");
  }, []);

  const removeHabit = useCallback(async (habitId: string) => {
    await archiveHabit(habitId);
    toast.success("Habit archived");
  }, []);

  return {
    habits,
    todayLogs,
    loading,
    toggle,
    addNote,
    addHabit,
    editHabit,
    removeHabit,
  };
}
