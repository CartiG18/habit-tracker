"use client";

interface Props {
  completed: number;
  total: number;
  allDone: boolean;
}

export default function DailyProgress({ completed, total, allDone }: Props) {
  const pct = total > 0 ? completed / total : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - pct * circumference;

  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-5">
      {/* Ring */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg width="80" height="80" className="absolute inset-0">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={allDone ? "#4ade80" : "#22c55e"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {allDone ? (
            <span className="text-2xl">🎉</span>
          ) : (
            <span className="font-display font-800 text-white text-lg">
              {Math.round(pct * 100)}
              <span className="text-xs text-white/40">%</span>
            </span>
          )}
        </div>
      </div>

      {/* Text */}
      <div>
        {allDone ? (
          <>
            <p className="font-display font-700 text-white text-lg">
              All done! 🔥
            </p>
            <p className="text-white/40 text-sm mt-0.5">
              You locked in today. Keep it up!
            </p>
          </>
        ) : (
          <>
            <p className="font-display font-700 text-white text-lg">
              {completed} / {total} complete
            </p>
            <p className="text-white/40 text-sm mt-0.5">
              {total - completed} habit{total - completed !== 1 ? "s" : ""} remaining today
            </p>
          </>
        )}
      </div>
    </div>
  );
}
