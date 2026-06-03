import admin from "firebase-admin";
import { DatabaseHealth } from "../types/arduino";

let initialized = false;
let initMessage = "Firebase no inicializado";

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

function hasServiceAccountEnv(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function initializeFirebase(): void {
  const enabled = process.env.FIREBASE_ENABLED === "true";

  if (!enabled) {
    initMessage = "Firebase deshabilitado por FIREBASE_ENABLED=false";
    console.warn(`[FIREBASE] ${initMessage}`);
    return;
  }

  if (admin.apps.length > 0) {
    initialized = true;
    initMessage = "Firebase ya estaba inicializado";
    return;
  }

  try {
    if (hasServiceAccountEnv()) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || ""),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || undefined,
        databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
      });
    } else {
      initialized = false;
      initMessage =
        "Firebase habilitado pero sin credenciales. Configura variables FIREBASE_* o GOOGLE_APPLICATION_CREDENTIALS.";
      console.warn(`[FIREBASE] ${initMessage}`);
      return;
    }

    initialized = true;
    initMessage = "Firebase inicializado correctamente";
    console.log(`[FIREBASE] ${initMessage}`);
  } catch (error) {
    initialized = false;
    initMessage =
      error instanceof Error
        ? `Error inicializando Firebase: ${error.message}`
        : "Error desconocido inicializando Firebase";
    console.warn(`[FIREBASE] ${initMessage}`);
  }
}

export function getFirestore(): FirebaseFirestore.Firestore | null {
  if (!initialized) return null;
  return admin.firestore();
}

export function getFirebaseHealth(): DatabaseHealth {
  const enabled = process.env.FIREBASE_ENABLED === "true";
  const configured =
    hasServiceAccountEnv() || Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  return {
    enabled,
    configured,
    connected: initialized,
    message: initMessage,
  };
}
