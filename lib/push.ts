"use client";

import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db, getFirebaseMessaging } from "@/lib/firebase";

// ─── Push Registration ────────────────────────────────────────────────────────
// Registers this device for reminder pushes: permission → FCM service worker →
// token saved on users/{uid} (plus the time zone the server schedules in).
// The server side lives in app/api/reminders/route.ts.

export type PushResult = "ok" | "unsupported" | "denied" | "unconfigured";

/** Remember the user's time zone even when push can't be enabled (reminders need it). */
export async function saveTimeZone(uid: string) {
  await updateDoc(doc(db, "users", uid), { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
}

export async function enablePush(uid: string): Promise<PushResult> {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Push disabled: set NEXT_PUBLIC_FIREBASE_VAPID_KEY (Firebase console → Cloud Messaging → Web Push certificates).");
    await saveTimeZone(uid).catch(() => {});
    return "unconfigured";
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const messaging = await getFirebaseMessaging();
  if (!messaging) return "unsupported";

  // The worker can't read env vars, so pass the public config in its URL
  const config = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  });
  // Separate scope so it never collides with the PWA service worker at "/"
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${config}`, {
    scope: "/firebase-cloud-messaging-push-scope",
  });

  const { getToken } = await import("firebase/messaging");
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  await updateDoc(doc(db, "users", uid), {
    fcmTokens: arrayUnion(token),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return "ok";
}
