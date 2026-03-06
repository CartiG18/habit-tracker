// Firebase service worker for push notifications
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: self.__FIREBASE_API_KEY,
  authDomain: self.__FIREBASE_AUTH_DOMAIN,
  projectId: self.__FIREBASE_PROJECT_ID,
  storageBucket: self.__FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID,
  appId: self.__FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? "Lock In", {
    body: body ?? "Time to lock in! Check your habits.",
    icon: icon ?? "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "habit-reminder",
    renotify: true,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/dashboard");
      }
    })
  );
});
