import "server-only";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
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
    const bucket = getStorage(app).bucket("gs://tabsir-s-blog.appspot.com");
    const adminAuth = getAuth(app);

    // if (process.env.NODE_ENV === "development") {
    //   db.settings({
    //     host: "localhost:8080",
    //     ssl: false,
    //   });
    // }

    return { app, db, bucket, adminAuth };
  }

  const app = getApps()[0];
  return {
    app,
    db: getFirestore(app),
    bucket: getStorage(app).bucket("gs://tabsir-s-blog.appspot.com"),
    adminAuth: getAuth(app),
  };
}

export const firebaseAdmin = initFirebase();
export const { db, bucket, adminAuth } = firebaseAdmin;
