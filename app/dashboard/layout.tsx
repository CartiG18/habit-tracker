"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
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
  const { isRetro } = useTheme();
  const copy = useCopy();
  const router = useRouter();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => setBooting(false), isRetro ? 2000 : 300); 
      return () => clearTimeout(timer);
    }
  }, [loading, user, isRetro]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-th-screen flex items-center justify-center p-8">
        <div className="w-full max-w-lg font-theme text-th-primary text-xs space-y-1">
          <p className="animate-pulse uppercase tracking-widest">{copy.bootLoading}</p>
        </div>
      </div>
    );
  }

  if (booting) {
    if (isRetro) {
      return (
        <div className="min-h-screen bg-th-surface flex items-center justify-center p-2 sm:p-4">
          <div className="w-full h-full max-w-lg bg-th-screen crt-screen p-6 flex flex-col justify-end pb-24 border-[12px] border-th-surface-dark shadow-bezel-inner rounded-xl relative overflow-hidden">
            <div className="scanline-overlay"></div>
            <div className="font-theme text-th-primary text-sm font-700 space-y-2 text-glow flex flex-col justify-end overflow-hidden h-full">
              <div className="animate-boot-scroll overflow-hidden flex flex-col justify-end uppercase tracking-widest">
                {BOOT_TEXT.map((txt, i) => (
                  <p key={i} className="mb-2">{`> ${txt}`}</p>
                ))}
                <p className="animate-pulse">{`> _`}</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
           {/* Empty shell for smooth fade-in */}
        </div>
      );
    }
  }

  return isRetro ? (
    <RetroShell>{children}</RetroShell>
  ) : (
    <SoftShell>{children}</SoftShell>
  );
}

function RetroShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
      <div className="w-full h-full max-w-lg mech-panel rounded-2xl p-2 sm:p-4 flex flex-col relative">
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />

        <div className="flex-1 bg-th-screen crt-screen rounded-xl border-[8px] border-th-surface-dark shadow-bezel-inner relative overflow-hidden flex flex-col">
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

function SoftShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center sm:p-4">
      <div className="w-full h-full max-w-lg flex flex-col relative animate-soft-enter">
        <main className="flex-1 overflow-y-auto pb-24 relative bg-th-screen sm:rounded-3xl sm:border border-th-surface-dark sm:shadow-neu-out">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
