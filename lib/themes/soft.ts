import { LayoutTemplate, Cpu, Activity, SlidersHorizontal } from "lucide-react";
import type { ThemeDefinition } from "@/lib/themes/types";
import { LUCIDE_ICONS } from "@/lib/themes/lucideIcons";

// ─── Soft Focus ───────────────────────────────────────────────────────────────
// Calm parchment paper, neumorphic shadows, rounded cards.
// Base theme for every `base: "soft"` theme.

export const soft: ThemeDefinition = {
  name: "Soft Focus",
  description: "Clean, modern look",
  icon: LayoutTemplate,
  base: "soft",

  colors: {
    surface:      "#F0ECE3", // parchment
    surfaceDark:  "#D4CFC6",
    surfaceLight: "#FAF8F5",
    screen:       "#FFFFFF",
    screenDark:   "#F5F1EC",
    screenLight:  "#FFFFFF",
    primary:      "#7C83FD", // periwinkle
    success:      "#66BB6A", // sage
    text:         "#3A3A3A", // charcoal
    btnText:      "#FFFFFF",
  },
  opacity: {
    primaryDim: 0.12,
    primaryGlow: 0.2,
    successDim: 0.15,
    textSecondary: 0.5,
  },
  fonts: { body: "sans" },
  background: {
    image: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`,
  },
  shadows: {
    raised: "none",
    inset:  "none",
    neuOut: "6px 6px 14px rgba(174,168,157,0.35), -6px -6px 14px rgba(255,255,255,0.85)",
    neuIn:  "inset 3px 3px 6px rgba(174,168,157,0.3), inset -3px -3px 6px rgba(255,255,255,0.7)",
  },
  radius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem" },
  effects: { glow: false, scanlines: false, flicker: false, grid: false },
  navIcons: { main: Cpu, diag: Activity, cfg: SlidersHorizontal },
  icons: LUCIDE_ICONS,
  marker: "circle",

  bootLines: [],
  toast: {
    background: "rgb(var(--th-screen))",
    color: "rgb(var(--th-text))",
    border: "1px solid rgb(var(--th-surface-dark))",
    borderRadius: "16px",
    fontFamily: "var(--font-theme)",
    boxShadow: "0 4px 6px rgba(174,168,157,0.3)",
  },
  metaColor: "#F0ECE3",

  copy: {
    // Auth
    appTitle: "Synapse",
    appEmblem: "⚡",
    emptyEmblem: "○",
    authSubtitle: "Sign in to continue",
    authButton: "Sign in with Google",
    authLocked: "Loading…",
    authWarning: "",
    bootLoading: "Loading…",
  
    // Dashboard header
    greetingPrefix: "Hi,",
    dateLabelCurrent: "Today",
    dateLabelPrefix: "",
  
    // Habit list
    activeHabits: "Today's Habits",
    habitCount: "",
    noHabits: "No habits yet",
    noHabitsHint: "Tap + to create your first habit",
  
    // Add / Edit
    addHabitTitle: "New Habit",
    editHabitTitle: "Edit Habit",
    labelIcon: "Icon",
    labelName: "Habit Name",
    labelColor: "Color",
    labelSchedule: "Schedule",
    inputPlaceholder: "Enter habit name…",
    subtasksLabel: "Subtasks",
    addSubtaskButton: "+ Add subtask",
    subtaskPlaceholder: "Subtask description…",
    savingText: "Saving…",
    saveButton: "Create Habit",
    updateButton: "Save Changes",
  
    // Schedule tabs
    scheduleDays: "Days",
    scheduleDates: "Dates",
    scheduleFreqWeek: "Per Week",
    scheduleFreqMonth: "Per Month",
    targetLabel: "Goal",
  
    // Detail modal
    detailSubtitle: "Details",
    executeButton: "Mark Complete",
    completedButton: "Completed ✓",
    streakLabel: "Streak",
    successLabel: "Success",
    maxStreakLabel: "Best",
    timelineLabel: "This Week",
    noteLabel: "Notes",
    saveNoteButton: "Save Note",
    savingNoteText: "Saving…",
    deleteButton: "Delete Habit",
    deleteConfirm: "Tap again to delete",
    notePlaceholder: "Write a note…",
    dataPrefix: "",
    seqPrefix: "",
  
    // Daily progress
    allDone: "All Done!",
    allDoneHint: "Every habit completed today",
    loadPrefix: "",
    pendingSuffix: "remaining",
  
    // Daily plan
    planButtonCreate: "Plan Today",
    planButtonEdit: "Edit Plan",
    planModalTitle: "Today's Plan",
    planModalHint: "Choose which habits you want to complete today",
    planEmptyState: "No habits yet — create one first",
    planAutoTag: "Every day",
    planSaveButton: "Save Plan",
    addToPlanButton: "+ Add a habit",
  
    // Progress page
    progressModule: "Progress",
    progressTitle: "Your Progress",
    scopeWeek: "This Week",
    scopeMonth: "This Month",
    streaksSection: "Active Streaks",
    overviewSection: "Overview",
    yieldLabel: "Rate",
  
    // Settings page
    settingsModule: "Settings",
    settingsTitle: "Preferences",
    notifSection: "Notifications",
    notificationsLabel: "Notifications",
    notifLabel: "Reminders",
    notifTime: "Reminder Time",
    alertsLabel: "Reminders",
    timeLabel: "Reminder Time",
    appearanceLabel: "Appearance",
    accountLabel: "Account",
    logoutButton: "Sign Out",
    signOutSection: "Account",
    signOutButton: "Sign Out",
    themeSection: "Appearance",
    colorsLabel: "Colors",
    colorSurface: "Tiles",
    colorScreen: "Background",
    colorPrimary: "Accent",
    colorSuccess: "Done",
    colorText: "Text",
    colorDefault: "Default",
    colorCustom: "Custom",
    colorsReset: "Reset colors",
    wallpaperLabel: "Wallpaper",
    wallpaperUpload: "Upload photo",
    wallpaperSourceTheme: "Theme",
    wallpaperSourceCustom: "My photo",
    wallpaperSourceNone: "None",
    wallpaperFitCover: "Fill",
    wallpaperFitContain: "Fit",
    wallpaperFitTile: "Tile",
    wallpaperZoom: "Zoom",
    wallpaperPosX: "Left / Right",
    wallpaperPosY: "Up / Down",
    wallpaperDim: "Soften",
    wallpaperReset: "Reset adjustments",
    wallpaperDragHint: "Drag the preview to reposition",
    toastWallpaperSaved: "Wallpaper updated",
    toastWallpaperFailed: "Couldn't use that image — try another photo",
    userFallback: "User",
    emailPrefix: "",
    versionText: "Synapse v3.0",
    copyrightText: "",
  
    // Nav
    navMain: "Home",
    navDiag: "Progress",
    navCfg: "Settings",
  
    // Toasts
    toastCreated: "Habit created",
    toastUpdated: "Habit updated",
    toastArchived: "Habit deleted",
    toastPermDenied: "Permission denied",
    toastAlertsOn: "Reminders enabled",
    toastAlertsOff: "Reminders disabled",
    toastNotifUnsupported: "Notifications aren't supported in this browser — try adding the app to your home screen",
    toastSaveFailed: "Couldn't save — please try again",
  },
};
