"use client";

import { useTheme } from "@/lib/theme-context";
import { ThemeMode } from "@/types";

// ─── Copy Keys ────────────────────────────────────────────────────────────────

export type CopyKey =
  // Auth
  | "appTitle"
  | "authSubtitle"
  | "authButton"
  | "authLocked"
  | "authWarning"
  | "bootLoading"
  // Dashboard header
  | "greetingPrefix"
  | "dateLabelCurrent"
  | "dateLabelPrefix"
  // Habit list
  | "activeHabits"
  | "habitCount"
  | "noHabits"
  | "noHabitsHint"
  // Add / Edit modal
  | "addHabitTitle"
  | "editHabitTitle"
  | "labelIcon"
  | "labelName"
  | "labelColor"
  | "labelSchedule"
  | "inputPlaceholder"
  | "savingText"
  | "saveButton"
  | "updateButton"
  // Schedule tabs
  | "scheduleDays"
  | "scheduleDates"
  | "scheduleFreqWeek"
  | "scheduleFreqMonth"
  | "targetLabel"
  // Detail modal
  | "detailSubtitle"
  | "executeButton"
  | "completedButton"
  | "streakLabel"
  | "successLabel"
  | "maxStreakLabel"
  | "timelineLabel"
  | "noteLabel"
  | "saveNoteButton"
  | "savingNoteText"
  | "deleteButton"
  | "dataPrefix"
  | "seqPrefix"
  // Daily progress
  | "allDone"
  | "allDoneHint"
  | "loadPrefix"
  | "pendingSuffix"
  // Daily plan
  | "planButtonCreate"
  | "planButtonEdit"
  | "planModalTitle"
  | "planModalHint"
  | "planEmptyState"
  | "planAutoTag"
  | "planSaveButton"
  | "addToPlanButton"
  // Progress page
  | "progressModule"
  | "progressTitle"
  | "scopeWeek"
  | "scopeMonth"
  | "streaksSection"
  | "overviewSection"
  | "yieldLabel"
  // Settings page
  | "settingsModule"
  | "settingsTitle"
  | "notifSection"
  | "notificationsLabel"
  | "notifLabel"
  | "notifTime"
  | "appearanceLabel"
  | "accountLabel"
  | "alertsLabel"
  | "timeLabel"
  | "logoutButton"
  | "signOutSection"
  | "signOutButton"
  | "themeSection"
  | "themeRetroLabel"
  | "themeSoftLabel"
  | "themeRetroDesc"
  | "themeSoftDesc"
  | "versionText"
  | "copyrightText"
  // Nav
  | "navMain"
  | "navDiag"
  | "navCfg"
  // Toasts
  | "toastCreated"
  | "toastUpdated"
  | "toastArchived"
  | "toastPermDenied"
  | "toastAlertsOn"
  | "toastAlertsOff";

// ─── Retro Dictionary ────────────────────────────────────────────────────────

const RETRO: Record<CopyKey, string> = {
  // Auth
  appTitle: "SYNAPSE_OS",
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
  themeRetroLabel: "TERMINAL",
  themeSoftLabel: "SOFT_FOCUS",
  themeRetroDesc: "CRT / PHOSPHOR",
  themeSoftDesc: "MODERN / CLEAN",
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
};

// ─── Soft Focus Dictionary ───────────────────────────────────────────────────

const SOFT: Record<CopyKey, string> = {
  // Auth
  appTitle: "Synapse",
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
  themeRetroLabel: "Terminal",
  themeSoftLabel: "Soft Focus",
  themeRetroDesc: "Retro CRT aesthetic",
  themeSoftDesc: "Clean, modern look",
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
};

// ─── Accessor ─────────────────────────────────────────────────────────────────

const DICTIONARIES: Record<ThemeMode, Record<CopyKey, string>> = {
  retro: RETRO,
  soft: SOFT,
};

export function getCopy(theme: ThemeMode): Record<CopyKey, string> {
  console.log("THEME:", theme, "DICTIONARIES:", DICTIONARIES); return DICTIONARIES[theme] || DICTIONARIES.retro;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCopy(): Record<CopyKey, string> {
  const { theme } = useTheme();
  console.log("THEME:", theme, "DICTIONARIES:", DICTIONARIES); return DICTIONARIES[theme] || DICTIONARIES.retro;
}
