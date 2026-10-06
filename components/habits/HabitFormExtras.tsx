"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme, useIcons } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import { Habit, TimeOfDay } from "@/types";

// ─── State ────────────────────────────────────────────────────────────────────
// The add/edit forms share these optional fields: measurable target, time of
// day, active dates and reminder. Kept as one flat state object.

export interface HabitExtras {
  measureOn: boolean;
  target: number;
  unit: string;
  step: number;
  timeOfDay?: TimeOfDay;
  startDate: string;
  endDate: string;
  reminderOn: boolean;
  reminderTime: string;
  onlyIfNotDone: boolean;
}

export function extrasFromHabit(h?: Habit): HabitExtras {
  return {
    measureOn: !!h?.measure,
    target: h?.measure?.target ?? 8,
    unit: h?.measure?.unit ?? "",
    step: h?.measure?.step ?? 1,
    timeOfDay: h?.timeOfDay,
    startDate: h?.startDate ?? "",
    endDate: h?.endDate ?? "",
    reminderOn: !!h?.reminder?.enabled,
    reminderTime: h?.reminder?.time ?? "09:00",
    onlyIfNotDone: h?.reminder?.onlyIfNotDone ?? true,
  };
}

/** Habit fields for saving. `undefined` clears a field on edit (see updateHabit). */
export function extrasToHabit(x: HabitExtras, prev?: Habit): Pick<Habit, "measure" | "timeOfDay" | "startDate" | "endDate" | "reminder"> {
  return {
    measure: x.measureOn ? { target: Math.max(1, x.target), unit: x.unit.trim(), step: Math.max(0.1, x.step || 1) } : undefined,
    timeOfDay: x.timeOfDay,
    startDate: x.startDate || undefined,
    endDate: x.endDate || undefined,
    reminder: x.reminderOn
      ? {
          enabled: true,
          time: x.reminderTime,
          onlyIfNotDone: x.onlyIfNotDone,
          ...(prev?.reminder?.lastSentDate ? { lastSentDate: prev.reminder.lastSentDate } : {}),
        }
      : undefined,
  };
}

/** Start must not be after end when both are set. */
export function extrasValid(x: HabitExtras): boolean {
  return !(x.startDate && x.endDate && x.startDate > x.endDate);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  value: HabitExtras;
  onChange: (patch: Partial<HabitExtras>) => void;
}

