import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HabitColor, DayOfWeek } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Use hex values instead of Tailwind classes so they never get purged
export const HABIT_COLORS: Record<
  HabitColor,
  { hex: string; bgAlpha: string; border: string }
> = {
  green:  { hex: "#34d399", bgAlpha: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.35)"  },
  blue:   { hex: "#60a5fa", bgAlpha: "rgba(96,165,250,0.15)",  border: "rgba(96,165,250,0.35)"  },
  purple: { hex: "#a78bfa", bgAlpha: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.35)" },
  orange: { hex: "#fb923c", bgAlpha: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.35)"  },
  pink:   { hex: "#f472b6", bgAlpha: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.35)" },
  red:    { hex: "#f87171", bgAlpha: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)" },
  yellow: { hex: "#fbbf24", bgAlpha: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.35)"  },
  teal:   { hex: "#2dd4bf", bgAlpha: "rgba(45,212,191,0.15)",  border: "rgba(45,212,191,0.35)"  },
};

export const DAYS: { label: string; short: string; value: DayOfWeek }[] = [
  { label: "Sunday",    short: "Sun", value: 0 },
  { label: "Monday",    short: "Mon", value: 1 },
  { label: "Tuesday",   short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday",  short: "Thu", value: 4 },
  { label: "Friday",    short: "Fri", value: 5 },
  { label: "Saturday",  short: "Sat", value: 6 },
];

export const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5];
export const EVERYDAY: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export const EMOJI_OPTIONS = [
  "🏃", "💪", "📚", "🧘", "💧", "🥗", "😴", "✍️",
  "🎯", "🎵", "🌿", "🧠", "❤️", "🌅", "🏋️", "🚴",
  "🎨", "🧹", "💊", "🫁", "🌊", "🍎", "🚶", "📝",
  "📚", "📖", "💻", "🎓",
];

export function formatStreakText(streak: number): string {
  if (streak === 0) return "No streak yet";
  if (streak === 1) return "1 day streak 🔥";
  return `${streak} day streak 🔥`;
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
