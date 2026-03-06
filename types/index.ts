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
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  note?: string;
  completedAt?: string;
}

export interface DayLog {
  date: string;
  completed: boolean;
  scheduled: boolean;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0–1
  todayCompleted: boolean;
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
}
