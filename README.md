# 🔒 Lock In — Habit Tracker

A mobile-first PWA habit tracker built with **Next.js 14**, **Firebase**, and **Tailwind CSS**. Deployable to Vercel in minutes.

---

## ✨ Features

- ✅ Daily habit tracking with one-tap completion
- 🔥 Streak tracking (current + longest)
- 📊 Weekly & 30-day completion view
- 📓 Per-habit notes/journal per day
- 🔔 Push notifications (PWA, works on iPhone via "Add to Home Screen")
- 🔐 Google + Email/password auth
- 📱 Mobile-first, installable as PWA on iOS & Android

---

## 🏗 Project Structure

```
habit-tracker/
├── app/
│   ├── layout.tsx              # Root layout, fonts, providers
│   ├── page.tsx                # Redirects to /dashboard or /auth
│   ├── globals.css
│   ├── auth/
│   │   └── page.tsx            # Sign in / Sign up
│   └── dashboard/
│       ├── layout.tsx          # Auth guard + bottom nav
│       ├── page.tsx            # Today's habits
│       ├── progress/
│       │   └── page.tsx        # Weekly/monthly stats
│       └── settings/
│           └── page.tsx        # Notifications, profile, sign out
├── components/
│   ├── habits/
│   │   ├── HabitCard.tsx       # Swipeable habit row
│   │   ├── HabitDetailModal.tsx # Stats, notes, archive
│   │   ├── AddHabitModal.tsx   # Create/edit habit sheet
│   │   └── DailyProgress.tsx   # Progress ring
│   └── layout/
│       └── BottomNav.tsx
├── lib/
│   ├── firebase.ts             # Firebase client init
│   ├── firebase-admin.ts       # Firebase Admin (API routes)
│   ├── auth-context.tsx        # Auth React context
│   ├── habits.ts               # All Firestore operations
│   └── utils.ts                # cn(), colors, constants
├── hooks/
│   └── useHabits.ts            # Real-time habits hook
├── types/
│   └── index.ts                # TypeScript types
├── public/
│   ├── manifest.json           # PWA manifest
│   └── firebase-messaging-sw.js # Push notification SW
├── firestore.rules             # Firestore security rules
└── firestore.indexes.json      # Required Firestore indexes
```

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo>
cd habit-tracker
npm install
```

### 2. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it (e.g. "lock-in")
3. Disable Google Analytics (optional)

#### Enable Authentication
- Sidebar → **Authentication** → **Get started**
- Enable **Email/Password** provider
- Enable **Google** provider (set your project's support email)

#### Enable Firestore
- Sidebar → **Firestore Database** → **Create database**
- Start in **production mode**
- Choose a region close to you (e.g. `us-central1`)

#### Get your Web App config
- Sidebar → **Project Settings** (gear icon)
- Scroll to **"Your apps"** → click **Web** (`</>`)
- Register the app, copy the `firebaseConfig` values

#### Get Admin SDK credentials
- **Project Settings** → **Service accounts** tab
- Click **"Generate new private key"**
- Download the JSON file — you'll need `project_id`, `client_email`, `private_key`

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# From Firebase Console > Project Settings > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# From the downloaded service account JSON
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> ⚠️ The private key must be in quotes and have `\n` for newlines (not actual newlines).

### 4. Deploy Firestore Rules & Indexes

Install the Firebase CLI if you haven't:

```bash
npm install -g firebase-tools
firebase login
firebase init  # select Firestore, use existing project
```

Deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📲 Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, add all the variables from `.env.local`
4. Click **Deploy**

### Add authorized domains for Firebase Auth

After deploying, copy your Vercel URL (e.g. `lock-in.vercel.app`) and add it:
- Firebase Console → **Authentication** → **Settings** → **Authorized domains**
- Click **Add domain** → paste your Vercel URL

---

## 📱 Install on iPhone (PWA)

1. Open your Vercel URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

The app will now behave like a native app with a full-screen experience.

> 🔔 **Push Notifications on iOS**: Requires iOS 16.4+ and the app must be added to the home screen first. After adding, open the app and enable notifications in Settings.

---

## 🔔 Push Notifications Setup (Optional)

To enable daily reminder push notifications:

### Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Add to `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Enable Firebase Cloud Messaging

1. Firebase Console → **Project Settings** → **Cloud Messaging**
2. Under **Web Push certificates**, click **Generate key pair**
3. This is your VAPID key — it should match what you generated above

### Update the service worker

In `public/firebase-messaging-sw.js`, replace the `self.__FIREBASE_*` placeholders with your actual config values (these are safe to expose in the service worker since they're already public-facing).

---

## 🗂 Firestore Data Model

```
users/{userId}
  uid, email, displayName, notificationsEnabled, reminderTime

habits/{habitId}
  userId, name, description, emoji, color, targetDays[], createdAt, archivedAt, order

habitLogs/{userId}_{habitId}_{YYYY-MM-DD}
  habitId, userId, date, completed, note, completedAt
```

---

## 🛠 Extending the App

### Add habit reordering
- Use `@dnd-kit/core` for drag-and-drop
- Update `order` field in Firestore on drop

### Add habit history calendar
- Use a heatmap library or build a grid with `eachDayOfInterval` from `date-fns`

### Add social/sharing
- Add a `sharedWith: string[]` field to habits
- Query habits where `userId == uid || sharedWith contains uid`

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | Framework |
| `firebase` 10 | Auth + Firestore real-time DB |
| `firebase-admin` | Server-side auth verification |
| `date-fns` | Date math for streaks |
| `framer-motion` | Animations |
| `tailwindcss` | Styling |
| `react-hot-toast` | Toast notifications |
| `next-pwa` | PWA + service worker |
| `lucide-react` | Icons |
