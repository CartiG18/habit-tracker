# SYNAPSE — AI Development Guidelines

> These rules exist to preserve the author's intentional design language and code style.
> Every new feature, component, or fix **must** feel like it was bolted onto the same
> 1986 NEURAL DYNAMICS INC. hardware console.

---

## 1. Project Identity

**Product name:** SYNAPSE (branded as `SYNAPSE_OS v3.0`)

**Theming System:**
The application supports any number of themes, each defined in one file under `lib/themes/` (see §13). Every theme builds on one of two **bases**, Retro or Soft, which decide component *structure* (bezels vs rounded cards). The theme file supplies everything else: colors, fonts, background, shadows, effects and copy. Components support every theme by branching on `isRetro` / `isSoft` (which mean "base is retro/soft") and by using `th-*` tokens and `useCopy()`.

### Theme A: Retro Terminal
**Internal metaphor:** A retro NASA / Cold War–era hardware terminal. The UI presents a CRT monitor recessed into a putty-colored mechanical bezel, complete with screws, scanlines, oscilloscope bar charts, and glowing amber text.
**Tone of voice:** `ALL_CAPS`, `SNAKE_CASE` labels. Terse, technical jargon (e.g., `INIT_NEW_PROCESS`, `OPERATOR_LOG`). Habits are **"processes"**, streaks are **"sequences"**.

### Theme B: Foundation (soft base)
**Internal metaphor:** A dark, data-forward, premium dashboard (Whoop-like). Near-black base, solid cards, no decoration; hierarchy from size, weight and gray value. Color only carries meaning (success = done, danger = destructive). Styled through tokens plus semantic `th-*` hook classes (see §13).
**Tone of voice:** Standard sentence casing, encouraging and simple English (e.g., "New Habit", "Notes"). Habits are "habits", streaks are "streaks".

Do **not** hardcode copy or colors. Always use the `useCopy()` hook for text and `th-*` prefixed tailwind classes for styling.

---

## 2. Tech Stack — Do Not Deviate

| Layer | Technology | Version lock |
|---|---|---|
| Framework | **Next.js (Pages-less App Router)** | `14.x` (CommonJS config) |
| Language | **TypeScript** (strict mode) | `^5` |
| Styling | **Tailwind CSS 3** | `^3.4` |
| CSS utilities | `clsx` + `tailwind-merge` → the `cn()` helper in `lib/utils.ts` |
| Auth & DB | **Firebase** (client SDK v10, Admin SDK v12) | |
| State | React Context (`AuthProvider`) + custom hooks (`useHabits`) | |
| Dates | **date-fns** (tree-shakeable named imports) | `^3.6` |
| Animations | **Framer Motion** (available but CRT/scanline effects use CSS animations) | |
| Icons | **lucide-react** | |
| Toasts | **react-hot-toast** | |
| PWA | **next-pwa** (disabled in dev) | |
| Deployment | **Vercel** | |

### Rules
- **No new UI libraries** (no shadcn, MUI, Chakra, Radix) without explicit approval.
- **No state management libraries** (no Zustand, Redux, Jotai). Use React Context +
  custom hooks following the existing `useHabits` pattern.
- Import `date-fns` functions individually — never `import * as dateFns`.
- Use `lucide-react` icons only; do not mix in Heroicons, FontAwesome, etc.
- The `cn()` helper must be used for all conditional class merging — never hand-concatenate Tailwind strings.

---

## 3. Directory Structure & File Conventions

```
habit-tracker/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout — fonts, AuthProvider, Toaster
│   ├── page.tsx                 # Boot splash → redirect
│   ├── globals.css              # CRT/mech-panel CSS utility classes
│   ├── auth/page.tsx            # Login screen
│   └── dashboard/
│       ├── layout.tsx           # Auth guard + boot animation + outer bezel
│       ├── page.tsx             # Main habit list
│       ├── progress/page.tsx    # Diagnostics / stats view
│       └── settings/page.tsx    # Configuration panel
├── components/
│   ├── habits/                  # Feature-scoped components
│   └── layout/                  # Shell / nav components
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities, Firebase init, data layer
│   └── themes/                  # Theme registry — one file per theme (§13)
├── types/                       # Shared TypeScript types
└── public/                      # PWA manifest, service worker
```

