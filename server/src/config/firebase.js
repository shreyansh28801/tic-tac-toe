import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // Initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    console.log('✅ Firebase Admin initialized successfully');
    return admin.app();
  } catch (error) {
    console.log('⚠️  Firebase Admin initialization skipped (optional for local dev):', error.message);
    return null;
  }
};

const firebaseApp = initializeFirebase();
const db = firebaseApp ? admin.firestore() : null;

export { admin, db };

