"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Activity, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Cpu, label: "MAIN" },
  { href: "/dashboard/progress", icon: Activity, label: "DIAG" },
  { href: "/dashboard/settings", icon: SlidersHorizontal, label: "CFG" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-putty border-t-2 border-putty-dark shadow-mech-out">
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
                "flex flex-col items-center justify-center gap-1 py-2 rounded-sm border-2 transition-all duration-150 relative overflow-hidden",
                active 
                  ? "bg-basalt border-basalt-light shadow-mech-in text-signal" 
                  : "bg-putty-light border-putty shadow-mech-out text-basalt hover:bg-putty"
              )}>
                {active && <div className="absolute inset-0 bg-signal opacity-10" />}
                <Icon className="w-5 h-5 relative z-10" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-mono font-800 uppercase tracking-widest relative z-10">{label}</span>
                {active && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-signal rounded-full shadow-[0_0_5px_rgba(50,205,50,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
