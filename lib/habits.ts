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
  deleteField,
} from "firebase/firestore";
import { db } from "./firebase";
import { Habit, HabitLog, HabitWithStats, DayLog, DailyPlan } from "@/types";
import {
  format,
  subDays,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { isScheduledDay, isHabitActive, isHabitDue, isFrequencySchedule } from "@/lib/schedule";

// ─── Write Helpers ────────────────────────────────────────────────────────────

/** Firestore rejects `undefined`: drop those keys from a new document. */
function withoutUndefined<T extends object>(data: T): T {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as T;
}

/** For updates, `undefined` means "clear this field". */
function forUpdate(data: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v === undefined ? deleteField() : v]));
}

// ─── Habits CRUD ──────────────────────────────────────────────────────────────

export async function createHabit(
  userId: string,
  data: Omit<Habit, "id" | "userId" | "createdAt" | "order">
): Promise<Habit> {
  const habitsRef = collection(db, "habits");
  const existing = await getDocs(query(habitsRef, where("userId", "==", userId)));
  const order = existing.size;
  const habit = withoutUndefined({ ...data, userId, createdAt: new Date().toISOString(), order });
  const docRef = await addDoc(habitsRef, habit);
  return { id: docRef.id, ...habit };
}

/** Partial update; keys set to `undefined` are removed from the document. */
export async function updateHabit(habitId: string, data: Partial<Habit>): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), forUpdate(data as Record<string, unknown>));
}

/** Hide from the app but keep all history (restorable). */
export async function archiveHabit(habitId: string): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), { archivedAt: new Date().toISOString() });
}

export async function restoreHabit(habitId: string): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), { archivedAt: deleteField() });
}

/** Pause from `from` until `until` (exclusive); no `until` = until resumed. */
export async function pauseHabit(habitId: string, from: string, until?: string): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), { pausedFrom: from, pausedUntil: until ?? deleteField() });
}

export async function resumeHabit(habitId: string): Promise<void> {
  await updateDoc(doc(db, "habits", habitId), { pausedFrom: deleteField(), pausedUntil: deleteField() });
}

/** Permanently delete a habit and all of its logs. */
export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  // Security rules only allow listing your own logs, so constrain by userId too
  const logs = await getDocs(
    query(collection(db, "habitLogs"), where("userId", "==", userId), where("habitId", "==", habitId))
  );
  const refs = [doc(db, "habits", habitId), ...logs.docs.map((l) => l.ref)];
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db);
    refs.slice(i, i + 450).forEach((r) => batch.delete(r));
    await batch.commit();
  }
}

/** Persist a manual order: `ids[0]` gets order 0, and so on. */
export async function reorderHabits(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id, i) => batch.update(doc(db, "habits", id), { order: i }));
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
// setDoc replaces the whole document, so every writer carries over the fields
// it isn't changing (notably `note`).

function logRefFor(userId: string, habitId: string, date: string) {
  const id = `${userId}_${habitId}_${date}`;
  return { id, ref: doc(db, "habitLogs", id) };
}

async function readLog(ref: ReturnType<typeof doc>): Promise<HabitLog | null> {
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as HabitLog) : null;
}

/** Complete ↔ un-complete. Completing clears a skip; measurable habits jump to their target. */
export async function toggleHabitLog(userId: string, habit: Habit, date: string): Promise<HabitLog> {
  const { id, ref } = logRefFor(userId, habit.id, date);
  const prev = await readLog(ref);
  const base = { id, habitId: habit.id, userId, date, ...(prev?.note ? { note: prev.note } : {}) };

  const log: HabitLog = prev?.completed
    ? { ...base, completed: false, completedSubtasks: [], ...(habit.measure ? { value: 0 } : {}) }
    : {
        ...base,
        completed: true,
        completedAt: new Date().toISOString(),
        completedSubtasks: habit.subtasks?.map((s) => s.id) || [],
        ...(habit.measure ? { value: Math.max(prev?.value ?? 0, habit.measure.target) } : {}),
      };
  await setDoc(ref, log);
  return log;
}

/** Mark (or unmark) a day as an intentional rest day. */
export async function setHabitSkipped(userId: string, habit: Habit, date: string, skipped: boolean): Promise<HabitLog> {
  const { id, ref } = logRefFor(userId, habit.id, date);
  const prev = await readLog(ref);
  const log: HabitLog = {
    id,
    habitId: habit.id,
    userId,
    date,
    completed: false,
    completedSubtasks: [],
    ...(skipped ? { skipped: true } : {}),
    ...(prev?.note ? { note: prev.note } : {}),
  };
  await setDoc(ref, log);
  return log;
}

