"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme, useIcons } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

interface Props {
  habits: Habit[];
  onDone: (orderedIds: string[]) => void;
}

/**
 * Drag-to-reorder for all active habits. Dragging starts only from the handle,
 * so the list still scrolls normally on touch screens.
 */
export default function ArrangeList({ habits, onDone }: Props) {
  const { isRetro } = useTheme();
  const copy = useCopy();
  const [items, setItems] = useState(habits);

  return (
    <div className="space-y-3">
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((h) => (
          <ArrangeRow key={h.id} habit={h} />
        ))}
      </Reorder.Group>
      <button
        onClick={() => onDone(items.map((h) => h.id))}
        className={cn(
          "th-btn-primary w-full py-3 font-theme transition-all",
          isRetro
            ? "border-2 border-th-primary bg-th-primary text-th-btn-text font-800 text-xs uppercase tracking-widest"
            : "rounded-xl bg-th-primary text-th-btn-text font-700 text-sm shadow-th-raised"
        )}
      >
        {copy.arrangeDone}
      </button>
    </div>
  );
}

function ArrangeRow({ habit }: { habit: Habit }) {
  const controls = useDragControls();
  const { isRetro, def } = useTheme();
  const Icons = useIcons();
  const showDecor = def.habitDecor !== false;

  return (
    <Reorder.Item
      value={habit}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02 }}
      className={cn(
        "th-card flex items-center gap-3 select-none",
        isRetro
          ? "p-3 bg-th-screen-light border border-th-primary/30"
          : "p-3 bg-th-surface border border-th-surface-dark/10 shadow-neu-out rounded-xl"
      )}
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder"
        className={cn("w-11 h-11 -my-2 -ml-1 flex items-center justify-center flex-shrink-0 touch-none cursor-grab active:cursor-grabbing",
          isRetro ? "text-th-primary/60" : "text-th-text-secondary")}
      >
        <Icons.grip className="w-5 h-5" />
      </button>
      {showDecor && <span className="text-lg opacity-80">{habit.emoji}</span>}
      <span className={cn("truncate font-theme",
        isRetro ? "font-700 text-sm uppercase tracking-widest text-th-primary text-glow" : "font-500 text-base text-th-text")}>
        {habit.name}
      </span>
    </Reorder.Item>
  );
}
