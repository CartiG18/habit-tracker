"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LogOut, Bell, BellOff, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(
    userProfile?.notificationsEnabled ?? false
  );
  const [reminderTime, setReminderTime] = useState(
    userProfile?.reminderTime ?? "08:00"
  );

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  async function toggleNotifications() {
    if (!user) return;

    if (!notifEnabled) {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("PERMISSION_DENIED");
        return;
      }
    }

    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    await updateDoc(doc(db, "users", user.uid), {
      notificationsEnabled: newVal,
    });
    toast.success(newVal ? "ALERTS_ENABLED" : "ALERTS_DISABLED");
  }

  async function saveReminderTime(time: string) {
    if (!user) return;
    setReminderTime(time);
    await updateDoc(doc(db, "users", user.uid), { reminderTime: time });
  }

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto pb-32 relative z-20">
      <div className="mb-6 flex flex-col border-b border-amber/30 pb-4">
        <p className="text-amber/60 font-mono text-xs uppercase tracking-widest mb-1">
          SYS.MODULE: CONFIGURATION
        </p>
        <h1 className="font-mono text-xl font-800 text-amber uppercase text-glow">
          SYS_PREFERENCES
        </h1>
      </div>

      {/* Profile card */}
      <div className="p-5 mb-6 flex items-center gap-5 bg-basalt-light/30 border border-amber/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="w-14 h-14 bg-basalt border-2 border-amber/50 flex items-center justify-center text-xl overflow-hidden relative z-10 shadow-[inset_0_0_10px_rgba(255,176,0,0.3)]">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              className="w-full h-full object-cover grayscale opacity-80 mix-blend-screen"
              alt="avatar"
            />
          ) : (
            <span className="font-mono font-800 text-amber">
              {user?.displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div className="relative z-10">
          <p className="font-mono font-800 text-amber text-lg leading-tight uppercase tracking-widest text-glow">
            {user?.displayName ?? "OPERATOR"}
          </p>
          <p className="text-amber/50 text-[10px] font-mono uppercase tracking-widest mt-1">ID: {user?.email}</p>
        </div>
      </div>

      {/* Notifications - Mechanical Toggle */}
      <div className="bg-basalt-light/30 border border-amber/30 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="px-5 py-3 border-b border-amber/20 bg-amber/5 relative z-10">
          <p className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-[0.2em] flex items-center gap-2">
            <Bell className="w-3 h-3" /> COMM_LINK
          </p>
        </div>

        <div className="p-5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-mono font-800 text-amber text-sm uppercase tracking-widest">
              SYSTEM_ALERTS
            </span>
            
            {/* Mechanical Switch */}
            <button
              onClick={toggleNotifications}
              className={cn(
                "w-16 h-8 rounded-sm p-1 transition-all duration-300 relative overflow-hidden flex items-center",
                notifEnabled ? "bg-basalt shadow-mech-in justify-end" : "bg-putty shadow-mech-out justify-start"
              )}
            >
              <div className={cn(
                "w-6 h-full rounded-sm transition-colors duration-300 border border-black/20",
                notifEnabled ? "bg-signal shadow-[0_0_8px_rgba(50,205,50,0.8)]" : "bg-putty-light"
              )} />
            </button>
          </div>

          {notifEnabled && (
            <div className="mt-5 pt-5 border-t border-amber/20 animate-fade-in flex items-center justify-between">
              <span className="text-amber/60 font-mono text-[10px] uppercase tracking-widest">TRANSMISSION_TIME</span>
              <div className="flex items-center border-b-2 border-amber/50 bg-basalt-light/30 px-2">
                <span className="text-amber/40 font-mono text-xs">{`>`}</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => saveReminderTime(e.target.value)}
                  className="bg-transparent py-2 px-2 text-amber font-mono text-sm outline-none focus:bg-amber/5 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="bg-basalt-light/30 border border-amber/30 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="px-5 py-3 border-b border-amber/20 bg-amber/5 relative z-10">
          <p className="text-amber/60 text-[10px] font-mono font-700 uppercase tracking-[0.2em] flex items-center gap-2">
            <Settings className="w-3 h-3" /> SYS_POWER
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 hover:bg-red-500/10 transition-colors text-red-500 border-2 border-transparent hover:border-red-500/30 group relative z-10"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-mono font-800 text-sm uppercase tracking-widest">TERMINATE_SESSION</span>
        </button>
      </div>

      <div className="text-center space-y-2 py-8 relative z-10">
        <p className="font-mono text-amber/40 text-[9px] uppercase tracking-[0.3em]">
          SYNAPSE OS v3.0
        </p>
        <p className="font-mono text-amber/20 text-[8px] uppercase tracking-[0.2em]">
          (C) 1986 NEURAL DYNAMICS INC.
        </p>
      </div>
    </div>
  );
}
