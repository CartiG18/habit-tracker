"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isRetro } = useTheme();
  const copy = useCopy();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/auth");
    }
  }, [user, loading, router]);

  if (isRetro) {
    return (
      <div className="min-h-screen bg-th-screen flex items-center justify-center crt-screen">
        <div className="scanline-overlay"></div>
        <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 border-2 border-th-primary/50 flex items-center justify-center text-2xl shadow-[inset_0_0_10px_rgba(255,176,0,0.3)] bg-th-screen-light animate-pulse">
            ⚡
          </div>
          <p className="font-theme text-th-primary text-xs tracking-[0.3em] uppercase text-glow">
            {copy.bootLoading}
          </p>
        </div>
      </div>
    );
  }

  // Soft theme
  return (
    <div className="min-h-screen bg-th-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-soft-enter">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl bg-th-surface shadow-neu-out animate-pulse">
          ⚡
        </div>
        <p className="font-theme text-th-text-secondary text-sm">
          {copy.bootLoading}
        </p>
      </div>
    </div>
  );
}