### Naming rules
| What | Convention | Example |
|---|---|---|
| Route pages | `page.tsx` (App Router) | `app/dashboard/page.tsx` |
| Route layouts | `layout.tsx` | `app/dashboard/layout.tsx` |
| Components | **PascalCase** `.tsx` | `HabitCard.tsx`, `BottomNav.tsx` |
| Hooks | `use*.ts` | `useHabits.ts` |
| Lib modules | **camelCase** `.ts` / `.tsx` | `auth-context.tsx`, `habits.ts` |
| Types | Exported from `types/index.ts` | `Habit`, `HabitWithStats` |

- Every React component file starts with `"use client";` — this is a client-rendered app.
- Group components by feature domain (e.g. `components/habits/`), not by component type.
- Keep all Firestore CRUD in `lib/habits.ts`; hooks in `hooks/` orchestrate it.

---

## 4. Design System — Color & Typography

### Semantic Theme Tokens (Tailwind)
The app uses semantic CSS variables mapped to Tailwind classes (`th-*`).
- `bg-th-screen`: Main background (CRT basalt or Soft paper).
- `bg-th-surface`: Elevated card/panel background.
- `text-th-primary`: Primary accent color (Amber or Slate blue).
- `text-th-text`: Main body text color.
- `shadow-mech-out` / `shadow-mech-in`: Mechanical switch states (Retro).
- `shadow-neu-out` / `shadow-neu-in`: Neumorphic states (Soft).

### Habit colors (defined in `lib/utils.ts` → `HABIT_COLORS`)
Colors are used for habit dots and streaks. They are vibrant enough to work as CRT phosphor, but also work on the soft parchment.

### Typography
- `font-theme`: the active theme's body font (`fonts.body`): JetBrains Mono for Retro, Roboto for Foundation, KG Kiss Me Slowly for Princess.
- `font-display`: the active theme's title font (`fonts.display`, defaults to body). Use it on page `<h1>`s.
- Fonts are registered once in `lib/themes/fonts.ts`; themes reference them by key.
- **Conditional Styling:** Use the `cn()` utility to apply different font weights and text transforms based on `isRetro`. For example: `cn("font-theme", isRetro ? "font-800 uppercase tracking-widest text-glow text-th-primary" : "font-500 text-th-text")`

### Text effects
- `text-glow` (defined in `globals.css`) → amber text-shadow
- `text-signal` → green text + green text-shadow
- Never use default browser fonts or sans-serif stacks

---

## 5. Design System — Visual Components

### The "bezel + CRT" layout shell
Every full-screen view follows this physical metaphor (see `dashboard/layout.tsx`):

```
┌─────────── putty bezel (mech-panel, rounded-2xl) ───────────┐
│  ● screw  ─────────────────────────────────────  ● screw    │
│  ┌─────── basalt CRT screen (crt-screen) ──────────────┐    │
│  │  scanline-overlay (animated)                         │    │
│  │  bg-graph-paper (subtle amber grid)                  │    │
│  │  ┌──────── content area (z-20) ─────────────────┐    │    │
│  │  │         page content here                     │    │    │
│  │  └───────────────────────────────────────────────┘    │    │
│  │  BottomNav (absolute bottom, putty bg)               │    │
│  └──────────────────────────────────────────────────────┘    │
│  ● screw  ─────────────────────────────────────  ● screw    │
└──────────────────────────────────────────────────────────────┘
```

Key CSS classes (from `globals.css`):
- `.mech-panel` → outer putty bezel with neumorphic shadow
- `.crt-screen` → basalt bg + inner glow + scanline pseudo-elements + flicker animation
- `.scanline-overlay` → sweeping amber bar, `z-11`
- `.bg-graph-paper` → subtle amber grid overlay, `pointer-events-none opacity-20`
- `.shadow-mech-out` / `.shadow-mech-in` → physical toggle button states
- `.shadow-bezel-inner` → deep inset border around the CRT

