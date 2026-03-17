"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/auth");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-basalt flex items-center justify-center crt-screen">
      <div className="scanline-overlay"></div>
      <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
      
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="w-16 h-16 border-2 border-amber/50 flex items-center justify-center text-2xl shadow-[inset_0_0_10px_rgba(255,176,0,0.3)] bg-basalt-light animate-pulse">
          ⚡
        </div>
        <p className="font-mono text-amber text-xs tracking-[0.3em] uppercase text-glow">
          SYS.BOOT_SEQ...
        </p>
      </div>
    </div>
  );
}
