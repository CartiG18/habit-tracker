"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Habit, DailyPlan } from "@/types";
import { HABIT_COLORS, cn } from "@/lib/utils";
import { defaultPlanHabitIds, isEveryDayHabit, scheduleLabel } from "@/lib/habits";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

interface Props {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  plan: DailyPlan | null;
  onSave: (habitIds: string[]) => Promise<void>;
}

export default function DailyPlanModal({ open, onClose, habits, plan, onSave }: Props) {
  const { isRetro } = useTheme();
  const copy = useCopy();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(plan ? plan.habitIds : defaultPlanHabitIds(habits)));
  }, [open, plan, habits]);

  function toggleHabit(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave(Array.from(selected));
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className={cn(
        "relative w-full max-w-lg transition-all animate-slide-up",
        isRetro
          ? "bg-th-surface border-4 border-th-surface-dark rounded-xl shadow-mech-out p-3"
          : "bg-th-screen border border-th-surface-dark/20 rounded-3xl shadow-neu-out p-1"
      )}>
        <div className={cn(
          "relative overflow-hidden flex flex-col max-h-[85vh]",
          isRetro
            ? "bg-th-screen crt-screen rounded-lg border-[6px] border-th-surface-dark shadow-bezel-inner"
            : "bg-th-screen rounded-3xl"
        )}>
          {isRetro && (
            <>
              <div className="scanline-overlay"></div>
              <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
            </>
          )}

          <div className={cn("flex-1 overflow-y-auto z-20 relative flex flex-col", isRetro ? "p-6" : "p-8")}>
            {/* Header */}
            <div className={cn("flex items-center justify-between mb-2 pb-4", isRetro ? "border-b border-th-primary/30" : "")}>
              <h2 className={cn(
                "font-theme text-xl transition-colors",
                isRetro ? "font-800 text-th-primary text-glow uppercase tracking-wide" : "font-700 text-th-text"
              )}>
                {copy.planModalTitle}
              </h2>
              <button onClick={onClose} className={cn(
                "p-2 transition-colors rounded-full",
                isRetro
                  ? "border border-th-primary/30 text-th-primary/60 hover:text-th-primary hover:bg-th-primary/10 rounded-none"
                  : "bg-th-surface-light text-th-text-secondary hover:bg-th-surface-dark/20"
              )}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={cn(
              "mb-4 font-theme transition-colors",
              isRetro ? "text-th-primary/60 text-[10px] uppercase tracking-widest" : "text-th-text-secondary text-sm"
            )}>
              {copy.planModalHint}
            </p>

            {/* Habit checklist */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[100px]">
              {habits.length === 0 ? (
                <div className={cn(
                  "text-center py-10 font-theme",
                  isRetro ? "text-th-primary/40 text-xs uppercase" : "text-th-text-secondary text-sm"
                )}>
                  {copy.planEmptyState}
                </div>
              ) : (
                habits.map((h) => {
                  const isSelected = selected.has(h.id);
                  const everyDay = isEveryDayHabit(h);
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggleHabit(h.id)}
                      className={cn(
                        "w-full flex items-center gap-3 text-left transition-all duration-200",
                        isRetro
                          ? ["p-3 border", isSelected ? "bg-th-primary/10 border-th-primary" : "bg-th-screen-light/30 border-th-primary/20 hover:border-th-primary/40"]
                          : ["p-3 rounded-xl", isSelected ? "bg-th-primary/10 shadow-neu-in" : "bg-th-surface hover:bg-th-surface-light"]
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 flex-shrink-0 flex items-center justify-center transition-all",
                        isRetro
                          ? ["border", isSelected ? "bg-th-primary border-th-primary text-th-btn-text" : "border-th-primary/40 text-transparent"]
                          : ["rounded-full", isSelected ? "bg-th-primary text-th-btn-text" : "border border-th-surface-dark/30 text-transparent"]
                      )}>
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </div>
                      <span className="text-lg" style={{ color: HABIT_COLORS[h.color].hex }}>{h.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "truncate font-theme",
                          isRetro ? "text-sm font-700 uppercase tracking-widest text-th-primary" : "text-base font-500 text-th-text"
                        )}>
                          {h.name}
                        </p>
                        <p className={cn(
                          "font-theme",
                          isRetro ? "text-[9px] text-th-primary/50 uppercase tracking-widest mt-0.5" : "text-xs text-th-text-secondary mt-0.5"
                        )}>
                          {everyDay ? copy.planAutoTag : scheduleLabel(h.schedule)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <button onClick={handleSave} disabled={saving}
              className={cn("w-full mt-6 py-4 transition-all duration-300 font-theme disabled:opacity-40",
                isRetro
                  ? "bg-th-primary text-th-btn-text hover:bg-th-primary/90 disabled:bg-th-primary/20 disabled:text-th-primary font-800 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--th-primary),0.4)]"
                  : "bg-th-primary text-th-btn-text rounded-xl font-700 shadow-th-raised disabled:bg-th-surface-dark"
              )}>
              {saving ? copy.savingText : copy.planSaveButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
