import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Habit,
  HabitLog,
  HabitWithStats,
  DayLog,
  DayOfWeek,
  HabitSchedule,
} from "@/types";
import {
  format,
  subDays,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDate,
  getDay,
} from "date-fns";

// ─── Schedule Helpers ─────────────────────────────────────────────────────────

export function isScheduledDay(schedule: HabitSchedule, date: Date): boolean {
  switch (schedule.type) {
    case "weekly":
      return schedule.days.includes(getDay(date) as DayOfWeek);
    case "monthly_dates":
      return schedule.dates.includes(getDate(date));
    case "frequency_week":
    case "frequency_month":
      return true; // any day is eligible
  }
}

export function scheduleLabel(schedule: HabitSchedule): string {
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  switch (schedule.type) {
    case "weekly":
      if (schedule.days.length === 7) return "Every day";
      if (schedule.days.length === 5 && schedule.days.every((d) => [1,2,3,4,5].includes(d))) return "Weekdays";
      return schedule.days.sort().map((d) => DAY_NAMES[d]).join(", ");
    case "monthly_dates":
      return schedule.dates.sort((a, b) => a - b).map(ordinal).join(", ");
    case "frequency_week":
      return `${schedule.timesPerWeek}× per week`;
    case "frequency_month":
      return `${schedule.timesPerMonth}× per month`;
  }
}

// ─── Habits CRUD ──────────────────────────────────────────────────────────────

export async function createHabit(
  userId: string,
  data: Omit<Habit, "id" | "userId" | "createdAt" | "order">
): Promise<Habit> {
  const habitsRef = collection(db, "habits");
  const existingQuery = query(habitsRef, where("userId", "==", userId));
  const existing = await getDocs(existingQuery);
  const order = existing.size;
  const habit = { ...data, userId, createdAt: new Date().toISOString(), order };
  const docRef = await addDoc(habitsRef, habit);
  return { id: docRef.id, ...habit };
}

export async function updateHabit(habitId: string, data: Partial<Habit>): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), data);
}

export async function archiveHabit(habitId: string): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), { archivedAt: new Date().toISOString() });
}

export async function deleteHabit(habitId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, "habits", habitId));
  const logs = await getDocs(query(collection(db, "habitLogs"), where("habitId", "==", habitId)));
  logs.forEach((l) => batch.delete(l.ref));
  await batch.commit();
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const snapshot = await getDocs(query(collection(db, "habits"), where("userId", "==", userId)));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Habit))
    .filter((h) => !h.archivedAt)
    .sort((a, b) => a.order - b.order);
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export async function toggleHabitLog(userId: string, habitId: string, date: string): Promise<HabitLog> {
  const logId = `${userId}_${habitId}_${date}`;
  const logRef = doc(db, "habitLogs", logId);
  const existing = await getDoc(logRef);
  if (existing.exists() && existing.data().completed) {
    const log: HabitLog = { id: logId, habitId, userId, date, completed: false };
    await setDoc(logRef, log);
    return log;
  } else {
    const log: HabitLog = { id: logId, habitId, userId, date, completed: true, completedAt: new Date().toISOString() };
    await setDoc(logRef, log);
    return log;
  }
}

export async function updateHabitNote(userId: string, habitId: string, date: string, note: string): Promise<void> {
  const logId = `${userId}_${habitId}_${date}`;
  const logRef = doc(db, "habitLogs", logId);
  const existing = await getDoc(logRef);
  if (existing.exists()) {
    await updateDoc(logRef, { note });
  } else {
    await setDoc(logRef, { id: logId, habitId, userId, date, completed: false, note });
  }
}

