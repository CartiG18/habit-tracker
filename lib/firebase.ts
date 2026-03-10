import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use indexedDB instead of localStorage — works in all browsers including Safari PWA
export const auth = getApps().length > 1
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  const { isSupported, getMessaging } = await import("firebase/messaging");
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

export default app;