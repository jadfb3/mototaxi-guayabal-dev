importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB117FiWsQTCqbqC8LFPSzPKepHXn4eXcM",
    authDomain: "delivery-e3221.firebaseapp.com",
    projectId: "delivery-e3221",
    storageBucket: "delivery-e3221.firebasestorage.app",
    messagingSenderId: "555123509664",
    appId: "1:555123509664:web:8aaaed8f301f81ecc93cc5"
});

const messaging = firebase.messaging();

// Notificación cuando la app está en background
messaging.onBackgroundMessage(payload => {
    self.registration.showNotification(
        payload.data?.title || payload.notification?.title || '🛵 Nuevo viaje',
        {
            body:    payload.data?.body || payload.notification?.body || '¡Hay un viaje disponible!',
            icon:    '/icon-192.png',
            badge:   '/icon-192.png',
            vibrate: [300, 100, 300, 100, 300, 100, 400],
            requireInteraction: true,
            silent: false,
            data: {
                url: '/sesion.html',
                android_channel_id: 'mototaxi_alarma_v6'
            },
            // Canal de Android con sonido de alarma
            android_channel_id: 'mototaxi_alarma_v6'
        }
    );
});

// Al tocar la notificación, abrir la app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
            for (const client of lista) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/sesion.html');
        })
    );
});
