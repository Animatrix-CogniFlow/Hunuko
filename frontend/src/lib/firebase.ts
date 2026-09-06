// ============================================================
// Firebase initialisation — imported once, used everywhere
// via authService and firestoreService (never directly).
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== "your_firebase_web_api_key"
    ? import.meta.env.VITE_FIREBASE_API_KEY
    : "AIzaSyDummyKeyForLocalDevelopmentAndPreview00",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hunuko-demo.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "hunuko-demo",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hunuko-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

const app  = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);