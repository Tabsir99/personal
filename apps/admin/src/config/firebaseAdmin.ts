import "server-only";
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
      credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CONFIG!)),
    });
  }

  const db = getFirestore(app);

  if (env.RUNTIME === "local") {
    db.settings({
      host: "localhost:8080",
      ssl: false,
    });
  }

  return db;
}

export const db = initFirebase();
