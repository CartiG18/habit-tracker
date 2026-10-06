"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { format, subDays } from "date-fns";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { HabitLog } from "@/types";

/** Number of days the per-habit history shows (and listens to). */
export const HISTORY_DAYS = 182; // ~26 weeks

/**
 * Real-time logs for one habit over the history window, keyed by date.
 * Backs the history heatmap and the detail modal's focus-day status/note.
 */
export function useHabitHistory(habitId: string | null) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Map<string, HabitLog>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !habitId) return;
    setLoading(true);
    const start = format(subDays(new Date(), HISTORY_DAYS - 1), "yyyy-MM-dd");
    const q = query(
      collection(db, "habitLogs"),
      where("userId", "==", user.uid),
      where("habitId", "==", habitId),
      where("date", ">=", start)
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const map = new Map<string, HabitLog>();
        snap.docs.forEach((d) => {
          const log = d.data() as HabitLog;
          map.set(log.date, log);
        });
        setLogs(map);
        setLoading(false);
      },
      (err) => {
        console.error("History listener error:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user, habitId]);

  return { logs, loading };
}