### Mobile-first rules
- Full-height shells use `.h-app` (100dvh with a 100vh fallback); modal bodies use `.max-h-modal`.
- The viewport is `viewport-fit=cover`: anything touching a screen edge pads with
  `env(safe-area-inset-*)` (shell top, soft bottom nav, floating buttons, modal overlays).
- Floating controls are anchored to the `max-w-lg` app column, not the window edge.
- Destructive actions use a two-tap confirm (first tap arms for 3s) — never `window.confirm`.
- Use `makeId()` from `lib/utils.ts`, not `crypto.randomUUID()` (missing on http://<LAN-IP> when testing on a phone).

### Modals
Render every modal inside `<ModalPortal>` (`components/layout/ModalPortal.tsx`) so it
escapes scroll containers and animated ancestors. Mount child modals conditionally
(`{open && <Modal …/>}`) so their form state starts fresh each time.
All modals follow the same bezel-inside-CRT pattern:
1. Fixed overlay (`bg-black/80 backdrop-blur-sm`)
2. Outer putty shell (`bg-putty border-4 border-putty-dark rounded-xl shadow-mech-out p-3`)
3. Inner CRT content area (same as above with scanline + graph-paper overlays)
4. Content scrolls inside with `overflow-y-auto z-20 relative p-6`

### Buttons
- **Primary action:** `bg-amber text-basalt` with `shadow-[0_0_15px_rgba(255,176,0,0.4)]`
- **Destructive action:** `border border-red-500/50 text-red-500/60` with hover glow
- **Toggle (mechanical switch):** `shadow-mech-out` ↔ `shadow-mech-in`, transitions between `bg-putty` and `bg-basalt`
- **Tab/segment controls:** grid of buttons; active = `bg-amber text-basalt`, inactive = `text-amber/50`
- **Close button (X):** `p-2 border border-amber/30 text-amber/60 hover:text-amber hover:bg-amber/10`
- All buttons: `font-mono font-700 or font-800 uppercase tracking-widest`

### Cards / data panels
- `bg-basalt-light/30 border border-amber/20` (or `/30`)
- Always include the scanline-thin overlay: `bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px]`
- Content at `relative z-10` to sit above the overlays

### Skeleton loading states
- `bg-amber-dim animate-pulse` with `border border-amber/30`
- Match the approximate dimensions of the loaded content

### Input fields (terminal-style)
- Container: `border-b-2 border-amber/50 bg-basalt-light/30` with a `> ` prompt prefix
- Input: `bg-transparent text-amber placeholder-amber/20 font-mono uppercase outline-none`
- Focus state: `focus:bg-amber/5`

---

## 6. Architecture Patterns

### Authentication
- `lib/auth-context.tsx` provides `AuthProvider` (React Context) wrapping the app.
- `useAuth()` hook exposes `user`, `userProfile`, `loading`, `signInWithGoogle`, `signOut`, etc.
- Route protection lives in `dashboard/layout.tsx` via `useEffect` redirect.
- On auth state change → fetch-or-create Firestore `/users/{uid}` profile doc.

### Data layer (`lib/habits.ts`)
- All Firestore reads/writes are **plain async functions** (not hooks).
- Composite document IDs for logs: `${userId}_${habitId}_${date}`.
- `getHabitWithStats()` enriches a `Habit` into `HabitWithStats` by computing streaks,
  completion rate, and week logs — this is the shape consumed by components.
- Schedule helpers (`isScheduledDay`, `scheduleLabel`) handle all four schedule types.

### Real-time hook (`hooks/useHabits.ts`)
- Two `onSnapshot` listeners: one for `habits` collection, one for `habitLogs` on the selected date.
- Returns `{ habits, dateLogs, loading, toggle, addNote, addHabit, editHabit, removeHabit }`.
- Actions use `useCallback` and surface errors via `react-hot-toast`.
- New data operations should follow this pattern: add a function to `lib/habits.ts`,
  then expose it through the hook.
- The dashboard runs **one** `useHabits(date)` and shares it via `HabitsContext`;
  cards and modals read it with `useHabitsContext()`. Never call `useHabits()` inside a
  modal or card — each call opens its own listeners and refetches every habit's stats.
- Mutating actions (`addHabit`, `editHabit`, `removeHabit`, `addNote`, `savePlan`) catch
  their own errors, toast `copy.toastSaveFailed`, and resolve to `true`/`false`. Only close
  a form when it resolves `true`, so nothing the user typed is lost.
- `setDoc` replaces the whole document: when rewriting a log, carry over fields you
  aren't changing (e.g. `note`). Firestore also rejects `undefined` values — omit
  optional fields instead of setting them to `undefined`.

### Types (`types/index.ts`)
- All shared types are centralized here. Component-specific `Props` interfaces are
  defined inline in each component file.
- The schedule system uses a discriminated union (`HabitSchedule`) — always switch
  on `.type` and handle all four cases.

### Scheduling & stats rules
- Pure schedule helpers live in `lib/schedule.ts` (no Firebase) so the client and the
  reminder route agree: `isHabitDue(habit, date)` = active (start/end, not paused) AND scheduled.
- Rest days (`skipped`) and inactive days are **neutral**: they never break a streak and are
  excluded from completion rates. Frequency habits count streaks in weeks/months; a past
  period only breaks if completions + excused days couldn't reach the target.
- Rewriting a log with `setDoc` must carry over `note` (see `lib/habits.ts` writers).
- Archive (`removeHabit`) is the default "remove"; permanent delete (`deleteForever`) removes all logs.

### Reminders (push)
- Client: `lib/push.ts` → `enablePush(uid)` registers `public/firebase-messaging-sw.js`
  (config passed in its URL) and saves the FCM token + time zone on the user doc.
- Server: `GET /api/reminders` (needs `Authorization: Bearer $CRON_SECRET`) sends due
  per-habit and daily reminders; call it every 15 minutes from a scheduler.

### Date handling
- Dates are stored and transmitted as `"YYYY-MM-DD"` strings.
- Use `formatDateString()` from `lib/utils.ts` for local date → string conversion.
- Use `date-fns` for all date math — never raw `Date` manipulation.

---

## 7. Firestore Schema

```
users/{userId}
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: string (ISO)
  notificationsEnabled?: boolean
  reminderTime?: string ("HH:mm")
  timeZone?: string (IANA, used by the reminder server)
  fcmTokens?: string[] (push tokens)
  lastDailyReminderDate?: string

habits/{habitId}  (auto-ID)
  userId: string
  name: string
  description?: string
  emoji: string
  color: HabitColor
  schedule: HabitSchedule
  createdAt: string (ISO)
  archivedAt?: string (ISO — archived: hidden, history kept, restorable)
  order: number (manual order; set by Arrange)
  startDate? / endDate?: "YYYY-MM-DD" (active range, inclusive)
  pausedFrom? / pausedUntil?: "YYYY-MM-DD" (paused range; no until = until resumed)
  timeOfDay?: "morning" | "afternoon" | "evening" (dashboard sections)
  measure?: { target, unit, step } (measurable habit)
  reminder?: { enabled, time "HH:mm", onlyIfNotDone, lastSentDate? }

habitLogs/{userId}_{habitId}_{YYYY-MM-DD}  (deterministic ID)
  id: string
  habitId: string
  userId: string
  date: string ("YYYY-MM-DD")
  completed: boolean
  skipped?: boolean (rest day — neutral for streaks and rates)
  value?: number (measurable habits; completed when value >= target)
  note?: string (per-day note)
  completedAt?: string (ISO)
```

### Security rules
All reads/writes require `request.auth != null` and ownership (`userId == request.auth.uid`).
When adding new collections, replicate this per-user ownership pattern.

### Indexes
Composite indexes exist for:
- `habits`: `(userId ASC, archivedAt ASC, order ASC)`
- `habitLogs`: `(userId ASC, habitId ASC, date ASC)` and `(userId ASC, date ASC)`

If a new query requires a composite index, add it to `firestore.indexes.json`.

---

## 8. Code Style Rules

1. **`"use client";`** at the top of every component and context file.
2. **Named exports** for library functions; **default exports** for page/component files.
3. **Inline `Props` interfaces** at the top of component files — don't centralize trivial props.
4. **No barrel exports** (`index.ts` re-exporting a folder) except `types/index.ts`.
5. **Imports use the `@/` path alias** (maps to project root via `tsconfig.json`).
6. **Section dividers** in longer files use this comment style:
   ```ts
   // ─── Section Title ─────────────────────────────────────────────────────────
   ```
7. **Error handling:** Catch in hooks/callbacks, surface via `toast.error(msg)`.
   Never let uncaught promise rejections propagate silently.
8. **No `any`** except in explicit error-catch blocks (`catch (err: any)`).
9. **Conditional rendering:** Use `if (!open) return null;` early-return pattern in modals.
10. **Tailwind class order** (approximate): layout → positioning → sizing → spacing → bg → border → text → effects → transitions.

---

## 9. Animation & Interaction Conventions

- **Boot sequence:** `dashboard/layout.tsx` shows a 2-second terminal boot animation
  with `BOOT_TEXT` lines before revealing the main UI. Keep this behavior.
- **Page transitions:** Components use `animate-slide-up` with staggered `animationDelay`.
- **CRT effects:** scanlines, flicker, and graph-paper are always present as overlays
  on CRT screen areas. Do not remove them.
- **Toggle switches** animate between `shadow-mech-out` (raised/off) and
  `shadow-mech-in` (pressed/on) with a `translate-y` shift.
- **Signal indicators:** Small `bg-signal rounded-full` dots with
  `shadow-[0_0_5px_rgba(50,205,50,0.8)]` glow.
- **Progress visualization:** Use oscilloscope-style bar charts (vertical bars) and
  completion counts, not circular progress rings.
- **Hover states:** `hover:bg-amber/10`, `hover:border-amber/50`, `hover:text-amber`.
  Keep them subtle — this is a hardware panel, not a candy-colored web app.

---

## 10. PWA & Deployment

- **next-pwa** generates the service worker at build time; disabled in dev mode.
- `public/manifest.json` defines the installed app (standalone, portrait, dark theme).
- `public/firebase-messaging-sw.js` handles background push notifications.
- **Vercel** is the deployment target; `vercel.json` sets `Cross-Origin-Opener-Policy`
  headers for Google OAuth popups.
- `next.config.js` uses CommonJS (`module.exports`) — do not convert to ESM.

---

## 11. Environment Variables

### Client-side (`NEXT_PUBLIC_*`)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Push reminders also need:
```
NEXT_PUBLIC_FIREBASE_VAPID_KEY   # Firebase console → Cloud Messaging → Web Push certificates
```

### Server-side only
```
CRON_SECRET                      # shared secret for GET /api/reminders
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

Never hardcode these values. Never commit `.env.local`.

---

## 12. Checklist for New Features

Before submitting any new code, verify:

- [ ] Supports both bases via `isRetro` checks and `th-*` tokens, so it works for every theme.
- [ ] No hex/rgb literals for theme colors. Use `th-*` classes, or `rgb(var(--th-primary)/0.4)` inside arbitrary values and inline styles. (Never `rgba(var(--th-x),a)`: the vars hold space-separated channels, so that is invalid CSS.)
- [ ] Text is supplied by `useCopy()`; absolutely no hardcoded strings.
- [ ] Retro mode adheres to terminal jargon, uppercase text, and `font-theme`.
- [ ] Soft-base themes (Foundation, Princess) use clean, sentence-case text.
- [ ] Modals and shells branch correctly to render mechanical bezels vs soft rounded cards.
- [ ] Uses semantic color tokens (`th-primary`, `th-screen`, `th-surface`) — no hardcoded colors.
- [ ] Data operations go through `lib/habits.ts` → `hooks/useHabits.ts`.
- [ ] Types are defined in `types/index.ts`.
- [ ] `cn()` is used for conditional class names.
- [ ] No new dependencies without explicit approval.

---

## 13. Theme System — Adding a Theme

### How it fits together
```
lib/themes/
├── types.ts     ThemeDefinition: the shape of a theme
├── fonts.ts     next/font registry (FontKey → --font-<key>)
├── retro.ts     Retro Terminal (base theme for base: "retro")
├── soft-base.ts shared base for every base: "soft" theme (not registered; changing it changes Foundation AND Princess)
├── foundation.ts Foundation (dark, data-forward; extends soft-base)
├── extend.ts    extendTheme(): derive a theme from a base
├── events.ts    emitHabitComplete() / onHabitComplete() for theme overlays
├── wallpaper.ts wallpaper adjustment types + `--wallpaper-*` var mapping
├── princess.ts  Princess (soft-based, custom overlay)
└── index.ts     THEMES registry, CSS + init-script generators
```
- The active theme id is stored in localStorage, the user's Firestore profile and a `synapse-theme` cookie. `app/layout.tsx` reads the cookie so the server renders the right theme (no hydration mismatch); this makes routes dynamic.
- `app/layout.tsx` renders `buildThemeStylesheet()` as an inline `<style>`: one `html[data-theme="<id>"]{--th-*…}` block per theme. It also renders `buildThemeInitScript()`, which applies the stored theme before first paint.
- `<html>` carries `data-theme="<id>"` (which token set applies) and `class="theme-<base>"` (which structural CSS in `globals.css` applies).
- `lib/wallpaper-context.tsx` (`useWallpaper()`) holds the user's on-device wallpaper (downscaled photo in localStorage) and adjustments; the `<head>` script applies them before first paint.
- Theme ids that get renamed stay readable via `LEGACY_THEME_IDS` / `resolveThemeId()` (e.g. `soft` → `foundation`); always read stored ids through `resolveThemeId()`.
- Users can recolor a theme's `surface`, `screen`, `primary`, `success` and `text` in Preferences → Colors (per theme, on-device; companion shades are derived in `lib/themes/colors.ts`). Theme defaults are always offered as swatches, so a theme's `colors` are the reset values.
- `useTheme()` returns `{ theme, def, base, isRetro, isSoft, setTheme }`. `def` is the full definition. `useCopy()` returns `def.copy`.
- The settings picker, toaster, boot animation and browser `theme-color` all read from the registry. Nothing else needs editing.

### Steps
1. **Create `lib/themes/<id>.ts`** by extending the closest base:
   ```ts
   import { Trees } from "lucide-react";
   import { extendTheme } from "@/lib/themes/extend";
   import { softBase } from "@/lib/themes/soft-base";

   export const forest = extendTheme(softBase, {
     name: "Forest",
     description: "Moss & morning fog",
     icon: Trees,
     colors: { primary: "#4F7942", surface: "#E8EDE4", text: "#2B3A2B" },
     fonts: { body: "sans", display: "serif" },          // keys from fonts.ts
     background: { image: `url("/themes/forest/bg.jpg")`, size: "cover", attachment: "fixed" },
     effects: { glow: false },
     copy: { appTitle: "Grove", activeHabits: "Today's Growth" }, // any CopyKey
     metaColor: "#E8EDE4",
     css: (sel) => `${sel} .bottom-nav { backdrop-filter: blur(8px); }`, // escape hatch
   });
   ```
   Only list what differs. Nested groups (`colors`, `fonts`, `copy`, `effects`, …) merge key by key.
2. **Register it** in `THEMES` in `lib/themes/index.ts`. The key is the persisted id; order is the picker order.
3. **New font?** For a Google Font, add it to `FONTS` in `lib/themes/fonts.ts` with `variable: "--font-<key>"` and `preload: false`. For a font file, put it in `public/fonts/` and add it to `FONT_FILES` with a fallback stack.
4. **Images** go in `public/themes/<id>/`. Reference them with absolute paths (`/themes/<id>/…`).
5. Run `npx tsc --noEmit`. A missing copy key or bad font key is a type error.

### Token reference
| Field | Drives |
|---|---|
| `colors.surface / surfaceDark / surfaceLight` | `th-surface*` — bezel, cards, nav |
| `colors.screen / screenDark / screenLight` | `th-screen*` — CRT glass / paper |
| `colors.primary` | `th-primary`, glows, graph paper, scanlines |
| `colors.success` | `th-success`, `.text-signal`, completion LEDs |
| `colors.text`, `colors.btnText` | `th-text`, `th-btn-text` |
| `opacity.*` | `th-primary-dim/-glow`, `th-success-dim`, `th-text-secondary` |
| `fonts.body / display` | `font-theme`, `font-display` |
| `background.*` | page background behind the shell (`body`) |
| `wallpaper` | default wallpaper `{ image, fit?, x?, y?, zoom?, dim? }` (image under `public/backgrounds/`; ship a phone-sized ~1080px copy). Soft base: the main screen becomes a veil (`dim`) over it. Users can override it on-device in Preferences. |
| `shadows.*` | `shadow-th-raised/-inset`, `shadow-neu-out/-in` |
| `radius.*` | what `rounded-lg/-xl/-2xl/-3xl` mean for this theme |
| `icon` | the theme's icon in the settings picker (lucide or custom artwork) |
| `navIcons.*` | bottom-nav icons: lucide icons, custom SVG components taking `LucideProps`, or `imageIcon("/icons/x.svg")` for full-color artwork (style inactive tabs via `nav a:not([aria-current]) .theme-img-icon` in `css()`) |
| `marker` | habit-card completion marker shape: `"circle"` or `"star"` (soft base) |
| `markerFill` | completed star gradient `{ stops: [light, mid, deep], glow }` (e.g. Princess gold) |
| `icons.*` | every UI icon by role (`close`, `check`, `chevron`, `add`, `plan`, `streak`, `rate`, `best`, `edit`, `delete`, `appearance`, `notifications`, `account`, `logout`, `upload`, `reset`). Base themes use `LUCIDE_ICONS`; override any subset. Components draw icons only via `const Icons = useIcons(); <Icons.close …/>` — never import lucide icons directly. |
| `toastIcons` | colors of the toast success/error icons |
| `habitDecor` | `false` hides per-habit emoji + color everywhere (cards, detail, plan, progress) and removes their pickers from the add/edit forms. UI-only: habits still save the default emoji/color. Gate new emoji/color UI on `def.habitDecor !== false`. |
| `selection`, `frameFill` | how the selected day / nav tab is shown: `"fill"` (raised chip) or `"frame"` (no background, gradient `.sel-frame` ring in `frameFill` colors, hover/press enlarges) |
| `effects.*` | glow, scanlines, flicker, grid (visible on retro base) |
| `bootLines` | dashboard boot animation (retro base; `[]` skips it) |
| `toast` | react-hot-toast style (use `var(--th-*)` to inherit colors) |
| `metaColor` | browser / PWA status-bar color |
| `css(selector)` | raw CSS scoped to the theme, for anything else |
| `th-*` hook classes | semantic, unstyled-by-default classes components carry so a theme's `css()` can restyle them without touching other themes: `th-card`, `th-label`, `th-hero`, `th-stat`, `th-track`, `th-marker`, `th-btn-primary`, `th-day` (+ `aria-pressed`). Add one to a component instead of changing a shared class list. |
| `overlay` | client component drawn above the app (decorations, effects). Put it in `components/themes/<id>/`. |

A theme that needs a genuinely new *structure* (not just new styling) needs a new base. That means adding to `ThemeBase` and branching components on it. Prefer tokens and `css()` first.

