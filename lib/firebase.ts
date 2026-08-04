import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBak-U4x0HySyQ40mZne3923KOkuwmQhtI",
  authDomain: "souk-albalat-drive.firebaseapp.com",
  projectId: "souk-albalat-drive",
  storageBucket: "souk-albalat-drive.firebasestorage.app",
  messagingSenderId: "277858300469",
  appId: "1:277858300469:web:d6be5aa984585f805c377c",
  measurementId: "G-M3PMZPWQTL"
};

// Initialize Firebase app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
