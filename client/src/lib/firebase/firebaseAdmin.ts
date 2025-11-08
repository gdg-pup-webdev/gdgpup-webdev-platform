import { initializeApp, getApps, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,  
  client_email: process.env.FIREBASE_CLIENT_EMAIL, 
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),  
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount as string | ServiceAccount),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
