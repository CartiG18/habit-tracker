"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";

export default function AuthPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const { isRetro } = useTheme();
  const copy = useCopy();
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

  if (isRetro) {
    return (
      <div className="min-h-screen bg-th-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md mech-panel p-4 rounded-2xl relative">
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-th-surface-dark shadow-th-inset" />

          <div className="bg-th-screen crt-screen p-8 rounded-xl border-8 border-th-surface-dark shadow-bezel-inner relative overflow-hidden">
            <div className="scanline-overlay"></div>
            <div className="absolute inset-0 bg-graph-paper pointer-events-none opacity-20"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-th-screen-light border-2 border-th-primary/50 flex items-center justify-center text-4xl mb-6 shadow-[inset_0_0_15px_rgba(255,176,0,0.3)]">
                <span className="animate-pulse">⚡</span>
              </div>
              
              <h1 className="font-theme text-3xl font-800 text-th-primary text-glow uppercase tracking-widest mb-2">
                {copy.appTitle}
              </h1>
              <p className="text-th-primary/60 font-theme text-xs uppercase tracking-[0.3em] mb-10">
                {copy.authSubtitle}
              </p>

              <button
                onClick={signInWithGoogle}
                className={`w-full py-4 border-2 font-theme font-800 text-sm uppercase tracking-widest transition-all duration-300 ${
                  init 
                    ? "bg-th-primary/10 text-th-primary border-th-primary shadow-[0_0_15px_rgba(255,176,0,0.4)] hover:bg-th-primary hover:text-th-btn-text" 
                    : "bg-th-screen-light text-th-primary/30 border-th-primary/30"
                }`}
              >
                {init ? copy.authButton : copy.authLocked}
              </button>
              
              <p className="font-theme text-th-primary/30 text-[9px] uppercase tracking-[0.2em] mt-8">
                {copy.authWarning}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Soft Theme
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-th-screen shadow-neu-out rounded-3xl p-10 flex flex-col items-center text-center border border-th-surface-dark animate-soft-enter">
        <div className="w-20 h-20 rounded-2xl bg-th-surface flex items-center justify-center text-4xl mb-6 shadow-neu-in">
          <span className="animate-pulse">⚡</span>
        </div>
        
        <h1 className="font-theme text-3xl font-700 text-th-text mb-2">
          {copy.appTitle}
        </h1>
        <p className="text-th-text-secondary font-theme text-sm mb-10">
          {copy.authSubtitle}
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={!init}
          className="w-full py-4 rounded-xl font-theme font-500 text-base transition-all duration-300 bg-th-primary text-th-btn-text hover:bg-th-primary/90 disabled:opacity-50 disabled:bg-th-surface-dark shadow-th-raised"
        >
          {init ? copy.authButton : copy.authLocked}
        </button>
      </div>
    </div>
  );
}
