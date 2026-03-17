"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "@/components/layout/BottomNav";

const BOOT_TEXT = [
  "INIT_SYS_DIAGNOSTICS...",
  "MEM_CHECK [OK]",
  "MOUNTING /dev/habits [OK]",
  "ESTABLISHING UPLINK...",
  "SYNC_STATE [OK]",
  "SYNAPSE v3.0 ONLINE",
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => setBooting(false), 2000); // 2 second boot
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-basalt flex items-center justify-center crt-screen p-8">
        <div className="w-full max-w-lg font-mono text-amber text-xs space-y-1">
          <p className="animate-pulse">AWAITING UPLINK...</p>
        </div>
      </div>
    );
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-putty flex items-center justify-center p-2 sm:p-4">
        <div className="w-full h-full max-w-lg bg-basalt crt-screen p-6 flex flex-col justify-end pb-24 border-[12px] border-putty-dark shadow-bezel-inner rounded-xl relative overflow-hidden">
          <div className="scanline-overlay"></div>
          <div className="font-mono text-amber text-sm font-700 space-y-2 text-glow flex flex-col justify-end overflow-hidden h-full">
            <div className="animate-boot-scroll overflow-hidden flex flex-col justify-end">
              {BOOT_TEXT.map((txt, i) => (
                <p key={i} className="mb-2">{`> ${txt}`}</p>
              ))}
              <p className="animate-pulse">{`> _`}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-putty flex items-center justify-center p-2 sm:p-4">
      {/* Outer physical bezel */}
      <div className="w-full h-full max-w-lg mech-panel rounded-2xl p-2 sm:p-4 flex flex-col relative">
        {/* Decorative hardware screws */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />

        {/* CRT Screen Area */}
        <div className="flex-1 bg-basalt crt-screen rounded-xl border-[8px] border-putty-dark shadow-bezel-inner relative overflow-hidden flex flex-col">
          <div className="scanline-overlay"></div>
          <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
          
          <main className="flex-1 overflow-y-auto z-20 pb-20 relative">
            {children}
          </main>
          
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
