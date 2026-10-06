// ─── Theme ───────────────────────────────────────────────────────────────────

/** Theme ids come from the registry in `lib/themes/index.ts`. */
export type { ThemeId } from "@/lib/themes";

// ─── Habit Colors ────────────────────────────────────────────────────────────

export type HabitColor =
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "pink"
  | "red"
  | "yellow"
  | "teal";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

// ─── Schedule Types ──────────────────────────────────────────────────────────

/** Specific days of the week (Mon, Wed, Fri etc.) */
export interface ScheduleWeekly {
  type: "weekly";
  days: DayOfWeek[];
}

/** Specific dates in a month (1st, 15th etc.) */
export interface ScheduleMonthlyDates {
  type: "monthly_dates";
  dates: number[]; // 1–31
}

/** X times per week — user picks any days to hit the target */
export interface ScheduleFrequencyWeek {
  type: "frequency_week";
  timesPerWeek: number;
}

/** X times per month — user picks any days to hit the target */
export interface ScheduleFrequencyMonth {
  type: "frequency_month";
  timesPerMonth: number;
}

export type HabitSchedule =
  | ScheduleWeekly
  | ScheduleMonthlyDates
  | ScheduleFrequencyWeek
  | ScheduleFrequencyMonth;

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Subtask {
  id: string;
  title: string;
}

/** Morning / afternoon / evening section on the dashboard (undefined = anytime) */
export type TimeOfDay = "morning" | "afternoon" | "evening";

/** A measurable habit: log a quantity toward a daily target (e.g. 8 glasses). */
export interface HabitMeasure {
  target: number;
  unit: string;
  /** Amount added per tap on the habit row */
  step: number;
}

/** Per-habit push reminder at a local time. */
export interface HabitReminder {
  enabled: boolean;
  time: string; // "HH:mm" in the user's time zone
  /** Only send if the habit isn't done (or skipped) yet that day */
  onlyIfNotDone: boolean;
  /** Server bookkeeping: local date of the last reminder sent */
  lastSentDate?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  emoji: string;
  color: HabitColor;
  schedule: HabitSchedule;
  createdAt: string;
  archivedAt?: string;
  order: number;
  subtasks?: Subtask[];
  /** Active date range (inclusive) — for challenges or seasonal habits */
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
  /** Paused from this date … until (exclusive) the resume date; no `pausedUntil` = until resumed */
  pausedFrom?: string;
  pausedUntil?: string;
  timeOfDay?: TimeOfDay;
  measure?: HabitMeasure;
  reminder?: HabitReminder;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  /** Intentionally skipped (rest day): neither breaks a streak nor counts as a miss */
  skipped?: boolean;
  /** Logged amount for measurable habits */
  value?: number;
  note?: string;
  completedAt?: string;
  completedSubtasks?: string[]; // Array of subtask IDs
}

export interface DayLog {
  date: string;
  completed: boolean;
  skipped?: boolean;
  scheduled: boolean;
  completedSubtasks?: string[];
}

export interface DailyPlan {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  habitIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0–1
  todayCompleted: boolean;
  todaySkipped?: boolean;
  todayValue?: number;
  todayCompletedSubtasks?: string[];
  weekLogs: DayLog[];
  periodCompletions?: number;
  periodTarget?: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  theme?: string; // a ThemeId; validated with resolveThemeId() since stored ids may be stale
  /** IANA zone (e.g. "America/New_York") so the server can send reminders at local times */
  timeZone?: string;
  /** Push tokens for this user's devices */
  fcmTokens?: string[];
  /** Server bookkeeping: local date of the last daily reminder sent */
  lastDailyReminderDate?: string;
}
