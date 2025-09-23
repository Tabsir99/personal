import "server-only";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function initFirebase() {
  if (!getApps().length) {
    const pathToFireBaseJSON = JSON.parse(
      process.env.FIREBASE_ADMIN_CONFIG as string
    );

    const app = initializeApp({
      credential: cert(pathToFireBaseJSON),
    });

    const db = getFirestore(app);
    const adminAuth = getAuth(app);

    return { app, db, adminAuth };
  }

  const app = getApps()[0];
  return {
    app,
    db: getFirestore(app),
    adminAuth: getAuth(app),
  };
}

export const firebaseAdmin = initFirebase();
export const { db, adminAuth } = firebaseAdmin;
