"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LogOut, Bell, BellOff, ChevronRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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
        toast.error("Please allow notifications in your browser settings");
        return;
      }
    }

    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    await updateDoc(doc(db, "users", user.uid), {
      notificationsEnabled: newVal,
    });
    toast.success(newVal ? "Notifications enabled" : "Notifications disabled");
  }

  async function saveReminderTime(time: string) {
    if (!user) return;
    setReminderTime(time);
    await updateDoc(doc(db, "users", user.uid), { reminderTime: time });
  }

  return (
    <div className="px-4 pt-14 safe-top max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-800 text-white">Settings</h1>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              className="w-12 h-12 rounded-full"
              alt="avatar"
            />
          ) : (
            user?.displayName?.[0]?.toUpperCase() ?? "?"
          )}
        </div>
        <div>
          <p className="font-display font-600 text-white">
            {user?.displayName ?? "Anonymous"}
          </p>
          <p className="text-white/40 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
            Notifications
          </p>
        </div>

        <button
          onClick={toggleNotifications}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {notifEnabled ? (
              <Bell className="w-5 h-5 text-emerald-400" />
            ) : (
              <BellOff className="w-5 h-5 text-white/30" />
            )}
            <span className="font-body text-white text-sm">
              Daily reminders
            </span>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition-colors ${
              notifEnabled ? "bg-emerald-500" : "bg-surface-4"
            } relative`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                notifEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {notifEnabled && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <span className="text-white/60 text-sm">Remind me at</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => saveReminderTime(e.target.value)}
              className="bg-surface-3 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-emerald-500/50"
            />
          </div>
        )}
      </div>

      {/* Account */}
      <div className="glass rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-white/40 text-xs font-display font-600 uppercase tracking-wider">
            Account
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-body text-sm">Sign out</span>
        </button>
      </div>

      <p className="text-center text-white/20 text-xs mt-8">
        Lock In • Built with Next.js + Firebase
      </p>
    </div>
  );
}