/** Set the logged amount for a measurable habit; completes once it reaches the target. */
export async function logHabitValue(userId: string, habit: Habit, date: string, value: number): Promise<HabitLog> {
  const { id, ref } = logRefFor(userId, habit.id, date);
  const prev = await readLog(ref);
  const v = Math.max(0, Math.round(value * 100) / 100);
  const completed = !!habit.measure && v >= habit.measure.target;
  const log: HabitLog = {
    id,
    habitId: habit.id,
    userId,
    date,
    value: v,
    completed,
    completedSubtasks: prev?.completedSubtasks ?? [],
    ...(completed ? { completedAt: prev?.completedAt ?? new Date().toISOString() } : {}),
    ...(prev?.note ? { note: prev.note } : {}),
  };
  await setDoc(ref, log);
  return log;
}

export async function toggleSubtaskLog(userId: string, habit: Habit, date: string, subtaskId: string): Promise<HabitLog> {
  const { id, ref } = logRefFor(userId, habit.id, date);
  const prev = await readLog(ref);
  const validIds = new Set(habit.subtasks?.map((s) => s.id) ?? []);

  // Drop ids of subtasks that have since been deleted from the habit
  let completedSubtasks = (prev?.completedSubtasks || []).filter((sid) => validIds.has(sid));
  completedSubtasks = completedSubtasks.includes(subtaskId)
    ? completedSubtasks.filter((sid) => sid !== subtaskId)
    : [...completedSubtasks, subtaskId];

  const completed = validIds.size > 0 && completedSubtasks.length === validIds.size;
  const log: HabitLog = {
    id,
    habitId: habit.id,
    userId,
    date,
    completed,
    completedSubtasks,
    ...(prev?.note ? { note: prev.note } : {}),
    ...(completed ? { completedAt: new Date().toISOString() } : {}),
  };
  await setDoc(ref, log);
  return log;
}

