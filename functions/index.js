const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.nuevoViaje = onDocumentCreated("viajes/{viajeId}", async (event) => {
  const viaje = event.data.data();
  if (viaje.estado !== "abierto") return;

  const db = getFirestore();
  const messaging = getMessaging();

  const snapshot = await db
    .collection("motorizados")
    .where("estado", "==", "disponible")
    .where("desactivado", "==", false)
    .get();

  if (snapshot.empty) return;

  const tokens = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.fcmToken) tokens.push(data.fcmToken);
  });

  if (tokens.length === 0) return;

  const mensaje = {
    tokens,
    android: {
      priority: "high",
      notification: {
        channelId: "mototaxi_alarma_v6",
        sound: "alarma",
      },
    },
    data: {
      tipo: "nuevo_viaje",
      viajeId: event.params.viajeId,
      title: "🛵 Nuevo viaje disponible",
      body: `${viaje.cliente?.nombre || "Cliente"} — ${viaje.cliente?.barrio || ""}`,
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(mensaje);
    console.log(`✅ Viajes enviados: ${response.successCount}, Fallidos: ${response.failureCount}`);
  } catch (error) {
    console.error("Error enviando notificaciones viaje:", error);
  }
});

exports.nuevaCarrera = onDocumentCreated("carreras/{carreraId}", async (event) => {
  const carrera = event.data.data();
  if (carrera.estado !== "abierto") return;

  const db = getFirestore();
  const messaging = getMessaging();

  const snapshot = await db
    .collection("motorizados")
    .where("estado", "==", "disponible")
    .where("desactivado", "==", false)
    .get();

  if (snapshot.empty) return;

  const tokens = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.fcmToken) tokens.push(data.fcmToken);
  });

  if (tokens.length === 0) return;

  const mensaje = {
    tokens,
    android: {
      priority: "high",
      notification: {
        channelId: "mototaxi_alarma_v6",
        sound: "alarma",
      },
    },
    data: {
      tipo: "nueva_carrera",
      carreraId: event.params.carreraId,
      title: "📦 Nueva carrera disponible",
      body: `${carrera.restaurante || "Restaurante"} → ${carrera.cliente?.barrio || ""}`,
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(mensaje);
    console.log(`✅ Carreras enviadas: ${response.successCount}`);
  } catch (error) {
    console.error("Error enviando notificaciones carrera:", error);
  }
});