export async function getHabitLogs(userId: string, habitId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
  const q = query(
    collection(db, "habitLogs"),
    where("userId", "==", userId),
    where("habitId", "==", habitId),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HabitLog));
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function calculateStreak(habit: Habit, logs: HabitLog[]): { current: number; longest: number } {
  const today = format(new Date(), "yyyy-MM-dd");
  const logMap = new Map(logs.map((l) => [l.date, l.completed]));

  if (!habit.schedule) {
    habit = {
      ...habit,
      schedule: {
        type: "weekly",
        days: (habit as any).targetDays ?? [0,1,2,3,4,5,6],
      },
    };
  }

  if (habit.schedule.type === "frequency_week" || habit.schedule.type === "frequency_month") {
    const isWeekly = habit.schedule.type === "frequency_week";
    const target = habit.schedule.type === "frequency_week"
  ? habit.schedule.timesPerWeek
  : habit.schedule.type === "frequency_month"
  ? habit.schedule.timesPerMonth
  : 1;
    let current = 0, longest = 0, running = 0;
    let periodStart = new Date();

    for (let p = 0; p < 52; p++) {
      const pStart = isWeekly ? startOfWeek(periodStart, { weekStartsOn: 1 }) : startOfMonth(periodStart);
      const pEnd = isWeekly ? endOfWeek(periodStart, { weekStartsOn: 1 }) : endOfMonth(periodStart);
      const days = eachDayOfInterval({ start: pStart, end: pEnd });
      const completions = days.filter((d) => {
        const ds = format(d, "yyyy-MM-dd");
        return ds <= today && (logMap.get(ds) ?? false);
      }).length;
      const isCurrentPeriod = today <= format(pEnd, "yyyy-MM-dd");

      if (completions >= target) {
        running++;
        if (p === 0 || (isCurrentPeriod && current === running - 1)) current = running;
        longest = Math.max(longest, running);
      } else if (!isCurrentPeriod) {
        running = 0;
      }
      periodStart = subDays(pStart, 1);
    }
    return { current, longest };
  }

  let current = 0, longest = 0, runningStreak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (isScheduledDay(habit.schedule, checkDate)) {
      const completed = logMap.get(dateStr) ?? false;
      if (completed) {
        runningStreak++;
        if (i === 0 || current === runningStreak - 1) current = runningStreak;
        longest = Math.max(longest, runningStreak);
      } else if (dateStr < today) {
        runningStreak = 0;
      }
    }
    checkDate = subDays(checkDate, 1);
  }
  return { current, longest };
}

export async function getHabitWithStats(userId: string, habit: Habit): Promise<HabitWithStats> {

  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const logs = await getHabitLogs(userId, habit.id, thirtyDaysAgo, today);
  // Guard for old habits created before the schedule update
  if (!habit.schedule) {
    habit = {
      ...habit,
      schedule: {
        type: "weekly",
        days: (habit as any).targetDays ?? [0,1,2,3,4,5,6],
      },
    };
  }
  const { current, longest } = calculateStreak(habit, logs);
  const logMap = new Map(logs.map((l) => [l.date, l.completed]));

  const weekDays = eachDayOfInterval({ start: parseISO(sevenDaysAgo), end: parseISO(today) });
  const weekLogs: DayLog[] = weekDays.map((day) => ({
    date: format(day, "yyyy-MM-dd"),
    completed: logMap.get(format(day, "yyyy-MM-dd")) ?? false,
    scheduled: isScheduledDay(habit.schedule, day),
  }));

  let completionRate = 0;
  let periodCompletions: number | undefined;
  let periodTarget: number | undefined;

  if (habit.schedule.type === "frequency_week" || habit.schedule.type === "frequency_month") {
    const isWeekly = habit.schedule.type === "frequency_week";
    const target = habit.schedule.type === "frequency_week"
  ? habit.schedule.timesPerWeek
  : habit.schedule.type === "frequency_month"
  ? habit.schedule.timesPerMonth
  : 1;
    const pStart = isWeekly ? startOfWeek(new Date(), { weekStartsOn: 1 }) : startOfMonth(new Date());
    const periodDays = eachDayOfInterval({ start: pStart, end: new Date() });
    const completions = periodDays.filter((d) => logMap.get(format(d, "yyyy-MM-dd"))).length;
    periodCompletions = completions;
    periodTarget = target;
    completionRate = Math.min(completions / target, 1);
  } else {
    const last30 = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));
    const scheduled = last30.filter((d) => isScheduledDay(habit.schedule, d));
    const done = scheduled.filter((d) => logMap.get(format(d, "yyyy-MM-dd")) ?? false).length;
    completionRate = scheduled.length > 0 ? done / scheduled.length : 0;
  }

  return {
    ...habit,
    currentStreak: current,
    longestStreak: longest,
    completionRate,
    todayCompleted: logMap.get(today) ?? false,
    weekLogs,
    periodCompletions,
    periodTarget,
  };
}