export async function updateHabitNote(userId: string, habitId: string, date: string, note: string): Promise<void> {
  const { id, ref } = logRefFor(userId, habitId, date);
  const prev = await readLog(ref);
  if (prev) await updateDoc(ref, { note });
  else await setDoc(ref, { id, habitId, userId, date, completed: false, note });
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

// ─── Daily Plans ──────────────────────────────────────────────────────────────

export function isEveryDayHabit(habit: Habit): boolean {
  return habit.schedule.type === "weekly" && habit.schedule.days.length === 7;
}

/** Default plan: every-day habits that are active on `date`. */
export function defaultPlanHabitIds(habits: Habit[], date: Date = new Date()): string[] {
  return habits.filter((h) => isEveryDayHabit(h) && isHabitDue(h, date)).map((h) => h.id);
}

export async function saveDailyPlan(userId: string, date: string, habitIds: string[]): Promise<DailyPlan> {
  const id = `${userId}_${date}`;
  const ref = doc(db, "dailyPlans", id);
  const existing = await getDoc(ref);
  const plan: DailyPlan = {
    id,
    userId,
    date,
    habitIds,
    createdAt: existing.exists() ? (existing.data() as DailyPlan).createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, plan);
  return plan;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
// Rest days (skipped) and inactive days (paused / outside start–end) are
// neutral: they neither extend nor break a streak and are left out of rates.

function withSchedule(habit: Habit): Habit {
  // Guard for old habits created before the schedule update
  if (habit.schedule) return habit;
  return { ...habit, schedule: { type: "weekly", days: (habit as any).targetDays ?? [0, 1, 2, 3, 4, 5, 6] } };
}

export function calculateStreak(rawHabit: Habit, logs: HabitLog[]): { current: number; longest: number } {
  const habit = withSchedule(rawHabit);
  const today = format(new Date(), "yyyy-MM-dd");
  const logMap = new Map(logs.map((l) => [l.date, l]));
  const done = (ds: string) => !!logMap.get(ds)?.completed;
  const excused = (ds: string) => !!logMap.get(ds)?.skipped || !isHabitActive(habit, ds);

  if (isFrequencySchedule(habit.schedule)) {
    // Weekly / monthly streak: consecutive periods where the target was hit.
    const isWeekly = habit.schedule.type === "frequency_week";
    const target = habit.schedule.type === "frequency_week" ? habit.schedule.timesPerWeek
      : habit.schedule.type === "frequency_month" ? habit.schedule.timesPerMonth : 1;
    let current = 0, longest = 0, running = 0, currentOpen = true;
    let periodStart = new Date();

    for (let p = 0; p < 52; p++) {
      const pStart = isWeekly ? startOfWeek(periodStart, { weekStartsOn: 1 }) : startOfMonth(periodStart);
      const pEnd = isWeekly ? endOfWeek(periodStart, { weekStartsOn: 1 }) : endOfMonth(periodStart);
      const days = eachDayOfInterval({ start: pStart, end: pEnd }).map((d) => format(d, "yyyy-MM-dd")).filter((ds) => ds <= today);
      const completions = days.filter(done).length;
      const excusedDays = days.filter((ds) => !done(ds) && excused(ds)).length;
      const isCurrentPeriod = today <= format(pEnd, "yyyy-MM-dd");

      if (completions >= target) {
        running++;
        if (currentOpen) current = running;
        longest = Math.max(longest, running);
      } else if (!isCurrentPeriod && completions + excusedDays < target) {
        // A past period that missed its target even after rest/pause days → break
        running = 0;
        currentOpen = false;
      }
      // else: current period still in progress, or excused by rest/pause → neutral
      periodStart = subDays(pStart, 1);
    }
    return { current, longest };
  }

  // Daily streak: walk back day by day. Today never breaks it (it isn't over yet).
  let current = 0, longest = 0, running = 0, currentOpen = true;
  let checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const ds = format(checkDate, "yyyy-MM-dd");
    if (done(ds)) {
      running++;
      if (currentOpen) current = running;
      longest = Math.max(longest, running);
    } else if (isScheduledDay(habit.schedule, checkDate) && !excused(ds) && ds < today) {
      running = 0;
      currentOpen = false;
    }
    checkDate = subDays(checkDate, 1);
  }
  return { current, longest };
}

export async function getHabitWithStats(userId: string, rawHabit: Habit): Promise<HabitWithStats> {
  const habit = withSchedule(rawHabit);
  const today = format(new Date(), "yyyy-MM-dd");
  const ninetyDaysAgo = format(subDays(new Date(), 90), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const logs = await getHabitLogs(userId, habit.id, ninetyDaysAgo, today);
  const { current, longest } = calculateStreak(habit, logs);
  const logMap = new Map(logs.map((l) => [l.date, l]));

  const weekLogs: DayLog[] = eachDayOfInterval({ start: parseISO(sevenDaysAgo), end: parseISO(today) }).map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const log = logMap.get(dateStr);
    return {
      date: dateStr,
      completed: log?.completed ?? false,
      skipped: !!log?.skipped,
      scheduled: isHabitDue(habit, day),
      completedSubtasks: log?.completedSubtasks || [],
    };
  });

  let completionRate = 0;
  let periodCompletions: number | undefined;
  let periodTarget: number | undefined;

  if (isFrequencySchedule(habit.schedule)) {
    const isWeekly = habit.schedule.type === "frequency_week";
    const target = habit.schedule.type === "frequency_week" ? habit.schedule.timesPerWeek
      : habit.schedule.type === "frequency_month" ? habit.schedule.timesPerMonth : 1;
    const pStart = isWeekly ? startOfWeek(new Date(), { weekStartsOn: 1 }) : startOfMonth(new Date());
    const periodDays = eachDayOfInterval({ start: pStart, end: new Date() });
    periodCompletions = periodDays.filter((d) => logMap.get(format(d, "yyyy-MM-dd"))?.completed).length;
    periodTarget = target;
    completionRate = Math.min(periodCompletions / target, 1);
  } else {
    // Last 30 days that were due and not rested
    const counted = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).filter((d) => {
      const ds = format(d, "yyyy-MM-dd");
      return isHabitDue(habit, d) && !logMap.get(ds)?.skipped;
    });
    const done = counted.filter((d) => logMap.get(format(d, "yyyy-MM-dd"))?.completed).length;
    completionRate = counted.length > 0 ? done / counted.length : 0;
  }

  const todayLog = logMap.get(today);
  return {
    ...habit,
    currentStreak: current,
    longestStreak: longest,
    completionRate,
    todayCompleted: todayLog?.completed ?? false,
    todaySkipped: !!todayLog?.skipped,
    todayValue: todayLog?.value ?? 0,
    todayCompletedSubtasks: todayLog?.completedSubtasks || [],
    weekLogs,
    periodCompletions,
    periodTarget,
  };
}
