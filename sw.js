// ── Firebase Messaging (requerido para FCM en background) ──
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB117FiWsQTCqbqC8LFPSzPKepHXn4eXcM",
    authDomain: "delivery-e3221.firebaseapp.com",
    projectId: "delivery-e3221",
    storageBucket: "delivery-e3221.firebasestorage.app",
    messagingSenderId: "555123509664",
    appId: "1:555123509664:web:8aaaed8f301f81ecc93cc5"
});

const messaging = firebase.messaging();

// Notificación en background
messaging.onBackgroundMessage(payload => {
    console.log('📩 Mensaje en background:', payload);
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || '🛵 Nuevo viaje', {
        body: body || 'Hay un viaje disponible',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true
    });
});

const CACHE_NAME = 'mototaxi-guayabal-v5';

// Archivos que se cachean para funcionar offline
const ARCHIVOS_CACHE = [
  '/sesion.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// ── INSTALL: cachear archivos estáticos ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS_CACHE);
    }).catch(err => console.warn('SW install error:', err))
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpiar caches viejos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: network first, cache fallback ──
// Firebase y Font Awesome van siempre por red
// El HTML se sirve desde cache si no hay red
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Firebase siempre por red — nunca cachear datos en tiempo real
  if (url.includes('firestore.googleapis.com') ||
      url.includes('firebase') ||
      url.includes('google.com/maps')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Font Awesome y CDN — network first, cache fallback
  if (url.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Archivos locales — cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
