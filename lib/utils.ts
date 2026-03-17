import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HabitColor, DayOfWeek } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1980s NASA / Terminal Palette
export const HABIT_COLORS: Record<
  HabitColor,
  { hex: string; bgAlpha: string; border: string }
> = {
  green:  { hex: "#32CD32", bgAlpha: "rgba(50, 205, 50, 0.15)",  border: "rgba(50, 205, 50, 0.4)"  }, // Signal Green
  blue:   { hex: "#00FFFF", bgAlpha: "rgba(0, 255, 255, 0.15)", border: "rgba(0, 255, 255, 0.4)" }, // Cyan
  purple: { hex: "#FF00FF", bgAlpha: "rgba(255, 0, 255, 0.15)", border: "rgba(255, 0, 255, 0.4)" }, // Magenta
  orange: { hex: "#FF8C00", bgAlpha: "rgba(255, 140, 0, 0.15)", border: "rgba(255, 140, 0, 0.4)" }, // Dark Orange
  pink:   { hex: "#FF1493", bgAlpha: "rgba(255, 20, 147, 0.15)", border: "rgba(255, 20, 147, 0.4)" }, // Deep Pink
  red:    { hex: "#FF3333", bgAlpha: "rgba(255, 51, 51, 0.15)",  border: "rgba(255, 51, 51, 0.4)"  }, // Alert Red
  yellow: { hex: "#FFD700", bgAlpha: "rgba(255, 215, 0, 0.15)", border: "rgba(255, 215, 0, 0.4)" }, // Gold
  teal:   { hex: "#00FA9A", bgAlpha: "rgba(0, 250, 154, 0.15)", border: "rgba(0, 250, 154, 0.4)" }, // Medium Spring Green
};

export const DAYS: { label: string; short: string; value: DayOfWeek }[] = [
  { label: "Sunday",    short: "SUN", value: 0 },
  { label: "Monday",    short: "MON", value: 1 },
  { label: "Tuesday",   short: "TUE", value: 2 },
  { label: "Wednesday", short: "WED", value: 3 },
  { label: "Thursday",  short: "THU", value: 4 },
  { label: "Friday",    short: "FRI", value: 5 },
  { label: "Saturday",  short: "SAT", value: 6 },
];

export const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5];
export const EVERYDAY: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export const EMOJI_OPTIONS = [
  "⚡", "🔋", "💾", "📡", "🚀", "🛰️", "🔭", "🔬",
  "⚙️", "🔧", "🔨", "🛠️", "🧲", "🕹️", "📡", "📻",
  "📟", "💻", "⌨️", "🖥️", "🖨️", "🖲️", "📼", "📷",
  "🎥", "📽️", "🎞️", "📞",
];

export function formatStreakText(streak: number): string {
  if (streak === 0) return "SYS.IDLE";
  if (streak === 1) return "SEQ: 01 ⚡";
  return `SEQ: ${streak.toString().padStart(2, "0")} ⚡`;
}

export function formatDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTodayString(): string {
  return formatDateString(new Date());
}
