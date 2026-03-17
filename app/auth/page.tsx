"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
    const timer = setTimeout(() => setInit(true), 500);
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-putty flex items-center justify-center p-4">
      <div className="w-full max-w-md mech-panel p-4 rounded-2xl relative">
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-putty-dark shadow-mech-in" />

        <div className="bg-basalt crt-screen p-8 rounded-xl border-8 border-putty-dark shadow-bezel-inner relative overflow-hidden">
          <div className="scanline-overlay"></div>
          <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-basalt-light border-2 border-amber/50 flex items-center justify-center text-4xl mb-6 shadow-[inset_0_0_15px_rgba(255,176,0,0.3)]">
              <span className="animate-pulse">⚡</span>
            </div>
            
            <h1 className="font-mono text-3xl font-800 text-amber text-glow uppercase tracking-widest mb-2">
              SYNAPSE_OS
            </h1>
            <p className="text-amber/60 font-mono text-xs uppercase tracking-[0.3em] mb-10">
              SECURE UPLINK REQUIRED
            </p>

            <button
              onClick={signInWithGoogle}
              className={`w-full py-4 border-2 font-mono font-800 text-sm uppercase tracking-widest transition-all duration-300 ${
                init 
                  ? "bg-amber/10 text-amber border-amber shadow-[0_0_15px_rgba(255,176,0,0.4)] hover:bg-amber hover:text-basalt" 
                  : "bg-basalt-light text-amber/30 border-amber/30"
              }`}
            >
              {init ? "> INIT_OAUTH_SEQ" : "SYSTEM_LOCKED"}
            </button>
            
            <p className="font-mono text-amber/30 text-[9px] uppercase tracking-[0.2em] mt-8">
              UNAUTHORIZED ACCESS STRICTLY PROHIBITED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
