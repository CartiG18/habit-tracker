"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTheme, useIcons } from "@/lib/theme-context";
import { useCopy } from "@/lib/copy";
import { THEMES, THEME_IDS } from "@/lib/themes";
import WallpaperSettings from "@/components/settings/WallpaperSettings";
import ColorSettings from "@/components/settings/ColorSettings";
import ArchivedHabits from "@/components/settings/ArchivedHabits";
import { enablePush } from "@/lib/push";

export default function SettingsPage() {
  const { user, userProfile, signOut } = useAuth();
  const { theme, setTheme, isRetro } = useTheme();
  const copy = useCopy();
  const Icons = useIcons();
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
      // Registers this device for pushes (Safari: only inside the installed home-screen app)
      const result = await enablePush(user.uid).catch(() => "unsupported" as const);
      if (result === "unsupported") {
        toast.error(copy.toastNotifUnsupported);
        return;
      }
      if (result === "denied") {
        toast.error(copy.toastPermDenied);
        return;
      }
    }

    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    try {
      await updateDoc(doc(db, "users", user.uid), { notificationsEnabled: newVal });
      toast.success(newVal ? copy.toastAlertsOn : copy.toastAlertsOff);
    } catch (err: any) {
      console.error("Save notification setting error:", err);
      setNotifEnabled(!newVal);
      toast.error(copy.toastSaveFailed);
    }
  }

  async function saveReminderTime(time: string) {
    if (!user) return;
    setReminderTime(time);
    try {
      await updateDoc(doc(db, "users", user.uid), { reminderTime: time });
    } catch (err: any) {
      console.error("Save reminder time error:", err);
      toast.error(copy.toastSaveFailed);
    }
  }

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto pb-32 relative z-20">
      <div className={cn("mb-6 flex flex-col pb-4", isRetro ? "border-b border-th-primary/30" : "")}>
        <p className={cn("font-theme transition-colors mb-1", isRetro ? "text-th-primary/60 text-xs uppercase tracking-widest" : "text-th-text-secondary text-sm")}>
          {copy.settingsModule}
        </p>
        <h1 className={cn("font-display transition-colors", isRetro ? "text-xl font-800 text-th-primary uppercase text-glow" : "text-3xl font-700 text-th-text")}>
          {copy.settingsTitle}
        </h1>
      </div>

      {/* Profile card */}
      <div className={cn("p-5 mb-6 flex items-center gap-5 relative overflow-hidden transition-colors",
        isRetro ? "bg-th-screen-light/30 border border-th-primary/30" : "bg-th-surface rounded-2xl shadow-neu-out"
      )}>
        {isRetro && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        )}
        
        <div className={cn("flex items-center justify-center text-xl overflow-hidden relative z-10 transition-colors",
          isRetro 
            ? "w-14 h-14 bg-th-screen border-2 border-th-primary/50 shadow-[inset_0_0_10px_rgb(var(--th-primary)/0.3)]"
            : "w-16 h-16 rounded-full bg-th-surface shadow-neu-in"
        )}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              className={cn("w-full h-full object-cover", isRetro && "grayscale opacity-80 mix-blend-screen")}
              alt="avatar"
            />
          ) : (
            <span className={cn("font-theme", isRetro ? "font-800 text-th-primary" : "font-700 text-th-text")}>
              {user?.displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div className="relative z-10">
          <p className={cn("font-theme leading-tight transition-colors",
            isRetro ? "font-800 text-th-primary text-lg uppercase tracking-widest text-glow" : "font-700 text-th-text text-xl"
          )}>
            {user?.displayName ?? copy.userFallback}
          </p>
          <p className={cn("font-theme transition-colors mt-1",
            isRetro ? "text-th-primary/50 text-[10px] uppercase tracking-widest" : "text-th-text-secondary text-sm"
          )}>
            {copy.emailPrefix}{user?.email}
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className={cn("mb-6 relative overflow-hidden transition-colors",
        isRetro ? "bg-th-screen-light/30 border border-th-primary/30" : "bg-th-surface rounded-2xl shadow-neu-out"
      )}>
        {isRetro && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        )}
        
        <div className={cn("px-5 py-3 relative z-10", isRetro ? "border-b border-th-primary/20 bg-th-primary/5" : "")}>
          <p className={cn("font-theme flex items-center gap-2", 
            isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-[0.2em]" : "th-label text-th-text-secondary text-sm font-500"
          )}>
            <Icons.appearance className="w-4 h-4" /> {copy.appearanceLabel}
          </p>
        </div>

        <div className="p-5 relative z-10 grid grid-cols-2 gap-4">
          {THEME_IDS.map((id) => {
            const option = THEMES[id];
            const active = theme === id;
            const Icon = option.icon;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn("flex flex-col items-center p-4 transition-all",
                  isRetro
                    ? ["border-2", active ? "border-th-primary bg-th-primary/10 shadow-[0_0_10px_rgb(var(--th-primary)/0.2)]" : "border-th-primary/20 opacity-50"]
                    : ["rounded-xl bg-th-surface", active ? "shadow-neu-in" : "shadow-neu-out hover:shadow-neu-in"]
                )}
              >
                <Icon className={cn("w-6 h-6 mb-2", active ? "text-th-primary" : "text-th-text-secondary")} />
                <span className={cn("font-theme",
                  isRetro ? "text-[10px] font-700 uppercase tracking-widest" : "text-sm font-500",
                  active ? (isRetro ? "text-th-primary" : "text-th-text") : (isRetro ? "text-th-primary/60" : "text-th-text-secondary")
                )}>
                  {option.name}
                </span>
                <span className={cn("font-theme mt-1",
                  isRetro ? "text-[8px] uppercase tracking-widest text-th-primary/40" : "text-xs text-th-text-secondary"
                )}>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Wallpaper — soft-base themes (retro keeps its CRT screen) */}
        {!isRetro && <WallpaperSettings />}
        {!isRetro && <ColorSettings />}
      </div>

      {/* Notifications - Toggle */}
      <div className={cn("mb-6 relative overflow-hidden transition-colors",
        isRetro ? "bg-th-screen-light/30 border border-th-primary/30" : "bg-th-surface rounded-2xl shadow-neu-out"
      )}>
        {isRetro && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        )}
        
        <div className={cn("px-5 py-3 relative z-10", isRetro ? "border-b border-th-primary/20 bg-th-primary/5" : "")}>
          <p className={cn("font-theme flex items-center gap-2",
            isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-[0.2em]" : "th-label text-th-text-secondary text-sm font-500"
          )}>
            <Icons.notifications className="w-4 h-4" /> {copy.notificationsLabel}
          </p>
        </div>

        <div className="p-5 relative z-10">
          <div className="flex items-center justify-between">
            <span className={cn("font-theme transition-colors",
              isRetro ? "font-800 text-th-primary text-sm uppercase tracking-widest" : "font-500 text-th-text text-base"
            )}>
              {copy.alertsLabel}
            </span>
            
            {/* Toggle Switch */}
            {isRetro ? (
              // Mechanical Switch
              <button
                onClick={toggleNotifications}
                className={cn(
                  "w-16 h-8 rounded-sm p-1 transition-all duration-300 relative overflow-hidden flex items-center bg-th-surface",
                  notifEnabled ? "shadow-mech-in justify-end" : "shadow-mech-out justify-start"
                )}
              >
                <div className={cn(
                  "w-6 h-full rounded-sm transition-colors duration-300 border border-black/20",
                  notifEnabled ? "bg-th-success shadow-[0_0_8px_rgb(var(--th-success)/0.8)]" : "bg-th-surface-light"
                )} />
              </button>
            ) : (
              // Soft Switch
              <button
                onClick={toggleNotifications}
                className={cn(
                  "w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center shadow-neu-in",
                  notifEnabled ? "bg-th-success justify-end" : "bg-th-surface-dark/20 justify-start"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-th-btn-text shadow-sm" />
              </button>
            )}
          </div>

          {notifEnabled && (
            <div className={cn("mt-5 pt-5 animate-fade-in flex items-center justify-between",
              isRetro ? "border-t border-th-primary/20" : ""
            )}>
              <span className={cn("font-theme transition-colors",
                isRetro ? "text-th-primary/60 text-[10px] uppercase tracking-widest" : "th-label text-th-text-secondary text-sm font-500"
              )}>
                {copy.timeLabel}
              </span>
              <div className={cn("flex items-center px-3",
                isRetro ? "border-b-2 border-th-primary/50 bg-th-screen-light/30" : "bg-th-surface shadow-neu-in rounded-xl"
              )}>
                {isRetro && <span className="text-th-primary/40 font-theme text-xs">{`>`}</span>}
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => saveReminderTime(e.target.value)}
                  className={cn("bg-transparent py-2 px-2 font-theme outline-none transition-colors",
                    isRetro ? "text-th-primary text-sm focus:bg-th-primary/5" : "text-th-text text-base"
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Archived habits */}
      <ArchivedHabits />

      {/* Account */}
      <div className={cn("mb-8 relative overflow-hidden transition-colors",
        isRetro ? "bg-th-screen-light/30 border border-th-primary/30" : "bg-th-surface rounded-2xl shadow-neu-out"
      )}>
        {isRetro && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        )}
        
        <div className={cn("px-5 py-3 relative z-10", isRetro ? "border-b border-th-primary/20 bg-th-primary/5" : "")}>
          <p className={cn("font-theme flex items-center gap-2",
            isRetro ? "text-th-primary/60 text-[10px] font-700 uppercase tracking-[0.2em]" : "th-label text-th-text-secondary text-sm font-500"
          )}>
            <Icons.account className="w-4 h-4" /> {copy.accountLabel}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className={cn("w-full flex items-center justify-center gap-3 px-5 py-4 transition-colors group relative z-10 font-theme",
            isRetro 
              ? "hover:bg-th-danger/10 text-th-danger border-2 border-transparent hover:border-th-danger/30 font-800 text-sm uppercase tracking-widest"
              : "text-th-danger hover:bg-red-50 font-500 text-base"
          )}
        >
          <Icons.logout className="w-4 h-4" />
          <span>{copy.logoutButton}</span>
        </button>
      </div>

      <div className={cn("text-center space-y-2 py-8 relative z-10 font-theme",
        isRetro ? "text-th-primary/40" : "text-th-text-secondary/60"
      )}>
        <p className={cn("uppercase", isRetro ? "text-[9px] tracking-[0.3em]" : "text-xs font-500 tracking-wide")}>
          {copy.versionText}
        </p>
        {copy.copyrightText && (
          <p className="text-[8px] uppercase tracking-[0.2em] text-th-primary/20">
            {copy.copyrightText}
          </p>
        )}
      </div>
    </div>
  );
}
