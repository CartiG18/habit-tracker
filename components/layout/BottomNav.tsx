"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Today" },
  { href: "/dashboard/progress", icon: BarChart2, label: "Progress" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-lg mx-auto">
        <div className="glass border-t border-white/10 bottom-nav">
          <div className="flex items-center justify-around px-2 pt-3">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-5 pb-1 transition-all",
                    active ? "text-emerald-400" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
                  <span className="text-[10px] font-display font-600">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
