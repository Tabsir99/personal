// import "server-only";
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.server";

function initFirebase() {
  if (getApps().length) return getFirestore(getApps()[0]);

  let app: App;
  if (env.RUNTIME === "local") {
    app = initializeApp({
      projectId: "tabsir-s-blog",
    });
  } else {
    app = initializeApp({
      credential: cert({
        projectId: "tabsir-s-blog",
        privateKey: env.FIREBASE_PRIVATE_KEY,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  const db = getFirestore(app);

  if (env.RUNTIME === "local") {
    db.settings({
      host: "localhost:8085",
      ssl: false,
    });
  }

  return db;
}

export const db = initFirebase();
