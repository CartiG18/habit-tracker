"use client";

interface Props {
  completed: number;
  total: number;
  allDone: boolean;
}

export default function DailyProgress({ completed, total, allDone }: Props) {
  const pct = total > 0 ? completed / total : 0;
  const bars = 20;
  const activeBars = Math.round(pct * bars);

  return (
    <div className="p-4 bg-basalt-light border border-amber/30 flex items-center gap-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>

      {/* Bar Chart / Oscilloscope feeling */}
      <div className="flex gap-1 items-end h-16 w-32 flex-shrink-0 z-10 border-b border-amber/50 pb-1">
        {Array.from({ length: bars }).map((_, i) => {
          const isActive = i < activeBars;
          return (
            <div
              key={i}
              className="flex-1 w-full rounded-sm transition-all duration-300"
              style={{
                height: isActive ? `${Math.max(10, Math.random() * 80 + 20)}%` : '4px',
                background: isActive ? (allDone ? "var(--signal)" : "var(--amber)") : "var(--basalt)",
                border: isActive ? "none" : "1px solid rgba(255,176,0,0.3)",
                boxShadow: isActive ? `0 0 5px ${allDone ? "rgba(50,205,50,0.6)" : "rgba(255,176,0,0.6)"}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Text */}
      <div className="flex-1 z-10">
        {allDone ? (
          <>
            <p className="font-mono font-800 text-signal text-lg uppercase tracking-widest text-signal">
              SYS.OPTIMAL
            </p>
            <p className="text-signal/60 text-[10px] font-mono uppercase tracking-widest mt-1">
              ALL PROCESSES COMPLETE
            </p>
          </>
        ) : (
          <>
            <p className="font-mono font-700 text-amber text-lg uppercase text-glow">
              LOAD: {Math.round(pct * 100)}%
            </p>
            <p className="text-amber/60 text-[10px] font-mono uppercase tracking-widest mt-1">
              {total - completed} PENDING PROCESSES
            </p>
          </>
        )}
      </div>
    </div>
  );
}
