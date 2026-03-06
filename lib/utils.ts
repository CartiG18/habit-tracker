import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HabitColor, DayOfWeek } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HABIT_COLORS: Record<
  HabitColor,
  { bg: string; border: string; text: string; ring: string; dot: string }
> = {
  green: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    ring: "ring-emerald-500",
    dot: "bg-emerald-400",
  },
  blue: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-400",
    ring: "ring-blue-500",
    dot: "bg-blue-400",
  },
  purple: {
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    text: "text-violet-400",
    ring: "ring-violet-500",
    dot: "bg-violet-400",
  },
  orange: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
    text: "text-orange-400",
    ring: "ring-orange-500",
    dot: "bg-orange-400",
  },
  pink: {
    bg: "bg-pink-500/20",
    border: "border-pink-500/40",
    text: "text-pink-400",
    ring: "ring-pink-500",
    dot: "bg-pink-400",
  },
  red: {
    bg: "bg-red-500/20",
    border: "border-red-500/40",
    text: "text-red-400",
    ring: "ring-red-500",
    dot: "bg-red-400",
  },
  yellow: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    text: "text-yellow-400",
    ring: "ring-yellow-500",
    dot: "bg-yellow-400",
  },
  teal: {
    bg: "bg-teal-500/20",
    border: "border-teal-500/40",
    text: "text-teal-400",
    ring: "ring-teal-500",
    dot: "bg-teal-400",
  },
};

export const DAYS: { label: string; short: string; value: DayOfWeek }[] = [
  { label: "Sunday", short: "Sun", value: 0 },
  { label: "Monday", short: "Mon", value: 1 },
  { label: "Tuesday", short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday", short: "Thu", value: 4 },
  { label: "Friday", short: "Fri", value: 5 },
  { label: "Saturday", short: "Sat", value: 6 },
];

export const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5];
export const EVERYDAY: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export const EMOJI_OPTIONS = [
  "🏃", "💪", "📚", "🧘", "💧", "🥗", "😴", "✍️",
  "🎯", "🎵", "🌿", "🧠", "❤️", "🌅", "🏋️", "🚴",
  "🎨", "🧹", "💊", "🫁", "🌊", "🍎", "🚶", "📝",
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
