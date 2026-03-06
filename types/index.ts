export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  emoji: string;
  color: HabitColor;
  targetDays: DayOfWeek[]; // which days of the week to do this habit
  createdAt: string; // ISO date string
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
  completedAt?: string; // ISO timestamp
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0-1
  todayCompleted: boolean;
  weekLogs: DayLog[]; // last 7 days
}

export interface DayLog {
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  scheduled: boolean; // was this a target day?
}

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

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  notificationsEnabled?: boolean;
  reminderTime?: string; // "HH:MM"
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  habits: {
    habitId: string;
    habitName: string;
    emoji: string;
    color: HabitColor;
    completedDays: number;
    scheduledDays: number;
    rate: number;
  }[];
  overallRate: number;
}