export default function HabitFormExtras({ value: x, onChange }: Props) {
  const { isRetro } = useTheme();
  const copy = useCopy();
  const Icons = useIcons();

  // Shared styles mirroring the schedule section of the add/edit modals
  const labelCls = cn("font-theme transition-colors flex items-center gap-2", isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-widest" : "th-label text-sm font-500 text-th-text-secondary");
  const sectionCls = cn("pt-4", isRetro ? "border-t border-th-primary/20" : "");
  const trayCls = cn("grid gap-1 mt-3", isRetro ? "bg-th-screen-light/50 border border-th-primary/30 p-1" : "bg-th-surface p-1 rounded-xl shadow-neu-in");
  const segCls = (active: boolean) => cn("py-2 px-1 font-theme transition-all flex items-center justify-center gap-1.5",
    isRetro
      ? ["text-[10px] font-700", active ? "bg-th-primary text-th-btn-text shadow-[0_0_5px_rgb(var(--th-primary)/0.5)]" : "text-th-primary/50 hover:bg-th-primary/10"]
      : ["text-xs font-500 rounded-lg", active ? "bg-th-screen shadow-neu-out text-th-text" : "text-th-text-secondary hover:text-th-text"]);
  const fieldCls = cn("flex items-center", isRetro ? "border-b-2 border-th-primary/50 bg-th-screen-light/30" : "bg-th-surface rounded-xl border border-th-surface-dark/20 shadow-neu-in px-3");
  const inputCls = cn("w-full min-w-0 py-2.5 font-theme text-base outline-none bg-transparent", isRetro ? "text-th-primary placeholder-th-primary/20 px-2 uppercase" : "text-th-text placeholder-th-text-secondary");
  const smallLabelCls = cn("font-theme block mb-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs");
  const stepBtnCls = cn("w-10 h-10 transition-colors flex items-center justify-center font-theme text-xl",
    isRetro ? "border border-th-primary text-th-primary hover:bg-th-primary/20 font-800" : "bg-th-screen text-th-text rounded-full shadow-neu-out hover:shadow-neu-in font-500");

  const TIMES: { value: TimeOfDay | undefined; label: string; icon?: ReactNode }[] = [
    { value: undefined, label: copy.todAnytime },
    { value: "morning", label: copy.todMorning, icon: <Icons.morning className="w-4 h-4" /> },
    { value: "afternoon", label: copy.todAfternoon, icon: <Icons.afternoon className="w-4 h-4" /> },
    { value: "evening", label: copy.todEvening, icon: <Icons.evening className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Type: check off vs measurable */}
      <div className={sectionCls}>
        <label className={labelCls}>{copy.typeLabel}</label>
        <div className={cn(trayCls, "grid-cols-2")}>
          <button onClick={() => onChange({ measureOn: false })} className={segCls(!x.measureOn)}>
            <Icons.check className="w-4 h-4" /> {copy.typeCheck}
          </button>
          <button onClick={() => onChange({ measureOn: true })} className={segCls(x.measureOn)}>
            <Icons.increment className="w-4 h-4" /> {copy.typeMeasure}
          </button>
        </div>

        {x.measureOn && (
          <div className="mt-4 space-y-3">
            <div className={cn("flex items-center justify-center gap-6", isRetro ? "bg-th-screen-light/30 p-4 border border-th-primary/30" : "bg-th-surface p-4 rounded-xl")}>
              <button onClick={() => onChange({ target: Math.max(1, x.target - 1) })} className={stepBtnCls} aria-label="−">
                <Icons.decrement className="w-4 h-4" />
              </button>
              <div className="text-center min-w-[80px]">
                <span className={cn("font-theme leading-none tabular-nums", isRetro ? "font-800 text-3xl text-th-primary text-glow" : "font-700 text-3xl text-th-text")}>{x.target}</span>
                <p className={cn("font-theme mt-1", isRetro ? "text-th-primary/50 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{copy.measureTargetLabel}</p>
              </div>
              <button onClick={() => onChange({ target: x.target + 1 })} className={stepBtnCls} aria-label="+">
                <Icons.increment className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-3">
              <div>
                <span className={smallLabelCls}>{copy.unitLabel}</span>
                <div className={fieldCls}>
                  <input value={x.unit} onChange={(e) => onChange({ unit: e.target.value })} placeholder={copy.unitPlaceholder} maxLength={20} className={inputCls} />
                </div>
              </div>
              <div>
                <span className={smallLabelCls}>{copy.stepLabel}</span>
                <div className={fieldCls}>
                  <input type="number" inputMode="decimal" min={0.1} step="any" value={x.step}
                    onChange={(e) => onChange({ step: Number(e.target.value) })} className={cn(inputCls, "tabular-nums")} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time of day */}
      <div className={sectionCls}>
        <label className={labelCls}>{copy.timeOfDayLabel}</label>
        <div className={cn(trayCls, "grid-cols-4")}>
          {TIMES.map((t) => (
            <button key={t.value ?? "any"} onClick={() => onChange({ timeOfDay: t.value })} className={cn(segCls(x.timeOfDay === t.value), "flex-col gap-0.5 min-h-[52px]")}>
              {/* Icon above label so four options fit a phone width without truncating */}
              {t.icon ?? <span className="h-4" />}
              <span className="truncate max-w-full">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active dates */}
      <div className={sectionCls}>
        <label className={labelCls}>
          <Icons.calendar className="w-4 h-4" /> {copy.datesLabel}
        </label>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <span className={smallLabelCls}>{copy.startDateLabel}</span>
            <div className={fieldCls}>
              <input type="date" value={x.startDate} max={x.endDate || undefined} onChange={(e) => onChange({ startDate: e.target.value })} className={cn(inputCls, isRetro && "text-sm")} />
            </div>
          </div>
          <div>
            <span className={smallLabelCls}>{copy.endDateLabel}</span>
            <div className={fieldCls}>
              <input type="date" value={x.endDate} min={x.startDate || undefined} onChange={(e) => onChange({ endDate: e.target.value })} className={cn(inputCls, isRetro && "text-sm")} />
            </div>
          </div>
        </div>
        <p className={cn("font-theme mt-2", isRetro ? "text-th-primary/40 text-[9px] uppercase tracking-widest" : "text-th-text-secondary text-xs")}>{copy.datesHint}</p>
      </div>

      {/* Reminder */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <label className={labelCls}>
            <Icons.notifications className="w-4 h-4" /> {copy.reminderLabel}
          </label>
          <Switch on={x.reminderOn} onToggle={() => onChange({ reminderOn: !x.reminderOn })} label={copy.reminderLabel} />
        </div>
        {x.reminderOn && (
          <div className="mt-3 flex items-center gap-3">
            <div className={cn(fieldCls, "w-32 flex-shrink-0")}>
              <input type="time" value={x.reminderTime} onChange={(e) => onChange({ reminderTime: e.target.value })} className={cn(inputCls, "tabular-nums")} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer min-w-0">
              <input type="checkbox" checked={x.onlyIfNotDone} onChange={(e) => onChange({ onlyIfNotDone: e.target.checked })} className="w-4 h-4 flex-shrink-0 accent-th-primary" />
              <span className={cn("font-theme", isRetro ? "text-th-primary/70 text-[10px] uppercase tracking-widest" : "text-th-text text-sm")}>{copy.reminderOnlyIfNotDone}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Switch ───────────────────────────────────────────────────────────────────
// Same look as the settings page toggle: mechanical in retro, pill in soft.

export function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const { isRetro } = useTheme();
  return isRetro ? (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn("w-16 h-8 rounded-sm p-1 transition-all duration-300 relative overflow-hidden flex items-center bg-th-surface", on ? "shadow-mech-in justify-end" : "shadow-mech-out justify-start")}
    >
      <div className={cn("w-6 h-full rounded-sm transition-colors duration-300 border border-black/20", on ? "bg-th-success shadow-[0_0_8px_rgb(var(--th-success)/0.8)]" : "bg-th-surface-light")} />
    </button>
  ) : (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn("th-switch w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center shadow-neu-in flex-shrink-0", on ? "bg-th-success justify-end" : "bg-th-surface-dark/20 justify-start")}
    >
      <div className="w-4 h-4 rounded-full bg-th-btn-text shadow-sm" />
    </button>
  );
}
