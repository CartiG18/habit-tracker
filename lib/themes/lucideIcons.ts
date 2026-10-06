import {
  X, Check, ChevronRight, Plus, ClipboardList, Activity, TrendingUp, Target, Edit2, Archive, Trash2,
  Monitor, Bell, Settings, LogOut, ImagePlus, RotateCcw, Coffee, Pause, Play, CalendarDays,
  GripVertical, Sunrise, Sun, Moon, CalendarRange, Minus,
} from "lucide-react";
import type { ThemeIcons } from "@/lib/themes/types";

/** Default icon set (lucide). Themes override individual entries via `icons`. */
export const LUCIDE_ICONS: ThemeIcons = {
  close: X,
  check: Check,
  chevron: ChevronRight,
  add: Plus,
  plan: ClipboardList,
  streak: Activity,
  rate: TrendingUp,
  best: Target,
  edit: Edit2,
  delete: Trash2,
  appearance: Monitor,
  notifications: Bell,
  account: Settings,
  logout: LogOut,
  upload: ImagePlus,
  reset: RotateCcw,
  skip: Coffee,
  archive: Archive,
  pause: Pause,
  resume: Play,
  history: CalendarDays,
  grip: GripVertical,
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
  calendar: CalendarRange,
  increment: Plus,
  decrement: Minus,
};
