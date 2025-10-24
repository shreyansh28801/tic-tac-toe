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

    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.log('ℹ️  Firebase credentials not configured. Running without persistence.');
      console.log('   → Leaderboard data will be stored in memory only.');
      console.log('   → Data will reset on server restart.');
      console.log('   → To enable persistence, add Firebase env variables.');
      return null;
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
    console.log('   → Leaderboard data will persist across restarts');
    return admin.app();
  } catch (error) {
    console.log('⚠️  Firebase initialization failed:', error.message);
    console.log('   → Running without persistence');
    return null;
  }
};

const firebaseApp = initializeFirebase();
const db = firebaseApp ? admin.firestore() : null;

export { admin, db };

