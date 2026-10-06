import { extendTheme } from "@/lib/themes/extend";
import { softBase } from "@/lib/themes/soft-base";
import PrincessOverlay from "@/components/themes/princess/PrincessOverlay";
import { TwinkleStarIcon } from "@/components/themes/princess/TwinkleStarIcon";
import { imageIcon } from "@/components/themes/imageIcon";
import {
  MirrorIcon, BellBowIcon, KeyIcon, CoachIcon, FrameIcon, SwirlIcon, ScrollIcon,
  ShootingStarIcon, WandIcon, CrownIcon, QuillIcon, BrokenHeartIcon, CloseIcon, ChevronIcon,
  RestCloudIcon, ChestIcon, HourglassIcon, PlaySparkIcon, StorybookIcon, PearlGripIcon,
  SunriseIcon, SunIcon, MoonStarIcon, CalendarIcon, PlusGoldIcon, MinusGoldIcon,
} from "@/components/themes/princess/icons";

// ─── Princess ─────────────────────────────────────────────────────────────────
// Storybook whimsy: floral teal wallpaper, blush-pink cards, handwritten text,
// gold nav icons and fairy dust whenever a habit is completed.

export const princess = extendTheme(softBase, {
  name: "Princess",
  description: "Enchanted & dreamy",
  icon: CrownIcon,

  colors: {
    surface:      "#FDC3D1", // rich rose tiles
    surfaceDark:  "#D97FA0", // deeper rose borders, inactive dots
    surfaceLight: "#FFFFFF",
    screen:       "#E4F6F4", // light teal sky
    screenDark:   "#CDEEEA",
    screenLight:  "#F2FBFA",
    primary:      "#D4558C", // rose pink
    success:      "#34ABA2", // lagoon teal
    text:         "#3D4A5C", // soft storybook navy
    btnText:      "#FFFFFF",
  },
  opacity: {
    primaryDim: 0.14,
    primaryGlow: 0.25,
    successDim: 0.18,
    textSecondary: 0.72, // a touch stronger for contrast on the richer pink
  },
  fonts: { body: "kiss-me-slowly", display: "kiss-me-slowly" },
  background: {
    color: "#DDF3F1",
    image:
      "radial-gradient(circle at 12% 18%, rgba(248,165,194,0.35), transparent 42%), " +
      "radial-gradient(circle at 88% 82%, rgba(158,230,223,0.55), transparent 48%), " +
      "linear-gradient(160deg, #DFF5F3 0%, #FCE8F0 100%)",
    attachment: "fixed",
  },
  // Floral teal wallpaper (phone-sized copy of backgrounds/princess-background.jpeg);
  // light veil so cards stay readable while the flowers show through
  wallpaper: { image: "/backgrounds/princess-background-1080.jpg", fit: "cover", dim: 0.15 },
  shadows: {
    raised: "0 4px 14px rgba(212,85,140,0.25)",
    inset:  "none",
    neuOut: "0 6px 18px rgba(95,170,165,0.18), 0 2px 6px rgba(212,85,140,0.08)",
    neuIn:  "inset 2px 2px 6px rgba(95,170,165,0.2), inset -2px -2px 6px rgba(255,255,255,0.9)",
  },

  // Slightly crisper than the soft base — soft, but not pillowy
  radius: { lg: "6px", xl: "8px", "2xl": "10px", "3xl": "14px" },
  navIcons: {
    main: imageIcon("/icons/princess-castle.svg"),
    diag: imageIcon("/icons/princess-journey.svg"),
    cfg: imageIcon("/icons/gold_gear.svg"),
  },
  // Pink + gold storybook icons; `check` stays the default so it reads on the gold star
  icons: {
    add: TwinkleStarIcon,
    close: CloseIcon,
    chevron: ChevronIcon,
    plan: ScrollIcon,
    streak: ShootingStarIcon,
    rate: WandIcon,
    best: CrownIcon,
    edit: QuillIcon,
    delete: BrokenHeartIcon,
    appearance: MirrorIcon,
    notifications: BellBowIcon,
    account: KeyIcon,
    logout: CoachIcon,
    upload: FrameIcon,
    reset: SwirlIcon,
    skip: RestCloudIcon,
    archive: ChestIcon,
    pause: HourglassIcon,
    resume: PlaySparkIcon,
    history: StorybookIcon,
    grip: PearlGripIcon,
    morning: SunriseIcon,
    afternoon: SunIcon,
    evening: MoonStarIcon,
    calendar: CalendarIcon,
    increment: PlusGoldIcon,
    decrement: MinusGoldIcon,
  },
  marker: "star",
  // Selected day / nav tab: no background, a gold frame; others grow slightly on hover/press
  selection: "frame",
  frameFill: { stops: ["#FFF3C4", "#F2C14E", "#B8862B"], glow: "rgba(242,193,78,0.45)" },
  // Completed stars: shiny gold (light → mid → deep) with a warm glow
  markerFill: { stops: ["#FFF3C4", "#F2C14E", "#B8862B"], glow: "rgba(242,193,78,0.55)" },

  toast: {
    background: "rgb(var(--th-surface))",
    border: "1px solid rgb(var(--th-surface-dark))",
    borderRadius: "10px",
    boxShadow: "0 8px 24px rgb(var(--th-primary) / 0.18)",
  },
  toastIcons: {
    success: { primary: "#E8B84A", secondary: "#FFFFFF" },
    error: { primary: "#E0679A", secondary: "#FFFFFF" },
  },
  metaColor: "#E4F6F4",
  overlay: PrincessOverlay,

  css: (sel) => `
    ${sel} nav .theme-img-icon { width: 30px; height: 30px; transition: opacity 300ms, filter 300ms, transform 300ms; }
    ${sel} nav a:not([aria-current]) .theme-img-icon { opacity: 0.55; filter: saturate(0.6); }
    ${sel} nav a[aria-current] .theme-img-icon { transform: scale(1.08); filter: drop-shadow(0 2px 4px rgba(201,151,47,0.4)); }
    ${sel} .app-screen { text-shadow: 0 0 6px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.9); } /* legible over the wallpaper */
    ${sel} body { font-synthesis: none; } /* single-weight handwriting font: no fake bold */
    ${sel} .font-display { font-weight: 400; letter-spacing: 0.01em; line-height: 1.25; }
    ${sel} button, ${sel} a > div { transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); transition-duration: 400ms; }
    ${sel} { scroll-behavior: smooth; }
  `,

  copy: {
    // Auth
    appEmblem: "👑",
    emptyEmblem: "✨",
    authSubtitle: "Sign in to begin your story",
    authLocked: "Waking the castle…",
    bootLoading: "Sprinkling a little magic…",

    // Dashboard header
    greetingPrefix: "Good day,",

    // Habit list
    activeHabits: "Today's Enchantments",
    noHabits: "No habits yet — every tale starts somewhere",
    noHabitsHint: "Tap + to make your first wish",

    // Add / Edit
    addHabitTitle: "Make a Wish",
    editHabitTitle: "Edit Habit",
    inputPlaceholder: "What shall it be?…",
    savingText: "Casting…",
    saveButton: "Create Habit ✨",
    updateButton: "Save Changes ✨",

    // Detail modal
    executeButton: "Mark Complete ✨",
    completedButton: "Done — how lovely! ✓",
    noteLabel: "Diary",
    saveNoteButton: "Save to Diary",
    savingNoteText: "Writing…",
    notePlaceholder: "Dear diary…",
    deleteConfirm: "Tap again to say goodbye",
    subtasksLabel: "Little Steps",
    addSubtaskButton: "+ Add a little step",

    // Daily progress
    allDone: "Happily Ever After!",
    allDoneHint: "Every habit done today — simply magical",
    pendingSuffix: "still to go",

    // Daily plan
    planButtonCreate: "Plan My Day",
    planModalTitle: "Today's Chapter",
    planModalHint: "Choose the habits for today's story",
    planSaveButton: "Save Plan ✨",

    // Progress page
    progressModule: "Your Journey",
    progressTitle: "How It's Going",
    streaksSection: "Shining Streaks",

    // Settings page
    settingsModule: "Make it yours",
    settingsTitle: "Preferences",
    notificationsLabel: "Gentle Reminders",
    userFallback: "Your Highness",
    wallpaperLabel: "Castle Walls",
    colorsLabel: "Royal Palette",
    colorsReset: "Restore royal colors",
    wallpaperUpload: "Choose a picture",
    wallpaperSourceTheme: "Enchanted",
    toastWallpaperSaved: "Your new wallpaper is lovely ✨",

    // Nav
    navMain: "Home",
    navDiag: "Journey",
    navCfg: "Preferences",

    // Toasts
    toastCreated: "A new habit is born ✨",
    toastAlertsOn: "Reminders on — a little bird will remind you",
    toastAlertsOff: "Reminders off",
    toastSaveFailed: "Oh no — that didn't save. Try again?",
    skipButton: "Take a rest day",
    unskipButton: "Undo rest day",
    skippedLabel: "Resting",
    archiveButton: "Tuck away in the chest",
    archivedSection: "The Treasure Chest",
    archivedEmpty: "The chest is empty",
    restoreButton: "Bring it back",
    pauseButton: "Pause the spell",
    resumeButton: "Wake the spell",
    pausedSection: "Sleeping Spells",
    historyLabel: "Storybook",
    historyHint: "Tap a day to fill in your story",
    arrangeButton: "Rearrange",
    cancelButton: "Never mind",
    toastArchived: "Tucked away in the treasure chest",
    toastRestored: "Back from the chest ✨",
    toastPaused: "Sleeping until you need it",
    toastResumed: "Awake again ✨",
    toastDeleted: "Gone with the wind",
  },
});
