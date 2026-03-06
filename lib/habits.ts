import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Habit, HabitLog, HabitWithStats, DayLog, DayOfWeek } from "@/types";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  subDays,
  parseISO,
  isWithinInterval,
  startOfDay,
} from "date-fns";

// ─── Habits CRUD ────────────────────────────────────────────────────────────

export async function createHabit(
  userId: string,
  data: Omit<Habit, "id" | "userId" | "createdAt" | "order">
): Promise<Habit> {
  const habitsRef = collection(db, "habits");
  const existingQuery = query(habitsRef, where("userId", "==", userId));
  const existing = await getDocs(existingQuery);
  const order = existing.size;

  const habit = {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
    order,
  };

  const docRef = await addDoc(habitsRef, habit);
  return { id: docRef.id, ...habit };
}

export async function updateHabit(
  habitId: string,
  data: Partial<Habit>
): Promise<void> {
  const habitRef = doc(db, "habits", habitId);
  await updateDoc(habitRef, data);
}

export async function archiveHabit(habitId: string): Promise<void> {
  const habitRef = doc(db, "habits", habitId);
  await updateDoc(habitRef, { archivedAt: new Date().toISOString() });
}

export async function deleteHabit(habitId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete habit
  batch.delete(doc(db, "habits", habitId));

  // Delete all logs
  const logsQuery = query(
    collection(db, "habitLogs"),
    where("habitId", "==", habitId)
  );
  const logs = await getDocs(logsQuery);
  logs.forEach((logDoc) => batch.delete(logDoc.ref));

  await batch.commit();
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const habitsRef = collection(db, "habits");
  const q = query(
    habitsRef,
    where("userId", "==", userId),
    where("archivedAt", "==", null),
    orderBy("order", "asc")
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Habit));
  } catch {
    // Fallback if composite index not ready
    const q2 = query(habitsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q2);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Habit))
      .filter((h) => !h.archivedAt)
      .sort((a, b) => a.order - b.order);
  }
}

// ─── Habit Logs ─────────────────────────────────────────────────────────────

export async function toggleHabitLog(
  userId: string,
  habitId: string,
  date: string, // "YYYY-MM-DD"
  note?: string
): Promise<HabitLog> {
  const logId = `${userId}_${habitId}_${date}`;
  const logRef = doc(db, "habitLogs", logId);
  const existing = await getDoc(logRef);

  if (existing.exists() && existing.data().completed) {
    // Un-complete
    const log: HabitLog = {
      id: logId,
      habitId,
      userId,
      date,
      completed: false,
    };
    await setDoc(logRef, log);
    return log;
  } else {
    // Complete
    const log: HabitLog = {
      id: logId,
      habitId,
      userId,
      date,
      completed: true,
      note,
      completedAt: new Date().toISOString(),
    };
    await setDoc(logRef, log);
    return log;
  }
}

export async function updateHabitNote(
  userId: string,
  habitId: string,
  date: string,
  note: string
): Promise<void> {
  const logId = `${userId}_${habitId}_${date}`;
  const logRef = doc(db, "habitLogs", logId);
  await updateDoc(logRef, { note });
}

export async function getHabitLogs(
  userId: string,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const logsRef = collection(db, "habitLogs");
  const q = query(
    logsRef,
    where("userId", "==", userId),
    where("habitId", "==", habitId),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HabitLog));
}

export async function getAllLogsForDate(
  userId: string,
  date: string
): Promise<HabitLog[]> {
  const logsRef = collection(db, "habitLogs");
  const q = query(
    logsRef,
    where("userId", "==", userId),
    where("date", "==", date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HabitLog));
}

// ─── Stats Calculation ───────────────────────────────────────────────────────

export function calculateStreak(
  habit: Habit,
  logs: HabitLog[]
): { current: number; longest: number } {
  const today = format(new Date(), "yyyy-MM-dd");
  const logMap = new Map(logs.map((l) => [l.date, l.completed]));

  let current = 0;
  let longest = 0;
  let runningStreak = 0;
  let checkDate = new Date();

  // Walk backwards from today
  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    const dayOfWeek = checkDate.getDay() as DayOfWeek;
    const isScheduled = habit.targetDays.includes(dayOfWeek);

    if (isScheduled) {
      const completed = logMap.get(dateStr) ?? false;
      if (completed) {
        runningStreak++;
        if (i === 0 || current === runningStreak - 1) {
          current = runningStreak;
        }
        longest = Math.max(longest, runningStreak);
      } else {
        if (dateStr < today) {
          // Missed a scheduled day - streak broken (except today)
          runningStreak = 0;
        }
      }
    }

    checkDate = subDays(checkDate, 1);
  }

  return { current, longest };
}

export async function getHabitWithStats(
  userId: string,
  habit: Habit
): Promise<HabitWithStats> {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const logs = await getHabitLogs(userId, habit.id, thirtyDaysAgo, today);
  const { current, longest } = calculateStreak(habit, logs);

  const logMap = new Map(logs.map((l) => [l.date, l.completed]));

  // Week logs (last 7 days)
  const weekDays = eachDayOfInterval({
    start: parseISO(sevenDaysAgo),
    end: parseISO(today),
  });

  const weekLogs: DayLog[] = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayOfWeek = day.getDay() as DayOfWeek;
    return {
      date: dateStr,
      completed: logMap.get(dateStr) ?? false,
      scheduled: habit.targetDays.includes(dayOfWeek),
    };
  });

  // Completion rate (last 30 days, scheduled days only)
  const scheduledDays = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), i);
    return {
      date: format(d, "yyyy-MM-dd"),
      dayOfWeek: d.getDay() as DayOfWeek,
    };
  }).filter(({ dayOfWeek }) => habit.targetDays.includes(dayOfWeek));

  const completedScheduled = scheduledDays.filter(
    ({ date }) => logMap.get(date) ?? false
  ).length;

  const completionRate =
    scheduledDays.length > 0 ? completedScheduled / scheduledDays.length : 0;

  return {
    ...habit,
    currentStreak: current,
    longestStreak: longest,
    completionRate,
    todayCompleted: logMap.get(today) ?? false,
    weekLogs,
  };
}
