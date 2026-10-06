"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { deleteHabit, restoreHabit } from "@/lib/habits";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme, useIcons } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

/**
 * Archived habits (history kept) with Restore and a two-tap permanent Delete.
 * Lightweight: listens to the habit docs only — no stats queries.
 */
export default function ArchivedHabits() {
  const { user } = useAuth();
  const { isRetro, def } = useTheme();
  const copy = useCopy();
  const Icons = useIcons();
  const showDecor = def.habitDecor !== false;
  const [archived, setArchived] = useState<Habit[]>([]);
  const [armed, setArmed] = useState<string | null>(null);
  const armTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "habits"), where("userId", "==", user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Habit)).filter((h) => h.archivedAt);
        setArchived(list.sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? "")));
      },
      (err) => console.error("Archived habits listener error:", err)
    );
  }, [user]);

  useEffect(() => () => clearTimeout(armTimer.current), []);

  async function handleRestore(id: string) {
    try {
      await restoreHabit(id);
      toast.success(copy.toastRestored);
    } catch (err) {
      console.error("Restore error:", err);
      toast.error(copy.toastSaveFailed);
    }
  }

  async function handleDelete(id: string) {
    if (armed !== id) {
      setArmed(id);
      clearTimeout(armTimer.current);
      armTimer.current = setTimeout(() => setArmed(null), 3000);
      return;
    }
    if (!user) return;
    try {
      await deleteHabit(user.uid, id);
      toast.success(copy.toastDeleted);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(copy.toastSaveFailed);
    }
    setArmed(null);
  }

  return (
    <div className={cn("mb-6 relative overflow-hidden transition-colors",
      isRetro ? "bg-th-screen-light/30 border border-th-primary/30" : "bg-th-surface rounded-2xl shadow-neu-out"
    )}>
      {isRetro && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
      )}
      <div className={cn("px-5 py-3 relative z-10", isRetro ? "border-b border-th-primary/20 bg-th-primary/5" : "")}>
        <p className={cn("font-theme flex items-center gap-2",
          isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-[0.2em]" : "th-label text-th-text-secondary text-sm font-500"
        )}>
          <Icons.archive className="w-4 h-4" /> {copy.archivedSection}
        </p>
      </div>

      <div className="px-5 pb-5 pt-1 relative z-10">
        {archived.length === 0 ? (
          <p className={cn("font-theme py-3", isRetro ? "text-th-primary/40 text-[10px] uppercase tracking-widest" : "text-th-text-secondary text-sm")}>
            {copy.archivedEmpty}
          </p>
        ) : (
          <div className="space-y-2">
            {archived.map((h) => (
              <div key={h.id} className={cn("flex items-center gap-3 py-2", isRetro && "border-b border-th-primary/10 last:border-0")}>
                {showDecor && <span className="text-lg opacity-60">{h.emoji}</span>}
                <div className="flex-1 min-w-0">
                  <p className={cn("truncate font-theme", isRetro ? "text-sm font-700 uppercase tracking-widest text-th-primary/70" : "text-base font-500 text-th-text")}>{h.name}</p>
                  {h.archivedAt && (
                    <p className={cn("font-theme", isRetro ? "text-[9px] uppercase tracking-widest text-th-primary/40" : "text-xs text-th-text-secondary")}>
                      {format(parseISO(h.archivedAt), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <button onClick={() => handleRestore(h.id)} aria-label={copy.restoreButton}
                  className={cn("flex items-center gap-1.5 px-3 py-2 font-theme flex-shrink-0 transition-colors",
                    isRetro ? "border border-th-primary/50 text-th-primary text-[10px] font-700 uppercase tracking-widest hover:bg-th-primary/10" : "rounded-lg bg-th-screen text-th-text text-sm font-500 shadow-neu-out")}>
                  <Icons.resume className="w-4 h-4" /> {copy.restoreButton}
                </button>
                <button onClick={() => handleDelete(h.id)} aria-label={copy.deleteButton}
                  className={cn("w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors",
                    isRetro
                      ? ["border", armed === h.id ? "border-th-danger bg-th-danger/20 text-th-danger" : "border-th-danger/40 text-th-danger/60"]
                      : ["rounded-lg", armed === h.id ? "bg-th-danger text-white" : "text-th-danger"])}>
                  <Icons.delete className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
