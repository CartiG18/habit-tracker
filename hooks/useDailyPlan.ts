"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveDailyPlan } from "@/lib/habits";
import { useAuth } from "@/lib/auth-context";
import { DailyPlan } from "@/types";
import toast from "react-hot-toast";

export function useDailyPlan(date: string) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db, "dailyPlans", `${user.uid}_${date}`);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setPlan(snap.exists() ? (snap.data() as DailyPlan) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [user, date]);

  const savePlan = useCallback(async (habitIds: string[]) => {
    if (!user) return;
    try {
      await saveDailyPlan(user.uid, date, habitIds);
    } catch (err: any) {
      console.error("Save plan error:", err);
      toast.error(err.message ?? "Failed to save plan");
    }
  }, [user, date]);

  return { plan, loading, savePlan };
}
