// ─── Theme Events ─────────────────────────────────────────────────────────────
// Tiny window-event bus so theme overlays can react to app activity
// (e.g. celebrate a completion) without components knowing about themes.

const HABIT_COMPLETE_EVENT = "synapse:habit-complete";

export function emitHabitComplete() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HABIT_COMPLETE_EVENT));
}

/** Subscribe to habit completions. Returns an unsubscribe function. */
export function onHabitComplete(cb: () => void): () => void {
  window.addEventListener(HABIT_COMPLETE_EVENT, cb);
  return () => window.removeEventListener(HABIT_COMPLETE_EVENT, cb);
}
