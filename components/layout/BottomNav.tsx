"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Activity, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

export default function BottomNav() {
  const pathname = usePathname();
  const { isRetro } = useTheme();
  const copy = useCopy();

  const NAV_ITEMS = [
    { href: "/dashboard", icon: Cpu, label: copy.navMain },
    { href: "/dashboard/progress", icon: Activity, label: copy.navDiag },
    { href: "/dashboard/settings", icon: SlidersHorizontal, label: copy.navCfg },
  ];

  return (
    <nav className={cn(
      "absolute bottom-0 left-0 right-0 z-40 transition-colors",
      isRetro 
        ? "bg-th-surface border-t-2 border-th-surface-dark shadow-th-raised"
        : "bg-th-surface border-t border-th-surface-dark/20 shadow-neu-out sm:rounded-b-3xl"
    )}>
      <div className="max-w-lg mx-auto flex items-center justify-between px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 px-1"
            >
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-150 relative overflow-hidden",
                isRetro 
                  ? [
                      "py-2 rounded-sm border-2",
                      active 
                        ? "bg-th-screen border-th-screen-light shadow-th-inset text-th-success" 
                        : "bg-th-surface-light border-th-surface shadow-th-raised text-th-btn-text hover:bg-th-surface"
                    ]
                  : [
                      "py-3 rounded-2xl",
                      active
                        ? "bg-th-screen shadow-neu-in text-th-primary border border-th-surface-dark/10"
                        : "bg-th-surface text-th-text-secondary hover:bg-th-surface-light"
                    ]
              )}>
                {active && isRetro && <div className="absolute inset-0 bg-th-success opacity-10" />}
                <Icon className="w-5 h-5 relative z-10" strokeWidth={active ? 2.5 : 2} />
                <span className={cn(
                  "relative z-10",
                  isRetro 
                    ? "text-[10px] font-theme font-800 uppercase tracking-widest"
                    : "text-xs font-theme font-500"
                )}>
                  {label}
                </span>
                {active && isRetro && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-th-success rounded-full shadow-[0_0_5px_rgba(50,205,50,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
