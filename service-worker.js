importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAzaMjUmpAsvzNg3ZbZ9br2Y8a6IzADELg",
  authDomain: "daily-crawler-chronicles.firebaseapp.com",
  projectId: "daily-crawler-chronicles",
  storageBucket: "daily-crawler-chronicles.firebasestorage.app",
  messagingSenderId: "127370266508",
  appId: "1:127370266508:web:59cc8d93482e897c9478a9"
});

const messaging = firebase.messaging();

// Reads from payload.data (data-only messages). This is now the SINGLE display
// path — FCM no longer auto-displays, so notifications fire exactly once.
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.data || {};
  self.registration.showNotification(title || 'Daily Crawler Chronicles', {
    body: body || '',
    icon: '/DailyRoutine/icons/icon-192.png',
    badge: '/DailyRoutine/icons/icon-192.png',
    data: payload.data,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: 'dcc-notification',
    renotify: false
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/DailyRoutine/'));
});

/* ── existing cache / offline ── */
const CACHE = 'dcc-v3';
const OFFLINE_URL = '/DailyRoutine/offline.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});