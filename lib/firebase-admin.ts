import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Parse service account from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    db = getFirestore(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
  }

  return { app, db };
}

// Export singleton instance
export const { app: adminApp, db: adminDb } = initializeFirebaseAdmin();
