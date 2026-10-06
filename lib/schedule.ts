import { format, getDate, getDay } from "date-fns";
import { DayOfWeek, Habit, HabitSchedule } from "@/types";

// ─── Schedule Helpers (pure — no Firebase) ────────────────────────────────────
// Shared by the client data layer (lib/habits.ts) and the server reminder
// route, so "is this habit due today?" means the same thing everywhere.

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

export function isFrequencySchedule(schedule: HabitSchedule): boolean {
  return schedule.type === "frequency_week" || schedule.type === "frequency_month";
}

/** Inside the habit's start/end range and not paused on this "YYYY-MM-DD" date. */
export function isHabitActive(habit: Pick<Habit, "startDate" | "endDate" | "pausedFrom" | "pausedUntil">, dateStr: string): boolean {
  if (habit.startDate && dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;
  if (habit.pausedFrom && dateStr >= habit.pausedFrom && (!habit.pausedUntil || dateStr < habit.pausedUntil)) return false;
  return true;
}

/** Active AND on the schedule for this date. */
export function isHabitDue(habit: Habit, date: Date): boolean {
  return isHabitActive(habit, format(date, "yyyy-MM-dd")) && isScheduledDay(habit.schedule, date);
}

/** Paused today (or later), regardless of schedule. */
export function isPausedOn(habit: Pick<Habit, "pausedFrom" | "pausedUntil">, dateStr: string): boolean {
  return !!habit.pausedFrom && dateStr >= habit.pausedFrom && (!habit.pausedUntil || dateStr < habit.pausedUntil);
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
      if (schedule.days.length === 5 && schedule.days.every((d) => [1, 2, 3, 4, 5].includes(d))) return "Weekdays";
      return [...schedule.days].sort((a, b) => a - b).map((d) => DAY_NAMES[d]).join(", ");
    case "monthly_dates":
      return [...schedule.dates].sort((a, b) => a - b).map(ordinal).join(", ");
    case "frequency_week":
      return `${schedule.timesPerWeek}× per week`;
    case "frequency_month":
      return `${schedule.timesPerMonth}× per month`;
  }
}
