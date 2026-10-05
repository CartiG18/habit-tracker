import { Monitor, Cpu, Activity, SlidersHorizontal } from "lucide-react";
import type { ThemeDefinition } from "@/lib/themes/types";
import { LUCIDE_ICONS } from "@/lib/themes/lucideIcons";

// ─── Retro Terminal ───────────────────────────────────────────────────────────
// A 1986 NEURAL DYNAMICS INC. hardware console: putty bezel, basalt CRT,
// amber phosphor. Base theme for every `base: "retro"` theme.

export const retro: ThemeDefinition = {
  name: "Retro Terminal",
  description: "CRT / phosphor",
  icon: Monitor,
  base: "retro",

  colors: {
    surface:      "#BDB7AB", // putty
    surfaceDark:  "#8A857A",
    surfaceLight: "#E2DDD3",
    screen:       "#1A1B1E", // basalt
    screenDark:   "#0F0F12",
    screenLight:  "#2A2B30",
    primary:      "#FFB000", // amber
    success:      "#32CD32", // signal green
    text:         "#FFB000",
    btnText:      "#1A1B1E",
  },
  opacity: {
    primaryDim: 0.3,
    primaryGlow: 0.6,
    successDim: 0.3,
    textSecondary: 0.6,
  },
  fonts: { body: "mono" },
  background: {
    image: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
  },
  shadows: {
    raised: "2px 2px 0px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.6), inset -2px -2px 4px rgba(0,0,0,0.4)",
    inset:  "inset 3px 3px 6px rgba(0,0,0,0.6), inset -1px -1px 3px rgba(255,255,255,0.2)",
    neuOut: "none",
    neuIn:  "none",
  },
  radius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem" },
  effects: { glow: true, scanlines: true, flicker: true, grid: true },
  navIcons: { main: Cpu, diag: Activity, cfg: SlidersHorizontal },
  icons: LUCIDE_ICONS,
  marker: "circle",

  bootLines: [
    "INIT_SYS_DIAGNOSTICS...",
    "MEM_CHECK [OK]",
    "MOUNTING /dev/habits [OK]",
    "ESTABLISHING UPLINK...",
    "SYNC_STATE [OK]",
    "SYNAPSE v3.0 ONLINE",
  ],
  toast: {
    background: "rgb(var(--th-screen))",
    color: "rgb(var(--th-primary))",
    border: "2px solid rgb(var(--th-surface-dark))",
    borderRadius: "0px",
    fontFamily: "var(--font-theme)",
    textShadow: "0 0 5px var(--th-primary-glow)",
  },
  metaColor: "#BDB7AB",

  copy: {
    // Auth
    appTitle: "SYNAPSE_OS",
    appEmblem: "⚡",
    emptyEmblem: "_",
    authSubtitle: "SECURE UPLINK REQUIRED",
    authButton: "> INIT_OAUTH_SEQ",
    authLocked: "SYSTEM_LOCKED",
    authWarning: "UNAUTHORIZED ACCESS STRICTLY PROHIBITED",
    bootLoading: "AWAITING UPLINK...",
  
    // Dashboard header
    greetingPrefix: "OP:",
    dateLabelCurrent: "SYS.DATE: CURRENT_CYCLE",
    dateLabelPrefix: "SYS.DATE:",
  
    // Habit list
    activeHabits: "ACTIVE_PROCESSES",
    habitCount: "", // uses [N] format inline
    noHabits: "NO PROCESSES FOUND",
    noHabitsHint: "INITIALIZE NEW SEQUENCE",
  
    // Add / Edit
    addHabitTitle: "INIT_NEW_PROCESS",
    editHabitTitle: "RECONFIGURE_PROCESS",
    labelIcon: "SYS.ICON",
    labelName: "PROCESS_ID",
    labelColor: "LED_COLOR",
    labelSchedule: "EXECUTION_PARAMS",
    inputPlaceholder: "ENTER IDENTIFIER...",
    subtasksLabel: "SUB_ROUTINES",
    addSubtaskButton: "+ ADD_SUBROUTINE",
    subtaskPlaceholder: "SUBROUTINE ID...",
    savingText: "UPLOADING...",
    saveButton: "COMPILE_SEQUENCE",
    updateButton: "UPDATE_SEQUENCE",
  
    // Schedule tabs
    scheduleDays: "DAYS",
    scheduleDates: "DATES",
    scheduleFreqWeek: "FRQ/W",
    scheduleFreqMonth: "FRQ/M",
    targetLabel: "TARGET",
  
    // Detail modal
    detailSubtitle: "SYS.DIAGNOSTIC",
    executeButton: "> EXECUTE_PROCESS",
    completedButton: "[ PROCESS COMPLETED ]",
    streakLabel: "CUR.SEQ",
    successLabel: "SUCCESS",
    maxStreakLabel: "MAX.SEQ",
    timelineLabel: "TIMELINE [7D]",
    noteLabel: "OPERATOR_LOG",
    saveNoteButton: "SAVE_LOG",
    savingNoteText: "TRANSMITTING...",
    deleteButton: "DECOMMISSION_PROCESS",
    deleteConfirm: "CONFIRM_DECOMMISSION?",
    notePlaceholder: "> ENTER LOG DATA...",
    dataPrefix: "DATA:",
    seqPrefix: "SEQ:",
  
    // Daily progress
    allDone: "SYS.OPTIMAL",
    allDoneHint: "ALL PROCESSES COMPLETE",
    loadPrefix: "LOAD:",
    pendingSuffix: "PENDING PROCESSES",
  
    // Daily plan
    planButtonCreate: "INIT_DAILY_PLAN",
    planButtonEdit: "EDIT_DAILY_PLAN",
    planModalTitle: "DAILY_EXEC_PLAN",
    planModalHint: "SELECT PROCESSES TO EXECUTE TODAY",
    planEmptyState: "NO PROCESSES AVAILABLE",
    planAutoTag: "AUTO / DAILY",
    planSaveButton: "COMMIT_PLAN",
    addToPlanButton: "+ ADD_TO_PLAN",
  
    // Progress page
    progressModule: "SYS.MODULE: DIAGNOSTICS",
    progressTitle: "OP_CONSISTENCY_RPT",
    scopeWeek: "SCOPE: 7_DAYS",
    scopeMonth: "SCOPE: 30_DAYS",
    streaksSection: "ACTIVE_SEQS",
    overviewSection: "PROCESS_OVERVIEW",
    yieldLabel: "YIELD",
  
    // Settings page
    settingsModule: "SYS.MODULE: CONFIGURATION",
    settingsTitle: "SYS_PREFERENCES",
    notifSection: "COMM_LINK",
    notificationsLabel: "COMM_LINK",
    notifLabel: "SYSTEM_ALERTS",
    notifTime: "TRANSMISSION_TIME",
    alertsLabel: "SYSTEM_ALERTS",
    timeLabel: "TRANSMISSION_TIME",
    appearanceLabel: "UI_THEME",
    accountLabel: "SYS_POWER",
    logoutButton: "TERMINATE_SESSION",
    signOutSection: "SYS_POWER",
    signOutButton: "TERMINATE_SESSION",
    themeSection: "DISPLAY_MODE",
    colorsLabel: "COLOR_MATRIX",
    colorSurface: "PANEL",
    colorScreen: "SCREEN",
    colorPrimary: "ACCENT",
    colorSuccess: "SIGNAL",
    colorText: "TEXT",
    colorDefault: "DEFAULT",
    colorCustom: "CUSTOM",
    colorsReset: "RESET_COLORS",
    wallpaperLabel: "WALLPAPER",
    wallpaperUpload: "LOAD_IMAGE",
    wallpaperSourceTheme: "DEFAULT",
    wallpaperSourceCustom: "CUSTOM",
    wallpaperSourceNone: "OFF",
    wallpaperFitCover: "FILL",
    wallpaperFitContain: "FIT",
    wallpaperFitTile: "TILE",
    wallpaperZoom: "ZOOM",
    wallpaperPosX: "POS.X",
    wallpaperPosY: "POS.Y",
    wallpaperDim: "DIM",
    wallpaperReset: "RESET_PARAMS",
    wallpaperDragHint: "DRAG TO REPOSITION",
    toastWallpaperSaved: "WALLPAPER_LOADED",
    toastWallpaperFailed: "IMAGE_LOAD_FAILED",
    userFallback: "OPERATOR",
    emailPrefix: "ID: ",
    versionText: "SYNAPSE OS v3.0",
    copyrightText: "(C) 1986 NEURAL DYNAMICS INC.",
  
    // Nav
    navMain: "MAIN",
    navDiag: "DIAG",
    navCfg: "CFG",
  
    // Toasts
    toastCreated: "PROCESS_COMPILED",
    toastUpdated: "PROCESS_RECONFIGURED",
    toastArchived: "PROCESS_DECOMMISSIONED",
    toastPermDenied: "PERMISSION_DENIED",
    toastAlertsOn: "ALERTS_ENABLED",
    toastAlertsOff: "ALERTS_DISABLED",
    toastNotifUnsupported: "ALERTS_UNSUPPORTED_ON_DEVICE",
    toastSaveFailed: "WRITE_FAILED // RETRY",
  },
};
