import {
  X, Check, ChevronRight, Plus, ClipboardList, Activity, TrendingUp, Target, Edit2, Archive,
  Monitor, Bell, Settings, LogOut, ImagePlus, RotateCcw,
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
  delete: Archive,
  appearance: Monitor,
  notifications: Bell,
  account: Settings,
  logout: LogOut,
  upload: ImagePlus,
  reset: RotateCcw,
};
